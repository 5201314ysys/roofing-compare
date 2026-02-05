// API route to search companies with real data
// GET /api/companies/search?q=&state=&industry=&page=

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const state = searchParams.get('state') || '';
    const industry = searchParams.get('industry') || '';
    const sortBy = searchParams.get('sort') || 'rating';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let dbQuery = supabase
      .from('companies')
      .select(`
        id,
        name,
        legal_name,
        entity_type,
        status,
        city,
        state,
        phone,
        website,
        rating,
        review_count,
        verified,
        ceo,
        employee_count,
        avg_price,
        bbb_rating,
        bbb_accredited,
        data_quality_score,
        formation_date,
        industries (
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,legal_name.ilike.%${query}%`);
    }

    if (state) {
      dbQuery = dbQuery.eq('state', state.toUpperCase());
    }

    if (industry) {
      dbQuery = dbQuery.eq('industry_id', industry);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        dbQuery = dbQuery.order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'reviews':
        dbQuery = dbQuery.order('review_count', { ascending: false, nullsFirst: false });
        break;
      case 'price_low':
        dbQuery = dbQuery.order('avg_price', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        dbQuery = dbQuery.order('avg_price', { ascending: false, nullsFirst: false });
        break;
      case 'quality':
        dbQuery = dbQuery.order('data_quality_score', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
      default:
        dbQuery = dbQuery.order('rating', { ascending: false, nullsFirst: false });
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Enhance results with additional data
    const enhancedCompanies = await Promise.all(
      (companies || []).map(async (company) => {
        // Get ratings breakdown
        const { data: ratings } = await supabase
          .from('company_ratings')
          .select('source, rating, review_count')
          .eq('company_id', company.id);

        // Get active license count
        const { count: licenseCount } = await supabase
          .from('company_licenses')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('status', 'Active');

        return {
          ...company,
          ratingSources: ratings || [],
          activeLicenses: licenseCount || 0,
        };
      })
    );

    return NextResponse.json({
      companies: enhancedCompanies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        query,
        state,
        industry,
        sortBy,
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
