// API route to fetch company data with complete information
// GET /api/companies/[id]

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch main company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        industries (
          name,
          slug
        ),
        states!state (
          name,
          code
        )
      `)
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch executives
    const { data: executives } = await supabase
      .from('company_executives')
      .select('*')
      .eq('company_id', id)
      .eq('is_current', true)
      .order('title');

    // Fetch licenses
    const { data: licenses } = await supabase
      .from('company_licenses')
      .select('*')
      .eq('company_id', id)
      .order('expiry_date', { ascending: false });

    // Fetch ratings from all sources
    const { data: ratings } = await supabase
      .from('company_ratings')
      .select('*')
      .eq('company_id', id);

    // Fetch financial history
    const { data: financials } = await supabase
      .from('company_financials')
      .select('*')
      .eq('company_id', id)
      .order('fiscal_year', { ascending: false })
      .limit(5);

    // Fetch legal records (if user has premium access)
    const { data: legalRecords } = await supabase
      .from('company_legal_records')
      .select('*')
      .eq('company_id', id)
      .order('filing_date', { ascending: false })
      .limit(10);

    // Fetch safety records
    const { data: safetyRecords } = await supabase
      .from('company_safety_records')
      .select('*')
      .eq('company_id', id)
      .order('inspection_date', { ascending: false })
      .limit(10);

    // Fetch relationships (parent/subsidiaries)
    const { data: parentRelation } = await supabase
      .from('company_relationships')
      .select(`
        parent_company_id,
        relationship_type,
        ownership_percentage,
        parent:companies!parent_company_id (
          id,
          name
        )
      `)
      .eq('child_company_id', id)
      .single();

    const { data: subsidiaries } = await supabase
      .from('company_relationships')
      .select(`
        child_company_id,
        relationship_type,
        ownership_percentage,
        child:companies!child_company_id (
          id,
          name
        )
      `)
      .eq('parent_company_id', id);

    // Fetch recent permits/projects
    const { data: permits } = await supabase
      .from('permits')
      .select('*')
      .eq('company_id', id)
      .order('issue_date', { ascending: false })
      .limit(20);

    // Fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate overall rating from all sources
    let overallRating = company.rating;
    let totalReviews = company.review_count || 0;
    
    if (ratings && ratings.length > 0) {
      const weightedSum = ratings.reduce((sum, r) => sum + (r.rating / r.max_rating * 5) * r.review_count, 0);
      const totalWeight = ratings.reduce((sum, r) => sum + r.review_count, 0);
      if (totalWeight > 0) {
        overallRating = parseFloat((weightedSum / totalWeight).toFixed(2));
        totalReviews = totalWeight;
      }
    }

    // Build comprehensive response
    const response = {
      ...company,
      
      // Executives
      executives: executives || [],
      ceo: executives?.find(e => e.title?.toLowerCase().includes('ceo') || e.title?.toLowerCase().includes('president'))?.name || company.ceo,
      
      // Licenses
      licenses: licenses || [],
      activeLicenses: licenses?.filter(l => l.status === 'Active').length || 0,
      
      // Ratings breakdown
      ratingsBreakdown: ratings || [],
      overallRating,
      totalReviews,
      
      // Financial
      financialHistory: financials || [],
      latestFinancials: financials?.[0] || null,
      
      // Legal & Safety
      legalRecords: legalRecords || [],
      safetyRecords: safetyRecords || [],
      hasLegalIssues: (legalRecords?.length || 0) > 0,
      hasSafetyViolations: safetyRecords?.some(s => s.status === 'open') || false,
      
      // Relationships
      parentCompany: parentRelation?.parent || null,
      subsidiaries: subsidiaries?.map(s => s.child) || [],
      
      // Projects & Reviews
      recentProjects: permits || [],
      projectCount: permits?.length || 0,
      reviews: reviews || [],
      
      // Data quality indicators
      dataQualityScore: company.data_quality_score || 0,
      dataSources: company.data_sources || [],
      lastUpdated: company.last_data_update || company.updated_at,
      isVerified: company.verified || false,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
