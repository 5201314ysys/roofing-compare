// ==========================================
// BizCompare Pro - Utility Functions
// ==========================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Industry, State, SubscriptionPlan, SubscriptionTier } from '../types';

// ==========================================
// Style utilities
// ==========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// Formatting utilities
// ==========================================

// Format currency
export function formatCurrency(
  amount: number | undefined | null,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (amount === undefined || amount === null) return 'N/A';
  
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

// Format number
export function formatNumber(
  num: number | undefined | null,
  options: {
    locale?: string;
    notation?: 'standard' | 'compact';
  } = {}
): string {
  if (num === undefined || num === null) return 'N/A';
  
  const { locale = 'en-US', notation = 'standard' } = options;
  
  return new Intl.NumberFormat(locale, { notation }).format(num);
}

// Format percentage
export function formatPercent(
  value: number | undefined | null,
  options: { decimals?: number; showSign?: boolean } = {}
): string {
  if (value === undefined || value === null) return 'N/A';
  
  const { decimals = 1, showSign = true } = options;
  const formatted = Math.abs(value).toFixed(decimals);
  
  if (showSign && value > 0) return `+${formatted}%`;
  if (showSign && value < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

// Format date
export function formatDate(
  date: string | Date | undefined | null,
  options: {
    locale?: string;
    format?: 'short' | 'medium' | 'long' | 'relative';
  } = {}
): string {
  if (!date) return 'N/A';
  
  const { locale = 'en-US', format = 'medium' } = options;
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return formatRelativeTime(d);
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, formatOptions).format(d);
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Format phone number
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return 'N/A';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// ==========================================
// Calculation utilities
// ==========================================

// Calculate savings
export function calculateSavings(
  avgQuote: number | undefined | null,
  contractorPrice: number | undefined | null
): { amount: number; percent: number } | null {
  if (!avgQuote || !contractorPrice) return null;
  
  const amount = avgQuote - contractorPrice;
  const percent = (amount / avgQuote) * 100;
  
  return { amount, percent };
}

// Get rating level
export function getRatingLevel(rating: number | undefined | null): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (!rating) return { label: 'No Rating', color: 'text-gray-500', bgColor: 'bg-gray-100' };
  
  if (rating >= 4.5) return { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100' };
  if (rating >= 4.0) return { label: 'Very Good', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (rating >= 3.5) return { label: 'Good', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  if (rating >= 3.0) return { label: 'Average', color: 'text-orange-700', bgColor: 'bg-orange-100' };
  return { label: 'Below Average', color: 'text-red-700', bgColor: 'bg-red-100' };
}

// Get price trend
export function getPriceTrend(trend: number | undefined | null): {
  direction: 'up' | 'down' | 'stable';
  label: string;
  color: string;
} {
  if (trend === undefined || trend === null || Math.abs(trend) < 1) {
    return { direction: 'stable', label: 'Stable', color: 'text-gray-500' };
  }
  
  if (trend > 0) {
    return { direction: 'up', label: `+${trend.toFixed(1)}%`, color: 'text-red-500' };
  }
  
  return { direction: 'down', label: `${trend.toFixed(1)}%`, color: 'text-green-500' };
}

// ==========================================
// String utilities
// ==========================================

// Generate slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get initial
export function getInitial(name: string | undefined | null): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

// Truncate text
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

// Parse search query
export function parseSearchQuery(query: string): {
  terms: string[];
  filters: Record<string, string>;
} {
  const filters: Record<string, string> = {};
  const terms: string[] = [];
  
  const words = query.split(/\s+/);
  
  for (const word of words) {
    if (word.includes(':')) {
      const [key, value] = word.split(':');
      filters[key.toLowerCase()] = value;
    } else if (word.length > 0) {
      terms.push(word);
    }
  }
  
  return { terms, filters };
}

// ==========================================
// Validation utilities
// ==========================================

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\d{10,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate zip code
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

// ==========================================
// Subscription utilities
// ==========================================

// Subscription plans data
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    price_monthly: 0,
    price_yearly: 0,
    searches_per_month: 10,
    price_unlocks_per_month: 0,
    saved_companies_limit: 5,
    export_enabled: false,
    api_access: false,
    priority_support: false,
    company_reports: false,
    financial_data: false,
    contact_info: false,
    historical_data: false,
    features: [
      'Basic company search',
      'View company profiles',
      'Save up to 5 companies',
      '10 searches per month',
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For individual users',
    price_monthly: 9.99,
    price_yearly: 95.90,
    searches_per_month: 100,
    price_unlocks_per_month: 20,
    saved_companies_limit: 50,
    export_enabled: false,
    api_access: false,
    priority_support: false,
    company_reports: false,
    financial_data: false,
    contact_info: false,
    historical_data: false,
    features: [
      '100 searches per month',
      'Unlock 20 prices per month',
      'Save up to 50 companies',
      'Price trend charts',
      'Email alerts',
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For professionals and businesses',
    price_monthly: 29.99,
    price_yearly: 287.90,
    searches_per_month: 1000,
    price_unlocks_per_month: -1,
    saved_companies_limit: 500,
    export_enabled: true,
    api_access: false,
    priority_support: true,
    company_reports: true,
    financial_data: false,
    contact_info: true,
    historical_data: true,
    features: [
      '1,000 searches per month',
      'Unlimited price unlocks',
      'Save up to 500 companies',
      'Export to CSV/Excel',
      'Company reports',
      'Contact information',
      'Historical price data',
      'Priority support',
    ],
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price_monthly: 99.99,
    price_yearly: 959.90,
    searches_per_month: -1,
    price_unlocks_per_month: -1,
    saved_companies_limit: -1,
    export_enabled: true,
    api_access: true,
    priority_support: true,
    company_reports: true,
    financial_data: true,
    contact_info: true,
    historical_data: true,
    features: [
      'Unlimited searches',
      'Unlimited everything',
      'API access',
      'Financial data',
      'Custom integrations',
      'Dedicated support',
      'Team management',
      'White-label options',
    ],
    is_active: true,
    sort_order: 4,
  },
];

// Get subscription plan
export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  return subscriptionPlans.find(p => p.id === tier) || subscriptionPlans[0];
}

// Check feature access
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof Pick<
    SubscriptionPlan,
    'export_enabled' | 'api_access' | 'priority_support' | 'company_reports' | 'financial_data' | 'contact_info' | 'historical_data'
  >
): boolean {
  const plan = getSubscriptionPlan(tier);
  return plan[feature];
}

// Check usage limit
export function isWithinLimit(current: number, limit: number): boolean {
  return limit === -1 || current < limit;
}

// ==========================================
// Industry data - Comprehensive categories
// ==========================================

export const industries: Industry[] = [
  // Construction & Building
  { id: '1', name: 'Roofing', name_zh: '屋顶工程', slug: 'roofing', icon: '🏠', description: 'Roofing installation, repair, and maintenance services', company_count: 2500, avg_price_change: -5.2, default_price_unit: 'per sqft', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: '2', name: 'General Contracting', name_zh: '综合承包', slug: 'general-contracting', icon: '🏗️', description: 'General construction and renovation services', company_count: 1500, avg_price_change: 4.5, default_price_unit: 'per project', is_active: true, sort_order: 2, created_at: '', updated_at: '' },
  { id: '3', name: 'Foundation & Concrete', name_zh: '地基混凝土', slug: 'foundation-concrete', icon: '🧱', description: 'Foundation repair, concrete work, and structural services', company_count: 1200, avg_price_change: 2.8, default_price_unit: 'per sqft', is_active: true, sort_order: 3, created_at: '', updated_at: '' },
  { id: '4', name: 'Framing & Carpentry', name_zh: '框架木工', slug: 'framing-carpentry', icon: '🪚', description: 'Framing, carpentry, and woodworking services', company_count: 1800, avg_price_change: 1.5, default_price_unit: 'per hour', is_active: true, sort_order: 4, created_at: '', updated_at: '' },
  { id: '5', name: 'Masonry & Brickwork', name_zh: '砌筑砖石', slug: 'masonry-brickwork', icon: '🧱', description: 'Masonry, brickwork, and stonework services', company_count: 950, avg_price_change: 0.8, default_price_unit: 'per sqft', is_active: true, sort_order: 5, created_at: '', updated_at: '' },
  { id: '6', name: 'Demolition', name_zh: '拆除工程', slug: 'demolition', icon: '💥', description: 'Demolition and structural removal services', company_count: 680, avg_price_change: -1.2, default_price_unit: 'per project', is_active: true, sort_order: 6, created_at: '', updated_at: '' },
  
  // Plumbing & HVAC
  { id: '7', name: 'Plumbing', name_zh: '管道服务', slug: 'plumbing', icon: '🔧', description: 'Plumbing installation, repair, and maintenance', company_count: 3200, avg_price_change: 2.1, default_price_unit: 'per hour', is_active: true, sort_order: 7, created_at: '', updated_at: '' },
  { id: '8', name: 'HVAC', name_zh: '暖通空调', slug: 'hvac', icon: '❄️', description: 'Heating, ventilation, and air conditioning services', company_count: 1900, avg_price_change: 3.2, default_price_unit: 'per unit', is_active: true, sort_order: 8, created_at: '', updated_at: '' },
  { id: '9', name: 'Water Heater Service', name_zh: '热水器服务', slug: 'water-heater', icon: '♨️', description: 'Water heater installation, repair, and replacement', company_count: 1100, avg_price_change: 1.8, default_price_unit: 'per unit', is_active: true, sort_order: 9, created_at: '', updated_at: '' },
  { id: '10', name: 'Septic & Sewer', name_zh: '化粪池下水道', slug: 'septic-sewer', icon: '🚰', description: 'Septic system and sewer line services', company_count: 850, avg_price_change: 2.5, default_price_unit: 'per project', is_active: true, sort_order: 10, created_at: '', updated_at: '' },
  
  // Electrical
  { id: '11', name: 'Electrical', name_zh: '电气服务', slug: 'electrical', icon: '⚡', description: 'Electrical installation, repair, and wiring services', company_count: 2800, avg_price_change: 1.5, default_price_unit: 'per hour', is_active: true, sort_order: 11, created_at: '', updated_at: '' },
  { id: '12', name: 'Solar Installation', name_zh: '太阳能安装', slug: 'solar', icon: '☀️', description: 'Solar panel installation and renewable energy services', company_count: 920, avg_price_change: -8.5, default_price_unit: 'per watt', is_active: true, sort_order: 12, created_at: '', updated_at: '' },
  { id: '13', name: 'Generator Services', name_zh: '发电机服务', slug: 'generator', icon: '⚙️', description: 'Generator installation, repair, and maintenance', company_count: 650, avg_price_change: 3.1, default_price_unit: 'per unit', is_active: true, sort_order: 13, created_at: '', updated_at: '' },
  
  // Interior Renovation
  { id: '14', name: 'Flooring', name_zh: '地板工程', slug: 'flooring', icon: '🪵', description: 'Flooring installation including hardwood, tile, carpet', company_count: 2100, avg_price_change: -2.8, default_price_unit: 'per sqft', is_active: true, sort_order: 14, created_at: '', updated_at: '' },
  { id: '15', name: 'Painting', name_zh: '油漆粉刷', slug: 'painting', icon: '🎨', description: 'Interior and exterior painting services', company_count: 4500, avg_price_change: 0.5, default_price_unit: 'per sqft', is_active: true, sort_order: 15, created_at: '', updated_at: '' },
  { id: '16', name: 'Drywall & Plastering', name_zh: '干墙抹灰', slug: 'drywall', icon: '🧱', description: 'Drywall installation, repair, and plastering', company_count: 1350, avg_price_change: 1.2, default_price_unit: 'per sqft', is_active: true, sort_order: 16, created_at: '', updated_at: '' },
  { id: '17', name: 'Tile & Countertop', name_zh: '瓷砖台面', slug: 'tile-countertop', icon: '🟫', description: 'Tile and countertop installation services', company_count: 1680, avg_price_change: 0.9, default_price_unit: 'per sqft', is_active: true, sort_order: 17, created_at: '', updated_at: '' },
  { id: '18', name: 'Kitchen Remodeling', name_zh: '厨房改造', slug: 'kitchen-remodeling', icon: '🍳', description: 'Kitchen renovation and remodeling services', company_count: 980, avg_price_change: 2.8, default_price_unit: 'per project', is_active: true, sort_order: 18, created_at: '', updated_at: '' },
  { id: '19', name: 'Bathroom Remodeling', name_zh: '浴室改造', slug: 'bathroom-remodeling', icon: '🚿', description: 'Bathroom renovation and remodeling services', company_count: 1120, avg_price_change: 3.2, default_price_unit: 'per project', is_active: true, sort_order: 19, created_at: '', updated_at: '' },
  { id: '20', name: 'Cabinetry', name_zh: '橱柜定制', slug: 'cabinetry', icon: '🗄️', description: 'Custom cabinet design and installation', company_count: 750, avg_price_change: 1.5, default_price_unit: 'per linear ft', is_active: true, sort_order: 20, created_at: '', updated_at: '' },
  
  // Doors & Windows
  { id: '21', name: 'Window Installation', name_zh: '窗户安装', slug: 'window-installation', icon: '🪟', description: 'Window installation and replacement services', company_count: 1450, avg_price_change: -1.8, default_price_unit: 'per window', is_active: true, sort_order: 21, created_at: '', updated_at: '' },
  { id: '22', name: 'Door Installation', name_zh: '门安装', slug: 'door-installation', icon: '🚪', description: 'Door installation and replacement services', company_count: 1280, avg_price_change: 0.6, default_price_unit: 'per door', is_active: true, sort_order: 22, created_at: '', updated_at: '' },
  { id: '23', name: 'Garage Door', name_zh: '车库门', slug: 'garage-door', icon: '🏘️', description: 'Garage door installation, repair, and automation', company_count: 890, avg_price_change: 1.9, default_price_unit: 'per unit', is_active: true, sort_order: 23, created_at: '', updated_at: '' },
  
  // Exterior & Landscaping
  { id: '24', name: 'Landscaping', name_zh: '园林景观', slug: 'landscaping', icon: '🌳', description: 'Landscaping, lawn care, and outdoor design', company_count: 3800, avg_price_change: -1.2, default_price_unit: 'per project', is_active: true, sort_order: 24, created_at: '', updated_at: '' },
  { id: '25', name: 'Hardscaping & Pavers', name_zh: '硬景观铺装', slug: 'hardscaping', icon: '🪨', description: 'Patio, walkway, and hardscape installation', company_count: 1350, avg_price_change: 2.1, default_price_unit: 'per sqft', is_active: true, sort_order: 25, created_at: '', updated_at: '' },
  { id: '26', name: 'Fencing', name_zh: '围栏工程', slug: 'fencing', icon: '🚧', description: 'Fence installation and repair services', company_count: 1650, avg_price_change: 0.8, default_price_unit: 'per linear ft', is_active: true, sort_order: 26, created_at: '', updated_at: '' },
  { id: '27', name: 'Deck & Patio', name_zh: '露台甲板', slug: 'deck-patio', icon: '🏡', description: 'Deck and patio construction services', company_count: 1480, avg_price_change: 1.5, default_price_unit: 'per sqft', is_active: true, sort_order: 27, created_at: '', updated_at: '' },
  { id: '28', name: 'Pool Installation', name_zh: '泳池安装', slug: 'pool', icon: '🏊', description: 'Swimming pool installation and maintenance', company_count: 580, avg_price_change: 3.5, default_price_unit: 'per project', is_active: true, sort_order: 28, created_at: '', updated_at: '' },
  { id: '29', name: 'Irrigation Systems', name_zh: '灌溉系统', slug: 'irrigation', icon: '💧', description: 'Sprinkler and irrigation system installation', company_count: 920, avg_price_change: 1.2, default_price_unit: 'per zone', is_active: true, sort_order: 29, created_at: '', updated_at: '' },
  { id: '30', name: 'Tree Services', name_zh: '树木服务', slug: 'tree-service', icon: '🌲', description: 'Tree trimming, removal, and arborist services', company_count: 1890, avg_price_change: 2.8, default_price_unit: 'per tree', is_active: true, sort_order: 30, created_at: '', updated_at: '' },
  
  // Cleaning & Maintenance
  { id: '31', name: 'Home Cleaning', name_zh: '家政清洁', slug: 'home-cleaning', icon: '🧹', description: 'Residential and commercial cleaning services', company_count: 5200, avg_price_change: -0.8, default_price_unit: 'per hour', is_active: true, sort_order: 31, created_at: '', updated_at: '' },
  { id: '32', name: 'Carpet Cleaning', name_zh: '地毯清洁', slug: 'carpet-cleaning', icon: '🧼', description: 'Professional carpet and upholstery cleaning', company_count: 2350, avg_price_change: 0.5, default_price_unit: 'per room', is_active: true, sort_order: 32, created_at: '', updated_at: '' },
  { id: '33', name: 'Window Cleaning', name_zh: '窗户清洁', slug: 'window-cleaning', icon: '🪟', description: 'Residential and commercial window cleaning', company_count: 1280, avg_price_change: 1.1, default_price_unit: 'per window', is_active: true, sort_order: 33, created_at: '', updated_at: '' },
  { id: '34', name: 'Pressure Washing', name_zh: '高压清洗', slug: 'pressure-washing', icon: '💨', description: 'Exterior pressure washing and cleaning', company_count: 1950, avg_price_change: -0.5, default_price_unit: 'per sqft', is_active: true, sort_order: 34, created_at: '', updated_at: '' },
  { id: '35', name: 'Gutter Cleaning', name_zh: '排水沟清理', slug: 'gutter-cleaning', icon: '🌧️', description: 'Gutter cleaning and maintenance services', company_count: 1430, avg_price_change: 0.9, default_price_unit: 'per linear ft', is_active: true, sort_order: 35, created_at: '', updated_at: '' },
  { id: '36', name: 'Chimney Sweep', name_zh: '烟囱清扫', slug: 'chimney-sweep', icon: '🔥', description: 'Chimney cleaning and inspection services', company_count: 680, avg_price_change: 1.5, default_price_unit: 'per visit', is_active: true, sort_order: 36, created_at: '', updated_at: '' },
  
  // Pest Control & Security
  { id: '37', name: 'Pest Control', name_zh: '害虫防治', slug: 'pest-control', icon: '🐜', description: 'Pest control and extermination services', company_count: 1800, avg_price_change: 1.9, default_price_unit: 'per visit', is_active: true, sort_order: 37, created_at: '', updated_at: '' },
  { id: '38', name: 'Termite Treatment', name_zh: '白蚁处理', slug: 'termite', icon: '🪳', description: 'Termite inspection and treatment services', company_count: 950, avg_price_change: 2.3, default_price_unit: 'per treatment', is_active: true, sort_order: 38, created_at: '', updated_at: '' },
  { id: '39', name: 'Wildlife Removal', name_zh: '野生动物移除', slug: 'wildlife-removal', icon: '🦝', description: 'Wildlife and animal removal services', company_count: 720, avg_price_change: 3.1, default_price_unit: 'per visit', is_active: true, sort_order: 39, created_at: '', updated_at: '' },
  { id: '40', name: 'Security Systems', name_zh: '安防系统', slug: 'security', icon: '🔒', description: 'Home security system installation and monitoring', company_count: 1580, avg_price_change: -2.5, default_price_unit: 'per system', is_active: true, sort_order: 40, created_at: '', updated_at: '' },
  
  // Auto Services
  { id: '41', name: 'Auto Repair', name_zh: '汽车维修', slug: 'auto-repair', icon: '🚗', description: 'Auto repair and maintenance services', company_count: 6800, avg_price_change: 2.3, default_price_unit: 'per hour', is_active: true, sort_order: 41, created_at: '', updated_at: '' },
  { id: '42', name: 'Auto Body & Paint', name_zh: '汽车钣金喷漆', slug: 'auto-body', icon: '🎨', description: 'Auto body repair and painting services', company_count: 2450, avg_price_change: 1.8, default_price_unit: 'per job', is_active: true, sort_order: 42, created_at: '', updated_at: '' },
  { id: '43', name: 'Oil Change & Lube', name_zh: '换油润滑', slug: 'oil-change', icon: '🛢️', description: 'Oil change and lubrication services', company_count: 3200, avg_price_change: 0.5, default_price_unit: 'per service', is_active: true, sort_order: 43, created_at: '', updated_at: '' },
  { id: '44', name: 'Tire Services', name_zh: '轮胎服务', slug: 'tire-service', icon: '🛞', description: 'Tire sales, installation, and repair', company_count: 2880, avg_price_change: 1.2, default_price_unit: 'per tire', is_active: true, sort_order: 44, created_at: '', updated_at: '' },
  
  // Moving & Storage
  { id: '45', name: 'Moving Services', name_zh: '搬家服务', slug: 'moving', icon: '📦', description: 'Residential and commercial moving services', company_count: 2200, avg_price_change: 3.8, default_price_unit: 'per hour', is_active: true, sort_order: 45, created_at: '', updated_at: '' },
  { id: '46', name: 'Storage & Warehousing', name_zh: '仓储存储', slug: 'storage', icon: '🏬', description: 'Storage and warehousing solutions', company_count: 1350, avg_price_change: 2.1, default_price_unit: 'per month', is_active: true, sort_order: 46, created_at: '', updated_at: '' },
  { id: '47', name: 'Junk Removal', name_zh: '垃圾清运', slug: 'junk-removal', icon: '🗑️', description: 'Junk and debris removal services', company_count: 1680, avg_price_change: 1.5, default_price_unit: 'per load', is_active: true, sort_order: 47, created_at: '', updated_at: '' },
  
  // Professional Services
  { id: '48', name: 'Home Inspection', name_zh: '房屋检查', slug: 'home-inspection', icon: '🔍', description: 'Professional home inspection services', company_count: 1250, avg_price_change: 0.8, default_price_unit: 'per inspection', is_active: true, sort_order: 48, created_at: '', updated_at: '' },
  { id: '49', name: 'Locksmith', name_zh: '锁匠服务', slug: 'locksmith', icon: '🔑', description: 'Residential and commercial locksmith services', company_count: 1890, avg_price_change: 1.2, default_price_unit: 'per service', is_active: true, sort_order: 49, created_at: '', updated_at: '' },
  { id: '50', name: 'Handyman', name_zh: '杂工服务', slug: 'handyman', icon: '🔨', description: 'General handyman and odd job services', company_count: 4200, avg_price_change: 0.5, default_price_unit: 'per hour', is_active: true, sort_order: 50, created_at: '', updated_at: '' },
  { id: '51', name: 'Interior Design', name_zh: '室内设计', slug: 'interior-design', icon: '🛋️', description: 'Professional interior design and consulting', company_count: 980, avg_price_change: 2.5, default_price_unit: 'per hour', is_active: true, sort_order: 51, created_at: '', updated_at: '' },
  { id: '52', name: 'Architect Services', name_zh: '建筑师服务', slug: 'architect', icon: '📐', description: 'Architectural design and planning services', company_count: 750, avg_price_change: 1.8, default_price_unit: 'per hour', is_active: true, sort_order: 52, created_at: '', updated_at: '' },
  
  // Appliance & Electronics Repair
  { id: '53', name: 'Appliance Repair', name_zh: '家电维修', slug: 'appliance-repair', icon: '🔧', description: 'Appliance installation and repair services', company_count: 1580, avg_price_change: 1.5, default_price_unit: 'per service', is_active: true, sort_order: 53, created_at: '', updated_at: '' },
  { id: '54', name: 'Computer Repair', name_zh: '电脑维修', slug: 'computer-repair', icon: '💻', description: 'Computer and electronics repair services', company_count: 2100, avg_price_change: -1.2, default_price_unit: 'per hour', is_active: true, sort_order: 54, created_at: '', updated_at: '' },
  { id: '55', name: 'Phone Repair', name_zh: '手机维修', slug: 'phone-repair', icon: '📱', description: 'Mobile phone and tablet repair services', company_count: 2850, avg_price_change: -2.8, default_price_unit: 'per repair', is_active: true, sort_order: 55, created_at: '', updated_at: '' },
  
  // Personal & Lifestyle Services
  { id: '56', name: 'Pet Grooming', name_zh: '宠物美容', slug: 'pet-grooming', icon: '🐕', description: 'Professional pet grooming services', company_count: 1920, avg_price_change: 1.8, default_price_unit: 'per visit', is_active: true, sort_order: 56, created_at: '', updated_at: '' },
  { id: '57', name: 'Pet Sitting', name_zh: '宠物看护', slug: 'pet-sitting', icon: '🐈', description: 'Pet sitting and dog walking services', company_count: 1450, avg_price_change: 2.3, default_price_unit: 'per day', is_active: true, sort_order: 57, created_at: '', updated_at: '' },
  { id: '58', name: 'Photography', name_zh: '摄影服务', slug: 'photography', icon: '📸', description: 'Professional photography services', company_count: 3200, avg_price_change: 0.8, default_price_unit: 'per session', is_active: true, sort_order: 58, created_at: '', updated_at: '' },
  { id: '59', name: 'Event Planning', name_zh: '活动策划', slug: 'event-planning', icon: '🎉', description: 'Event planning and coordination services', company_count: 1280, avg_price_change: 1.5, default_price_unit: 'per event', is_active: true, sort_order: 59, created_at: '', updated_at: '' },
  { id: '60', name: 'Catering', name_zh: '餐饮外卖', slug: 'catering', icon: '🍽️', description: 'Catering and food service for events', company_count: 2450, avg_price_change: 2.1, default_price_unit: 'per person', is_active: true, sort_order: 60, created_at: '', updated_at: '' },
];

// ==========================================
// URL utilities
// ==========================================

// Build search URL
export function buildSearchUrl(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  return `/search?${searchParams.toString()}`;
}

// Parse query params
export function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

// ==========================================
// City data
// ==========================================

export const majorCities: string[] = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
  'Denver',
  'Boston',
  'El Paso',
  'Nashville',
  'Detroit',
  'Portland',
  'Memphis',
  'Oklahoma City',
  'Las Vegas',
  'Louisville',
  'Baltimore',
  'Milwaukee',
  'Albuquerque',
  'Tucson',
  'Fresno',
  'Sacramento',
  'Atlanta',
  'Kansas City',
  'Miami',
  'Colorado Springs',
  'Raleigh',
  'Omaha',
  'Long Beach',
  'Virginia Beach',
  'Oakland',
  'Minneapolis',
  'Tampa',
  'Tulsa',
  'Arlington',
  'New Orleans',
  'Wichita',
  'Cleveland',
];
