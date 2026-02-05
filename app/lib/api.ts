// ==========================================
// BizCompare Pro - API Service Layer
// ==========================================

import { supabase, TABLES } from './supabase';
import type {
  Company,
  Industry,
  State,
  Region,
  PriceRecord,
  PriceHistory,
  Permit,
  Review,
  User,
  SubscriptionPlan,
  SearchFilters,
  SearchResult,
  MarketStats,
  PaginatedResponse,
  SavedCompany,
} from '../types';

// ==========================================
// Industry API
// ==========================================

export async function getIndustries(): Promise<Industry[]> {
  const { data, error } = await supabase
    .from(TABLES.INDUSTRIES)
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data || [];
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  const { data, error } = await supabase
    .from(TABLES.INDUSTRIES)
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
}

export async function getIndustryStats(industryId: string) {
  const { data, error } = await supabase
    .from('industry_stats')
    .select('*')
    .eq('id', industryId)
    .single();
  
  if (error) return null;
  return data;
}

// ==========================================
// State/Region API
// ==========================================

export async function getStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from(TABLES.STATES)
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getStateByCode(code: string): Promise<State | null> {
  const { data, error } = await supabase
    .from(TABLES.STATES)
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  
  if (error) return null;
  return data;
}

export async function getRegionsByState(stateCode: string): Promise<Region[]> {
  const { data, error } = await supabase
    .from(TABLES.REGIONS)
    .select('*')
    .eq('state_code', stateCode.toUpperCase())
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getCitiesByState(stateCode: string): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLES.COMPANIES)
    .select('city')
    .eq('state_code', stateCode.toUpperCase())
    .eq('is_active', true);
  
  if (error) throw error;
  
  const cities = [...new Set(data?.map(c => c.city).filter(Boolean))];
  return cities.sort();
}

// ==========================================
// Company API
// ==========================================

export async function searchCompanies(
  filters: SearchFilters,
  page: number = 1,
  perPage: number = 20
): Promise<SearchResult> {
  let query = supabase
    .from(TABLES.COMPANIES)
    .select('*, industries!inner(name, slug, icon)', { count: 'exact' })
    .eq('is_active', true);
  
  // Apply filters
  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`);
  }
  
  if (filters.industry_id) {
    query = query.eq('industry_id', filters.industry_id);
  }
  
  if (filters.industry_slug) {
    query = query.eq('industries.slug', filters.industry_slug);
  }
  
  if (filters.state_code) {
    query = query.eq('state_code', filters.state_code.toUpperCase());
  }
  
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  
  if (filters.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }
  
  if (filters.min_projects) {
    query = query.gte('total_projects', filters.min_projects);
  }
  
  if (filters.is_verified) {
    query = query.eq('is_verified', true);
  }
  
  if (filters.emergency_service) {
    query = query.eq('emergency_service', true);
  }
  
  if (filters.free_estimates) {
    query = query.eq('free_estimates', true);
  }
  
  if (filters.is_featured) {
    query = query.eq('is_featured', true);
  }
  
  // Sort
  const sortField = filters.sort_by || 'rating';
  const sortOrder = filters.sort_order || 'desc';
  
  const sortMap: Record<string, string> = {
    rating: 'rating',
    projects: 'total_projects',
    price_low: 'avg_price',
    price_high: 'avg_price',
    name: 'name',
    updated: 'updated_at',
    reviews: 'review_count',
  };
  
  const sortColumn = sortMap[sortField] || 'rating';
  const ascending = sortField === 'price_low' || sortField === 'name' || sortOrder === 'asc';
  
  query = query.order(sortColumn, { ascending, nullsFirst: false });
  
  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    companies: data || [],
    total: count || 0,
    page,
    per_page: perPage,
    filters,
  };
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from(TABLES.COMPANIES)
    .select(`
      *,
      industries(id, name, slug, icon),
      states(code, name, region)
    `)
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from(TABLES.COMPANIES)
    .select(`
      *,
      industries(id, name, slug, icon),
      states(code, name, region)
    `)
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

export async function getFeaturedCompanies(limit: number = 10): Promise<Company[]> {
  const { data, error } = await supabase
    .from(TABLES.COMPANIES)
    .select(`
      *,
      industries(id, name, slug, icon)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getTopCompanies(
  industrySlug?: string,
  stateCode?: string,
  limit: number = 20
): Promise<Company[]> {
  let query = supabase
    .from(TABLES.COMPANIES)
    .select(`
      *,
      industries!inner(id, name, slug, icon)
    `)
    .eq('is_active', true)
    .gte('total_projects', 3);
  
  if (industrySlug) {
    query = query.eq('industries.slug', industrySlug);
  }
  
  if (stateCode) {
    query = query.eq('state_code', stateCode.toUpperCase());
  }
  
  const { data, error } = await query
    .order('rating', { ascending: false, nullsFirst: false })
    .order('total_projects', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function incrementCompanyViews(companyId: string): Promise<void> {
  await supabase.rpc('increment_company_views', { company_id: companyId });
}

// ==========================================
// Price API
// ==========================================

export async function getCompanyPrices(companyId: string): Promise<PriceRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.PRICE_RECORDS)
    .select('*')
    .eq('company_id', companyId)
    .order('recorded_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getCompanyPriceHistory(
  companyId: string,
  serviceType?: string,
  months: number = 12
): Promise<PriceHistory[]> {
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - months);
  
  let query = supabase
    .from(TABLES.PRICE_HISTORY)
    .select('*')
    .eq('company_id', companyId)
    .gte('month', fromDate.toISOString().slice(0, 10))
    .order('month', { ascending: true });
  
  if (serviceType) {
    query = query.eq('service_type', serviceType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function comparePrices(
  industrySlug: string,
  stateCode?: string,
  serviceType?: string,
  limit: number = 20
): Promise<Company[]> {
  let query = supabase
    .from(TABLES.COMPANIES)
    .select(`
      id, name, slug, city, state_code,
      avg_price, min_price, max_price, price_unit,
      rating, review_count, total_projects, is_verified,
      industries!inner(slug)
    `)
    .eq('is_active', true)
    .eq('industries.slug', industrySlug)
    .not('avg_price', 'is', null);
  
  if (stateCode) {
    query = query.eq('state_code', stateCode.toUpperCase());
  }
  
  const { data, error } = await query
    .order('avg_price', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// ==========================================
// Permit/Project API
// ==========================================

export async function getCompanyPermits(
  companyId: string,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedResponse<Permit>> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  const { data, error, count } = await supabase
    .from(TABLES.PERMITS)
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('issue_date', { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  
  const total = count || 0;
  
  return {
    items: data || [],
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
    has_next: page * perPage < total,
    has_prev: page > 1,
  };
}

export async function getRecentPermits(
  stateCode?: string,
  limit: number = 20
): Promise<Permit[]> {
  let query = supabase
    .from(TABLES.PERMITS)
    .select(`
      *,
      companies(id, name, slug)
    `)
    .order('issue_date', { ascending: false });
  
  if (stateCode) {
    query = query.eq('state_code', stateCode.toUpperCase());
  }
  
  const { data, error } = await query.limit(limit);
  
  if (error) throw error;
  return data || [];
}

// ==========================================
// Review API
// ==========================================

export async function getCompanyReviews(
  companyId: string,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<Review>> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  const { data, error, count } = await supabase
    .from(TABLES.REVIEWS)
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  
  const total = count || 0;
  
  return {
    items: data || [],
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
    has_next: page * perPage < total,
    has_prev: page > 1,
  };
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  const { data, error } = await supabase
    .from(TABLES.REVIEWS)
    .insert(review)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==========================================
// User API
// ==========================================

export async function getUserByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('auth_id', authId)
    .single();
  
  if (error) return null;
  return data;
}

export async function createUser(user: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .insert(user)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==========================================
// Saved Companies API
// ==========================================

export async function getSavedCompanies(userId: string): Promise<SavedCompany[]> {
  const { data, error } = await supabase
    .from(TABLES.SAVED_COMPANIES)
    .select(`
      *,
      companies(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function saveCompany(userId: string, companyId: string, notes?: string): Promise<SavedCompany> {
  const { data, error } = await supabase
    .from(TABLES.SAVED_COMPANIES)
    .insert({ user_id: userId, company_id: companyId, notes })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function unsaveCompany(userId: string, companyId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLES.SAVED_COMPANIES)
    .delete()
    .eq('user_id', userId)
    .eq('company_id', companyId);
  
  if (error) throw error;
}

export async function isCompanySaved(userId: string, companyId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from(TABLES.SAVED_COMPANIES)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('company_id', companyId);
  
  if (error) return false;
  return (count || 0) > 0;
}

// ==========================================
// Statistics API
// ==========================================

export async function getMarketStats(): Promise<MarketStats> {
  const [companiesRes, industriesRes, statesRes, reviewsRes] = await Promise.all([
    supabase.from(TABLES.COMPANIES).select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from(TABLES.INDUSTRIES).select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from(TABLES.STATES).select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from(TABLES.REVIEWS).select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  
  // Get city count
  const { data: citiesData } = await supabase
    .from(TABLES.COMPANIES)
    .select('city')
    .eq('is_active', true);
  
  const uniqueCities = new Set(citiesData?.map(c => c.city).filter(Boolean));
  
  // Get total projects
  const { data: projectsData } = await supabase
    .from(TABLES.COMPANIES)
    .select('total_projects')
    .eq('is_active', true);
  
  const totalProjects = projectsData?.reduce((sum, c) => sum + (c.total_projects || 0), 0) || 0;
  
  return {
    total_companies: companiesRes.count || 0,
    total_industries: industriesRes.count || 0,
    total_states: statesRes.count || 0,
    total_cities: uniqueCities.size,
    total_projects: totalProjects,
    total_reviews: reviewsRes.count || 0,
    avg_price_change: -2.5, // Can be calculated from database
    last_updated: new Date().toISOString(),
  };
}

// ==========================================
// Search Log API
// ==========================================

export async function logSearch(
  userId: string | null,
  query: string | null,
  filters: SearchFilters,
  resultCount: number
): Promise<void> {
  await supabase.from(TABLES.SEARCH_LOGS).insert({
    user_id: userId,
    query,
    industry_id: filters.industry_id,
    state_code: filters.state_code,
    city: filters.city,
    filters,
    result_count: resultCount,
  });
}

// ==========================================
// Subscription Plan API
// ==========================================

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from(TABLES.SUBSCRIPTION_PLANS)
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data || [];
}
