-- ============================================
-- BizCompare Pro - Extended Schema for Complete Company Data
-- Adds comprehensive business information tables
-- Run this AFTER the main schema
-- ============================================

-- ============================================
-- COMPANY EXECUTIVES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS company_executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  linkedin_url VARCHAR(500),
  bio TEXT,
  photo_url VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_executives_company ON company_executives(company_id);
CREATE INDEX idx_executives_name ON company_executives(name);

-- ============================================
-- COMPANY LICENSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS company_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  license_number VARCHAR(100) NOT NULL,
  license_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  issue_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  issuing_state CHAR(2),
  scope TEXT, -- What the license covers
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  source_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, license_number)
);

CREATE INDEX idx_licenses_company ON company_licenses(company_id);
CREATE INDEX idx_licenses_expiry ON company_licenses(expiry_date);
CREATE INDEX idx_licenses_status ON company_licenses(status);

-- ============================================
-- COMPANY RATINGS TABLE (Multi-source ratings)
-- ============================================

CREATE TABLE IF NOT EXISTS company_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL, -- Google, Yelp, BBB, HomeAdvisor, etc.
  rating NUMERIC(3, 2) NOT NULL,
  max_rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  source_url VARCHAR(500),
  last_scraped TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, source)
);

CREATE INDEX idx_ratings_company ON company_ratings(company_id);
CREATE INDEX idx_ratings_source ON company_ratings(source);

-- ============================================
-- COMPANY FINANCIAL HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS company_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,
  
  -- Revenue & Income
  revenue NUMERIC(15, 2),
  revenue_growth NUMERIC(6, 2), -- Percentage
  gross_profit NUMERIC(15, 2),
  operating_income NUMERIC(15, 2),
  net_income NUMERIC(15, 2),
  
  -- Assets & Liabilities
  total_assets NUMERIC(15, 2),
  total_liabilities NUMERIC(15, 2),
  total_equity NUMERIC(15, 2),
  
  -- Other Metrics
  employees INTEGER,
  employee_growth NUMERIC(6, 2),
  market_cap NUMERIC(15, 2),
  
  -- Data Source
  source VARCHAR(100), -- SEC, Annual Report, Estimate
  source_url VARCHAR(500),
  is_estimated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_financials_company ON company_financials(company_id);
CREATE INDEX idx_financials_year ON company_financials(fiscal_year);

-- ============================================
-- COMPANY RELATIONSHIPS (Parent/Subsidiary)
-- ============================================

CREATE TABLE IF NOT EXISTS company_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  child_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'subsidiary', -- subsidiary, branch, division, acquisition
  ownership_percentage NUMERIC(5, 2),
  effective_date DATE,
  end_date DATE,
  verified BOOLEAN DEFAULT false,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_company_id, child_company_id)
);

CREATE INDEX idx_relationships_parent ON company_relationships(parent_company_id);
CREATE INDEX idx_relationships_child ON company_relationships(child_company_id);

-- ============================================
-- LEGAL FILINGS & RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS company_legal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  record_type VARCHAR(100) NOT NULL, -- lawsuit, bankruptcy, lien, judgment
  case_number VARCHAR(100),
  court VARCHAR(255),
  filing_date DATE,
  status VARCHAR(50),
  amount NUMERIC(15, 2),
  description TEXT,
  parties_involved TEXT[],
  outcome TEXT,
  source_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_legal_company ON company_legal_records(company_id);
CREATE INDEX idx_legal_type ON company_legal_records(record_type);

-- ============================================
-- SAFETY & COMPLIANCE RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS company_safety_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  record_type VARCHAR(100), -- OSHA violation, safety audit, incident
  inspection_date DATE,
  inspector VARCHAR(255),
  agency VARCHAR(100), -- OSHA, EPA, State agency
  violation_type VARCHAR(255),
  severity VARCHAR(50), -- serious, willful, repeat, other
  penalty_amount NUMERIC(12, 2),
  status VARCHAR(50), -- open, closed, appealed
  description TEXT,
  corrective_action TEXT,
  source_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_safety_company ON company_safety_records(company_id);
CREATE INDEX idx_safety_date ON company_safety_records(inspection_date);

-- ============================================
-- DATA SOURCE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS data_source_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source_name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50), -- government, commercial, review, manual
  last_fetched TIMESTAMP DEFAULT NOW(),
  fetch_status VARCHAR(50), -- success, error, partial
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_source_log_company ON data_source_log(company_id);
CREATE INDEX idx_source_log_source ON data_source_log(source_name);

-- ============================================
-- EXTEND COMPANIES TABLE
-- ============================================

-- Add new columns to companies table if not exist
DO $$
BEGIN
  -- Legal name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'legal_name') THEN
    ALTER TABLE companies ADD COLUMN legal_name VARCHAR(255);
  END IF;
  
  -- Registration number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'registration_number') THEN
    ALTER TABLE companies ADD COLUMN registration_number VARCHAR(100);
  END IF;
  
  -- EIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'ein') THEN
    ALTER TABLE companies ADD COLUMN ein VARCHAR(20);
  END IF;
  
  -- DUNS number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'duns_number') THEN
    ALTER TABLE companies ADD COLUMN duns_number VARCHAR(20);
  END IF;
  
  -- State of formation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'state_of_formation') THEN
    ALTER TABLE companies ADD COLUMN state_of_formation CHAR(2);
  END IF;
  
  -- Formation date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'formation_date') THEN
    ALTER TABLE companies ADD COLUMN formation_date DATE;
  END IF;
  
  -- Entity type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'entity_type') THEN
    ALTER TABLE companies ADD COLUMN entity_type VARCHAR(50);
  END IF;
  
  -- CEO
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'ceo') THEN
    ALTER TABLE companies ADD COLUMN ceo VARCHAR(255);
  END IF;
  
  -- Data quality score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'data_quality_score') THEN
    ALTER TABLE companies ADD COLUMN data_quality_score NUMERIC(5, 2) DEFAULT 0;
  END IF;
  
  -- Data sources
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'data_sources') THEN
    ALTER TABLE companies ADD COLUMN data_sources TEXT[];
  END IF;
  
  -- SIC code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'sic_code') THEN
    ALTER TABLE companies ADD COLUMN sic_code VARCHAR(10);
  END IF;
  
  -- Revenue
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'revenue') THEN
    ALTER TABLE companies ADD COLUMN revenue NUMERIC(15, 2);
  END IF;
  
  -- Revenue range
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'revenue_range') THEN
    ALTER TABLE companies ADD COLUMN revenue_range VARCHAR(50);
  END IF;
  
  -- Is public
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'is_public') THEN
    ALTER TABLE companies ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  
  -- Stock symbol
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'stock_symbol') THEN
    ALTER TABLE companies ADD COLUMN stock_symbol VARCHAR(10);
  END IF;
  
  -- Last data update
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'last_data_update') THEN
    ALTER TABLE companies ADD COLUMN last_data_update TIMESTAMP;
  END IF;
END
$$;

-- ============================================
-- UPDATE FUNCTIONS FOR AGGREGATED DATA
-- ============================================

-- Function to calculate overall rating from multiple sources
CREATE OR REPLACE FUNCTION calculate_overall_rating(p_company_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
  total_reviews INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(rating / max_rating * 5), 0),
    COALESCE(SUM(review_count), 0)
  INTO avg_rating, total_reviews
  FROM company_ratings
  WHERE company_id = p_company_id;
  
  UPDATE companies
  SET 
    rating = avg_rating,
    review_count = total_reviews,
    updated_at = NOW()
  WHERE id = p_company_id;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to update data quality score
CREATE OR REPLACE FUNCTION update_data_quality_score(p_company_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  c RECORD;
BEGIN
  SELECT * INTO c FROM companies WHERE id = p_company_id;
  
  IF NOT FOUND THEN RETURN 0; END IF;
  
  -- Basic info (30 points)
  IF c.name IS NOT NULL THEN score := score + 5; END IF;
  IF c.legal_name IS NOT NULL THEN score := score + 3; END IF;
  IF c.entity_type IS NOT NULL THEN score := score + 3; END IF;
  IF c.formation_date IS NOT NULL THEN score := score + 3; END IF;
  IF c.registration_number IS NOT NULL THEN score := score + 5; END IF;
  IF c.ein IS NOT NULL THEN score := score + 5; END IF;
  IF c.status IS NOT NULL THEN score := score + 3; END IF;
  IF c.state_of_formation IS NOT NULL THEN score := score + 3; END IF;
  
  -- Contact (20 points)
  IF c.phone IS NOT NULL THEN score := score + 5; END IF;
  IF c.email IS NOT NULL THEN score := score + 4; END IF;
  IF c.website IS NOT NULL THEN score := score + 4; END IF;
  IF c.address IS NOT NULL THEN score := score + 4; END IF;
  IF c.city IS NOT NULL AND c.state IS NOT NULL THEN score := score + 3; END IF;
  
  -- Executives (15 points)
  IF c.ceo IS NOT NULL THEN score := score + 8; END IF;
  IF EXISTS (SELECT 1 FROM company_executives WHERE company_id = p_company_id) THEN
    score := score + 4;
  END IF;
  IF (SELECT COUNT(*) FROM company_executives WHERE company_id = p_company_id) > 3 THEN
    score := score + 3;
  END IF;
  
  -- Ratings (15 points)
  IF EXISTS (SELECT 1 FROM company_ratings WHERE company_id = p_company_id) THEN
    score := score + 5;
  END IF;
  IF c.bbb_rating IS NOT NULL THEN score := score + 5; END IF;
  IF c.rating IS NOT NULL THEN score := score + 5; END IF;
  
  -- Financial (10 points)
  IF c.revenue IS NOT NULL THEN score := score + 4; END IF;
  IF c.employee_count IS NOT NULL THEN score := score + 3; END IF;
  IF c.is_public = true THEN score := score + 3; END IF;
  
  -- Verification (10 points)
  IF c.verified = true THEN score := score + 5; END IF;
  IF array_length(c.data_sources, 1) > 2 THEN score := score + 5; END IF;
  
  UPDATE companies
  SET data_quality_score = score, updated_at = NOW()
  WHERE id = p_company_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update ratings when company_ratings changes
CREATE OR REPLACE FUNCTION trigger_update_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_overall_rating(COALESCE(NEW.company_id, OLD.company_id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_rating ON company_ratings;
CREATE TRIGGER trg_update_rating
AFTER INSERT OR UPDATE OR DELETE ON company_ratings
FOR EACH ROW EXECUTE FUNCTION trigger_update_overall_rating();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Complete company view with all related data
CREATE OR REPLACE VIEW company_complete_view AS
SELECT 
  c.*,
  (SELECT json_agg(json_build_object(
    'name', e.name,
    'title', e.title,
    'linkedin_url', e.linkedin_url
  )) FROM company_executives e WHERE e.company_id = c.id AND e.is_current = true) as executives,
  
  (SELECT json_agg(json_build_object(
    'license_number', l.license_number,
    'license_type', l.license_type,
    'status', l.status,
    'expiry_date', l.expiry_date
  )) FROM company_licenses l WHERE l.company_id = c.id) as licenses,
  
  (SELECT json_agg(json_build_object(
    'source', r.source,
    'rating', r.rating,
    'review_count', r.review_count
  )) FROM company_ratings r WHERE r.company_id = c.id) as ratings_breakdown,
  
  (SELECT json_build_object(
    'revenue', f.revenue,
    'employees', f.employees,
    'year', f.fiscal_year
  ) FROM company_financials f WHERE f.company_id = c.id ORDER BY f.fiscal_year DESC LIMIT 1) as latest_financials

FROM companies c;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE company_executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_legal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_log ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read executives" ON company_executives FOR SELECT USING (true);
CREATE POLICY "Public read licenses" ON company_licenses FOR SELECT USING (true);
CREATE POLICY "Public read ratings" ON company_ratings FOR SELECT USING (true);
CREATE POLICY "Public read financials" ON company_financials FOR SELECT USING (true);
CREATE POLICY "Public read relationships" ON company_relationships FOR SELECT USING (true);

-- Service role full access (for scrapers)
CREATE POLICY "Service role all executives" ON company_executives FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all licenses" ON company_licenses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all ratings" ON company_ratings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all financials" ON company_financials FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all relationships" ON company_relationships FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all legal" ON company_legal_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all safety" ON company_safety_records FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role all source_log" ON data_source_log FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SAMPLE DATA SOURCES SEED
-- ============================================

-- Insert some real data source references
INSERT INTO data_source_log (company_id, source_name, source_type, fetch_status, records_updated)
SELECT 
  id,
  'Initial Seed',
  'manual',
  'success',
  1
FROM companies
WHERE NOT EXISTS (SELECT 1 FROM data_source_log WHERE company_id = companies.id)
LIMIT 10;

COMMENT ON TABLE company_executives IS 'Stores executive/officer information for companies';
COMMENT ON TABLE company_licenses IS 'Stores professional licenses and certifications';
COMMENT ON TABLE company_ratings IS 'Multi-source ratings (Google, Yelp, BBB, etc.)';
COMMENT ON TABLE company_financials IS 'Historical financial data';
COMMENT ON TABLE company_relationships IS 'Parent-subsidiary relationships';
COMMENT ON TABLE company_legal_records IS 'Legal filings, lawsuits, bankruptcies';
COMMENT ON TABLE company_safety_records IS 'OSHA and safety compliance records';
COMMENT ON TABLE data_source_log IS 'Tracks data fetching from various sources';
