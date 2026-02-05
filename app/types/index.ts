// ==========================================
// BizCompare Pro - Type Definitions
// US Business Price Comparison and Transparency Platform
// ==========================================

// ==========================================
// Subscription Related Types
// ==========================================

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

// ==========================================
// User Type
// ==========================================

export interface User {
  id: string;
  auth_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  
  // Subscription info
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  
  // Usage statistics
  searches_this_month: number;
  price_unlocks_this_month: number;
  last_search_reset?: string;
  
  // Preferences
  preferred_industries?: string[];
  preferred_states?: string[];
  email_notifications: boolean;
  
  // System fields
  is_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Subscription Plan Type
// ==========================================

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  
  // Feature limits
  searches_per_month: number;
  price_unlocks_per_month: number;
  saved_companies_limit: number;
  export_enabled: boolean;
  api_access: boolean;
  priority_support: boolean;
  company_reports: boolean;
  financial_data: boolean;
  contact_info: boolean;
  historical_data: boolean;
  
  // Stripe
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: SubscriptionTier;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  
  stripe_subscription_id?: string;
  stripe_invoice_id?: string;
  
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  
  amount: number;
  currency: string;
  created_at: string;
}

// ==========================================
// Industry Type
// ==========================================

export interface Industry {
  id: string;
  name: string;
  name_zh?: string;
  slug: string;
  icon: string;
  description?: string;
  description_zh?: string;
  parent_id?: string;
  company_count: number;
  avg_price_change: number;
  default_price_unit?: string;
  data_sources?: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Geographic Location Type
// ==========================================

export interface State {
  code: string;
  name: string;
  region: string;
  population?: number;
  company_count: number;
  avg_income?: number;
  is_active: boolean;
}

export interface Region {
  id: string;
  name: string;
  state_code: string;
  state_name?: string;
  county?: string;
  zip_codes?: string[];
  population?: number;
  is_metro: boolean;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  company_count: number;
}

// ==========================================
// Company Type
// ==========================================

export interface Company {
  id: string;
  
  // Basic info
  name: string;
  slug: string;
  legal_name?: string;
  dba_name?: string;
  initial: string;
  
  // Industry and region
  industry_id: string;
  industry?: Industry;
  sub_industry_id?: string;
  state_code: string;
  state?: State;
  city: string;
  zip_code?: string;
  address?: string;
  address_line2?: string;
  
  // Contact info (some only visible to members)
  phone?: string;
  phone_secondary?: string;
  fax?: string;
  email?: string;
  website?: string;
  
  // Social media
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  yelp_url?: string;
  
  // Company details
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  
  // Registration and license info (similar to Tianyancha)
  ein?: string;
  license_number?: string;
  license_type?: string;
  license_state?: string;
  license_expiry?: string;
  business_type?: string;
  entity_type?: string;
  registration_state?: string;
  registration_number?: string;
  registration_date?: string;
  
  // Company size
  founded_year?: number;
  employee_count?: number;
  employee_range?: string;
  annual_revenue?: number;
  revenue_range?: string;
  
  // Certification and rating
  is_verified: boolean;
  verified_at?: string;
  insurance_verified: boolean;
  bonded: boolean;
  bbb_rating?: string;
  bbb_accredited: boolean;
  
  // Rating
  rating?: number;
  review_count: number;
  
  // Service info
  service_areas?: string[];
  specialties?: string[];
  certifications?: string[];
  brands_carried?: string[];
  languages_spoken?: string[];
  payment_methods?: string[];
  financing_available: boolean;
  
  // Business info
  business_hours?: Record<string, string>;
  emergency_service: boolean;
  warranty_years?: number;
  free_estimates: boolean;
  
  // Pricing info (visible to members)
  avg_price?: number;
  min_price?: number;
  max_price?: number;
  price_unit?: string;
  price_trend?: number;
  
  // Project statistics
  total_projects: number;
  total_value: number;
  avg_project_value?: number;
  
  // Data source
  data_source?: string;
  source_url?: string;
  last_scraped_at?: string;
  
  // System fields
  is_featured: boolean;
  is_claimed: boolean;
  claimed_by?: string;
  is_active: boolean;
  view_count: number;
  
  created_at: string;
  updated_at: string;
}

// Company contacts (premium members)
export interface CompanyContact {
  id: string;
  company_id: string;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Company financial data (enterprise members)
export interface CompanyFinancials {
  id: string;
  company_id: string;
  fiscal_year: number;
  revenue?: number;
  net_income?: number;
  gross_profit?: number;
  operating_income?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  employee_count?: number;
  revenue_per_employee?: number;
  data_source?: string;
  is_estimated: boolean;
  created_at: string;
}

// ==========================================
// Price Related Types
// ==========================================

export interface PriceRecord {
  id: string;
  company_id: string;
  company?: Company;
  
  service_type: string;
  service_description?: string;
  
  price: number;
  price_unit: string;
  min_price?: number;
  max_price?: number;
  
  region_id?: string;
  state_code?: string;
  
  recorded_at: string;
  valid_until?: string;
  
  data_source?: string;
  source_url?: string;
  is_verified: boolean;
  
  notes?: string;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  company_id: string;
  service_type: string;
  
  avg_price: number;
  min_price?: number;
  max_price?: number;
  price_unit: string;
  
  sample_count: number;
  month: string;
  
  created_at: string;
}

// Price comparison
export interface PriceComparison {
  company_id: string;
  company_name: string;
  company_slug: string;
  price: number;
  price_unit: string;
  rating?: number;
  review_count: number;
  is_verified: boolean;
  total_projects: number;
  city: string;
  state_code: string;
}

// Price trend
export interface PriceTrend {
  month: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_count: number;
}

// ==========================================
// Permit/Project Types
// ==========================================

export interface Permit {
  id: string;
  company_id: string;
  company?: Company;
  
  permit_number?: string;
  permit_type?: string;
  work_type?: string;
  
  city: string;
  state_code: string;
  address?: string;
  
  description?: string;
  reported_cost?: number;
  sqft?: number;
  
  issue_date: string;
  completion_date?: string;
  expiry_date?: string;
  status?: string;
  
  contractor_name?: string;
  owner_name?: string;
  
  data_source?: string;
  source_url?: string;
  raw_data?: Record<string, unknown>;
  
  created_at: string;
}

// ==========================================
// Review Type
// ==========================================

export interface Review {
  id: string;
  company_id: string;
  user_id?: string;
  
  user_name: string;
  user_location?: string;
  
  rating: number;
  title?: string;
  content: string;
  
  pros?: string[];
  cons?: string[];
  
  service_type?: string;
  project_cost?: number;
  project_date?: string;
  
  would_recommend: boolean;
  verified_purchase: boolean;
  
  helpful_count: number;
  report_count: number;
  
  status: 'pending' | 'published' | 'hidden' | 'reported';
  
  response?: string;
  response_at?: string;
  
  data_source?: string;
  source_url?: string;
  
  created_at: string;
  updated_at: string;
}

// ==========================================
// User Interaction Types
// ==========================================

export interface SavedCompany {
  id: string;
  user_id: string;
  company_id: string;
  company?: Company;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  company_id?: string;
  industry_id?: string;
  state_code?: string;
  service_type?: string;
  target_price?: number;
  alert_type: 'below' | 'above' | 'change';
  change_threshold?: number;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface SearchLog {
  id: string;
  user_id?: string;
  query?: string;
  industry_id?: string;
  state_code?: string;
  city?: string;
  filters?: SearchFilters;
  result_count: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ==========================================
// Search Related Types
// ==========================================

export interface SearchFilters {
  query?: string;
  industry_id?: string;
  industry_slug?: string;
  state_code?: string;
  city?: string;
  zip_code?: string;
  min_rating?: number;
  max_rating?: number;
  min_projects?: number;
  max_projects?: number;
  min_price?: number;
  max_price?: number;
  is_verified?: boolean;
  has_warranty?: boolean;
  emergency_service?: boolean;
  free_estimates?: boolean;
  is_featured?: boolean;
  sort_by?: 'rating' | 'projects' | 'price_low' | 'price_high' | 'name' | 'updated' | 'reviews';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  per_page: number;
  filters: SearchFilters;
  facets?: SearchFacets;
}

export interface SearchFacets {
  industries: { id: string; name: string; count: number }[];
  states: { code: string; name: string; count: number }[];
  cities: { name: string; count: number }[];
  price_ranges: { label: string; min: number; max: number; count: number }[];
  rating_ranges: { label: string; min: number; max: number; count: number }[];
}

// ==========================================
// Statistics Types
// ==========================================

export interface MarketStats {
  total_companies: number;
  total_industries: number;
  total_states: number;
  total_cities: number;
  total_projects: number;
  total_reviews: number;
  avg_price_change: number;
  last_updated: string;
}

export interface IndustryStats {
  industry_id: string;
  industry_name: string;
  industry_slug: string;
  icon: string;
  company_count: number;
  state_count: number;
  avg_rating: number;
  avg_price: number;
  price_unit: string;
  price_trend: number;
  top_states: { code: string; name: string; count: number }[];
  last_updated: string;
}

export interface StateStats {
  state_code: string;
  state_name: string;
  region: string;
  company_count: number;
  industry_count: number;
  avg_rating: number;
  avg_price: number;
  top_industries: { id: string; name: string; count: number }[];
  top_cities: { name: string; count: number }[];
  last_updated: string;
}

export interface CompanyStats {
  total_projects: number;
  total_value: number;
  avg_project_value: number;
  total_reviews: number;
  avg_rating: number;
  price_trend: number;
  monthly_projects: { month: string; count: number; value: number }[];
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ==========================================
// Form Types
// ==========================================

export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupForm {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
  agree_terms: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

export interface ReviewForm {
  company_id: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  service_type?: string;
  project_cost?: number;
  project_date?: string;
  would_recommend: boolean;
}

// ==========================================
// Utility Types
// ==========================================

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ==========================================
// Constants
// ==========================================

export const PRICE_UNITS = {
  'per sqft': '/sq ft',
  'per hour': '/hour',
  'per project': '/project',
  'per unit': '/unit',
  'per visit': '/visit',
  'per item': '/item',
  'per meal': '/meal',
  'per transaction': '/transaction',
} as const;

export const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+',
] as const;

export const REVENUE_RANGES = [
  '<$1M',
  '$1M-$5M',
  '$5M-$10M',
  '$10M-$50M',
  '$50M-$100M',
  '$100M-$500M',
  '$500M+',
] as const;

export const US_REGIONS = {
  West: ['CA', 'WA', 'OR', 'NV', 'AZ', 'UT', 'CO', 'NM', 'ID', 'MT', 'WY', 'AK', 'HI'],
  Midwest: ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'SD', 'ND'],
  South: ['TX', 'FL', 'GA', 'NC', 'VA', 'TN', 'AL', 'SC', 'LA', 'KY', 'OK', 'AR', 'MS', 'WV'],
  East: ['NY', 'PA', 'NJ', 'MA', 'MD', 'CT', 'NH', 'ME', 'VT', 'RI', 'DE', 'DC'],
} as const;
