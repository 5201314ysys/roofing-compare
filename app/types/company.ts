// TypeScript types for company data from real sources

export interface Executive {
  id: string;
  name: string;
  title: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  linkedinUrl?: string;
  bio?: string;
  photoUrl?: string;
  verified: boolean;
  source: string;
}

export interface License {
  id: string;
  licenseNumber: string;
  licenseType: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending';
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority: string;
  issuingState?: string;
  scope?: string;
  verified: boolean;
  sourceUrl?: string;
}

export interface RatingSource {
  source: string;
  rating: number;
  maxRating: number;
  reviewCount: number;
  lastUpdated: string;
  sourceUrl?: string;
}

export interface FinancialData {
  fiscalYear: number;
  fiscalQuarter?: number;
  revenue?: number;
  revenueGrowth?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  employees?: number;
  employeeGrowth?: number;
  marketCap?: number;
  source: string;
  isEstimated: boolean;
}

export interface LegalRecord {
  id: string;
  recordType: 'lawsuit' | 'bankruptcy' | 'lien' | 'judgment' | 'other';
  caseNumber?: string;
  court?: string;
  filingDate?: string;
  status: string;
  amount?: number;
  description?: string;
  partiesInvolved?: string[];
  outcome?: string;
  sourceUrl?: string;
}

export interface SafetyRecord {
  id: string;
  recordType: string;
  inspectionDate?: string;
  inspector?: string;
  agency: string;
  violationType?: string;
  severity?: 'serious' | 'willful' | 'repeat' | 'other';
  penaltyAmount?: number;
  status: 'open' | 'closed' | 'appealed';
  description?: string;
  correctiveAction?: string;
  sourceUrl?: string;
}

export interface CompanyRelationship {
  id: string;
  name: string;
  relationshipType: 'subsidiary' | 'branch' | 'division' | 'acquisition';
  ownershipPercentage?: number;
  effectiveDate?: string;
}

export interface ContactInfo {
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
}

export interface Project {
  id: string;
  permitNumber?: string;
  projectType: string;
  description?: string;
  address?: string;
  city?: string;
  issueDate?: string;
  completionDate?: string;
  value?: number;
  squareFeet?: number;
  status: string;
}

export interface Review {
  id: string;
  source: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  response?: string;
  responseDate?: string;
}

export interface CompanyComplete {
  // Basic Info
  id: string;
  name: string;
  legalName?: string;
  dbaNames?: string[];
  description?: string;
  
  // Registration
  entityType?: string;
  status: string;
  formationDate?: string;
  stateOfFormation?: string;
  registrationNumber?: string;
  ein?: string;
  dunsNumber?: string;
  
  // Contact
  contact: ContactInfo;
  
  // Location
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Industry
  industry?: string;
  industrySlug?: string;
  naicsCode?: string;
  naicsDescription?: string;
  sicCode?: string;
  specialties?: string[];
  services?: string[];
  
  // Executives
  executives: Executive[];
  ceo?: string;
  
  // Licensing
  licenses: License[];
  activeLicenses: number;
  bonded: boolean;
  insured: boolean;
  insuranceAmount?: number;
  
  // Ratings
  ratingsBreakdown: RatingSource[];
  overallRating?: number;
  totalReviews: number;
  bbbRating?: string;
  bbbAccredited: boolean;
  
  // Financial
  financialHistory: FinancialData[];
  latestFinancials?: FinancialData;
  revenue?: number;
  revenueRange?: string;
  employees?: number;
  employeeRange?: string;
  isPublic: boolean;
  stockSymbol?: string;
  
  // Pricing (for service companies)
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  priceHistory?: { date: string; price: number }[];
  
  // Legal & Safety
  legalRecords: LegalRecord[];
  safetyRecords: SafetyRecord[];
  hasLegalIssues: boolean;
  hasSafetyViolations: boolean;
  
  // Relationships
  parentCompany?: CompanyRelationship;
  subsidiaries: CompanyRelationship[];
  
  // Projects & Reviews
  recentProjects: Project[];
  projectCount: number;
  reviews: Review[];
  
  // Data Quality
  dataQualityScore: number;
  dataSources: string[];
  verified: boolean;
  lastUpdated: string;
  
  // Social
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
}

// Search result (simplified for lists)
export interface CompanySearchResult {
  id: string;
  name: string;
  legalName?: string;
  entityType?: string;
  status: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount: number;
  verified: boolean;
  ceo?: string;
  employees?: number;
  avgPrice?: number;
  bbbRating?: string;
  bbbAccredited: boolean;
  dataQualityScore: number;
  formationDate?: string;
  industry?: {
    name: string;
    slug: string;
  };
  ratingSources?: RatingSource[];
  activeLicenses: number;
}

export interface SearchResponse {
  companies: CompanySearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    query?: string;
    state?: string;
    industry?: string;
    sortBy: string;
  };
}

// Data source info
export interface DataSourceInfo {
  name: string;
  type: 'government' | 'commercial' | 'review' | 'manual';
  reliability: 'high' | 'medium' | 'low';
  lastFetched: string;
  recordsUpdated: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
  };
}
