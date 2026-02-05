import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase instance (for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server Supabase instance (for API routes and data scraping)
export const createServerSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
};

// Database table name constants
export const TABLES = {
  // Basic configuration
  INDUSTRIES: 'industries',
  STATES: 'states',
  REGIONS: 'regions',
  
  // User system
  USERS: 'users',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  SUBSCRIPTIONS: 'subscriptions',
  
  // Company data
  COMPANIES: 'companies',
  COMPANY_CONTACTS: 'company_contacts',
  COMPANY_FINANCIALS: 'company_financials',
  
  // Prices and projects
  PRICE_RECORDS: 'price_records',
  PRICE_HISTORY: 'price_history',
  PERMITS: 'permits',
  
  // User interaction
  REVIEWS: 'reviews',
  SAVED_COMPANIES: 'saved_companies',
  PRICE_ALERTS: 'price_alerts',
  SEARCH_LOGS: 'search_logs',
} as const;

// Type export
export type Tables = typeof TABLES[keyof typeof TABLES];
