-- ============================================
-- BizCompare Pro - 全美企业比价与信息透明平台
-- 完整数据库 Schema
-- ============================================

-- 清理旧表（如果需要重建）
-- DROP TABLE IF EXISTS search_logs CASCADE;
-- DROP TABLE IF EXISTS saved_companies CASCADE;
-- DROP TABLE IF EXISTS price_alerts CASCADE;
-- DROP TABLE IF EXISTS price_history CASCADE;
-- DROP TABLE IF EXISTS price_records CASCADE;
-- DROP TABLE IF EXISTS permits CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS company_financials CASCADE;
-- DROP TABLE IF EXISTS company_contacts CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS regions CASCADE;
-- DROP TABLE IF EXISTS states CASCADE;
-- DROP TABLE IF EXISTS industries CASCADE;

-- ============================================
-- 1. 基础配置表
-- ============================================

-- 1.1 行业分类表
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_zh VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50), -- emoji or icon name
  description TEXT,
  description_zh TEXT,
  parent_id UUID REFERENCES industries(id) ON DELETE SET NULL, -- 支持子行业
  company_count INTEGER DEFAULT 0,
  avg_price_change NUMERIC(5, 2) DEFAULT 0,
  default_price_unit VARCHAR(50), -- per sqft, per hour, etc.
  data_sources TEXT[], -- 数据来源列表
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 美国州表
CREATE TABLE IF NOT EXISTS states (
  code CHAR(2) PRIMARY KEY, -- 州代码 (CA, NY, TX等)
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50), -- 区域 (West, East, South, Midwest)
  population INTEGER,
  company_count INTEGER DEFAULT 0,
  avg_income NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.3 地区/城市表
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  state_code CHAR(2) REFERENCES states(code) ON DELETE CASCADE,
  county VARCHAR(100),
  zip_codes TEXT[], -- 包含的邮编
  population INTEGER,
  is_metro BOOLEAN DEFAULT false, -- 是否为大都会区
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  timezone VARCHAR(50),
  company_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, state_code)
);

-- ============================================
-- 2. 用户与订阅系统
-- ============================================

-- 2.1 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE, -- Supabase Auth ID
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  company VARCHAR(255), -- 用户所属公司
  job_title VARCHAR(100),
  
  -- 订阅信息
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  -- 使用统计
  searches_this_month INTEGER DEFAULT 0,
  price_unlocks_this_month INTEGER DEFAULT 0,
  last_search_reset TIMESTAMP DEFAULT NOW(),
  
  -- 偏好设置
  preferred_industries TEXT[],
  preferred_states TEXT[],
  email_notifications BOOLEAN DEFAULT true,
  
  -- 系统字段
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(20) PRIMARY KEY, -- free, basic, pro, enterprise
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  price_yearly NUMERIC(10, 2) NOT NULL,
  
  -- 功能限制
  searches_per_month INTEGER DEFAULT 10,
  price_unlocks_per_month INTEGER DEFAULT 0,
  saved_companies_limit INTEGER DEFAULT 5,
  export_enabled BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  company_reports BOOLEAN DEFAULT false, -- 企业报告功能
  financial_data BOOLEAN DEFAULT false, -- 财务数据访问
  contact_info BOOLEAN DEFAULT false, -- 联系方式访问
  historical_data BOOLEAN DEFAULT false, -- 历史数据访问
  
  -- Stripe
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  
  features JSONB, -- 功能列表 JSON
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.3 用户订阅历史
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  billing_period VARCHAR(10) CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- Stripe信息
  stripe_subscription_id VARCHAR(100),
  stripe_invoice_id VARCHAR(100),
  
  -- 时间
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- 金额
  amount NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. 企业数据表
-- ============================================

-- 3.1 企业主表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  legal_name VARCHAR(255), -- 法定名称
  dba_name VARCHAR(255), -- DBA名称
  initial CHAR(1),
  
  -- 行业与地区
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  sub_industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  state_code CHAR(2) REFERENCES states(code),
  city VARCHAR(100),
  zip_code VARCHAR(20),
  address TEXT,
  address_line2 TEXT,
  
  -- 联系方式 (部分仅会员可见)
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  
  -- 社交媒体
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  youtube_url VARCHAR(500),
  yelp_url VARCHAR(500),
  
  -- 公司详情
  description TEXT,
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  
  -- 注册与许可信息 (类似天眼查)
  ein VARCHAR(20), -- 联邦税号
  license_number VARCHAR(100),
  license_type VARCHAR(100),
  license_state CHAR(2),
  license_expiry DATE,
  business_type VARCHAR(50), -- LLC, Corporation, etc.
  entity_type VARCHAR(50), -- Domestic, Foreign
  registration_state CHAR(2),
  registration_number VARCHAR(100),
  registration_date DATE,
  
  -- 公司规模
  founded_year INTEGER,
  employee_count INTEGER,
  employee_range VARCHAR(50), -- 1-10, 11-50, etc.
  annual_revenue NUMERIC(15, 2),
  revenue_range VARCHAR(50), -- <1M, 1M-5M, etc.
  
  -- 认证与评级
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  insurance_verified BOOLEAN DEFAULT false,
  bonded BOOLEAN DEFAULT false,
  bbb_rating VARCHAR(10),
  bbb_accredited BOOLEAN DEFAULT false,
  
  -- 评分
  rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  -- 服务信息
  service_areas TEXT[],
  specialties TEXT[],
  certifications TEXT[],
  brands_carried TEXT[],
  languages_spoken TEXT[],
  payment_methods TEXT[], -- Cash, Credit, Check, etc.
  financing_available BOOLEAN DEFAULT false,
  
  -- 营业信息
  business_hours JSONB,
  emergency_service BOOLEAN DEFAULT false,
  warranty_years INTEGER,
  free_estimates BOOLEAN DEFAULT false,
  
  -- 定价信息 (会员可见)
  avg_price NUMERIC(12, 2),
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  price_unit VARCHAR(50), -- per sqft, per hour, per project
  price_trend NUMERIC(5, 2), -- 价格趋势百分比
  
  -- 项目统计
  total_projects INTEGER DEFAULT 0,
  total_value NUMERIC(15, 2) DEFAULT 0,
  avg_project_value NUMERIC(12, 2),
  
  -- 数据来源
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  last_scraped_at TIMESTAMP,
  
  -- 系统字段
  is_featured BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false, -- 是否被企业认领
  claimed_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.2 企业联系人表 (高级会员功能)
CREATE TABLE IF NOT EXISTS company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100), -- CEO, Owner, Manager
  department VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url VARCHAR(500),
  
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.3 企业财务数据表 (高级会员功能，类似天眼查)
CREATE TABLE IF NOT EXISTS company_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  
  revenue NUMERIC(15, 2),
  net_income NUMERIC(15, 2),
  gross_profit NUMERIC(15, 2),
  operating_income NUMERIC(15, 2),
  total_assets NUMERIC(15, 2),
  total_liabilities NUMERIC(15, 2),
  total_equity NUMERIC(15, 2),
  
  employee_count INTEGER,
  revenue_per_employee NUMERIC(12, 2),
  
  data_source VARCHAR(100),
  is_estimated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year)
);

-- ============================================
-- 4. 价格与项目数据
-- ============================================

-- 4.1 价格记录表
CREATE TABLE IF NOT EXISTS price_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  service_type VARCHAR(100) NOT NULL, -- 服务类型
  service_description TEXT,
  
  price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50) NOT NULL, -- per sqft, per hour, etc.
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  
  region_id UUID REFERENCES regions(id),
  state_code CHAR(2) REFERENCES states(code),
  
  recorded_at TIMESTAMP DEFAULT NOW(),
  valid_until DATE,
  
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4.2 价格历史表 (用于趋势分析)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  
  avg_price NUMERIC(12, 2) NOT NULL,
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  price_unit VARCHAR(50) NOT NULL,
  
  sample_count INTEGER DEFAULT 1, -- 样本数量
  
  month DATE NOT NULL, -- 月份 (YYYY-MM-01)
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, service_type, month)
);

-- 4.3 许可证/项目记录表
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  permit_number VARCHAR(100),
  permit_type VARCHAR(100),
  work_type VARCHAR(100),
  
  city VARCHAR(100),
  state_code CHAR(2) REFERENCES states(code),
  address TEXT,
  
  description TEXT,
  reported_cost NUMERIC(12, 2),
  sqft NUMERIC(10, 2),
  
  issue_date DATE,
  completion_date DATE,
  expiry_date DATE,
  status VARCHAR(50), -- Issued, Completed, Expired
  
  contractor_name VARCHAR(255), -- 原始承包商名称
  owner_name VARCHAR(255), -- 业主
  
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  raw_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(permit_number, state_code)
);

-- ============================================
-- 5. 用户交互数据
-- ============================================

-- 5.1 用户评价表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  user_name VARCHAR(100),
  user_location VARCHAR(100),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  
  pros TEXT[],
  cons TEXT[],
  
  service_type VARCHAR(100), -- 使用的服务类型
  project_cost NUMERIC(12, 2),
  project_date DATE,
  
  would_recommend BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,
  
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'reported')),
  
  response TEXT, -- 企业回复
  response_at TIMESTAMP,
  
  data_source VARCHAR(100), -- Google, Yelp, BBB, etc.
  source_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5.2 用户收藏表
CREATE TABLE IF NOT EXISTS saved_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 5.3 价格提醒表
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 可以是针对特定公司或行业
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  state_code CHAR(2) REFERENCES states(code),
  
  service_type VARCHAR(100),
  target_price NUMERIC(12, 2),
  alert_type VARCHAR(20) CHECK (alert_type IN ('below', 'above', 'change')),
  change_threshold NUMERIC(5, 2), -- 变化百分比阈值
  
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5.4 搜索日志表
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  query TEXT,
  industry_id UUID REFERENCES industries(id),
  state_code CHAR(2),
  city VARCHAR(100),
  
  filters JSONB,
  result_count INTEGER,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. 索引
-- ============================================

-- 企业表索引
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry_id);
CREATE INDEX IF NOT EXISTS idx_companies_state ON companies(state_code);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_companies_total_projects ON companies(total_projects DESC);
CREATE INDEX IF NOT EXISTS idx_companies_is_featured ON companies(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);

-- 价格表索引
CREATE INDEX IF NOT EXISTS idx_price_records_company ON price_records(company_id);
CREATE INDEX IF NOT EXISTS idx_price_records_service ON price_records(service_type);
CREATE INDEX IF NOT EXISTS idx_price_history_company ON price_history(company_id);
CREATE INDEX IF NOT EXISTS idx_price_history_month ON price_history(month DESC);

-- 许可证索引
CREATE INDEX IF NOT EXISTS idx_permits_company ON permits(company_id);
CREATE INDEX IF NOT EXISTS idx_permits_state ON permits(state_code);
CREATE INDEX IF NOT EXISTS idx_permits_issue_date ON permits(issue_date DESC);

-- 评价索引
CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 用户索引
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- 地区索引
CREATE INDEX IF NOT EXISTS idx_regions_state ON regions(state_code);

-- ============================================
-- 7. 视图
-- ============================================

-- 7.1 行业统计视图
CREATE OR REPLACE VIEW industry_stats AS
SELECT 
  i.id,
  i.name,
  i.slug,
  i.icon,
  COUNT(DISTINCT c.id) as company_count,
  COUNT(DISTINCT c.state_code) as state_count,
  AVG(c.rating) as avg_rating,
  AVG(c.avg_price) as avg_price,
  i.default_price_unit as price_unit,
  MAX(c.updated_at) as last_updated
FROM industries i
LEFT JOIN companies c ON c.industry_id = i.id AND c.is_active = true
WHERE i.is_active = true
GROUP BY i.id, i.name, i.slug, i.icon, i.default_price_unit
ORDER BY company_count DESC;

-- 7.2 州统计视图
CREATE OR REPLACE VIEW state_stats AS
SELECT 
  s.code,
  s.name,
  s.region,
  COUNT(DISTINCT c.id) as company_count,
  COUNT(DISTINCT c.industry_id) as industry_count,
  AVG(c.rating) as avg_rating,
  AVG(c.avg_price) as avg_price,
  MAX(c.updated_at) as last_updated
FROM states s
LEFT JOIN companies c ON c.state_code = s.code AND c.is_active = true
WHERE s.is_active = true
GROUP BY s.code, s.name, s.region
ORDER BY company_count DESC;

-- 7.3 热门企业视图
CREATE OR REPLACE VIEW featured_companies AS
SELECT 
  c.*,
  i.name as industry_name,
  i.slug as industry_slug,
  s.name as state_name
FROM companies c
LEFT JOIN industries i ON c.industry_id = i.id
LEFT JOIN states s ON c.state_code = s.code
WHERE c.is_active = true 
  AND c.is_featured = true
ORDER BY c.rating DESC NULLS LAST, c.total_projects DESC
LIMIT 50;

-- ============================================
-- 8. 行级安全性 (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public read access" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON states FOR SELECT USING (true);
CREATE POLICY "Public read access" ON regions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON subscription_plans FOR SELECT USING (is_active = true);

-- 用户只能读取自己的数据
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- 收藏只能读取自己的
CREATE POLICY "Users manage own saved" ON saved_companies FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 搜索日志只能读取自己的
CREATE POLICY "Users read own logs" ON search_logs FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 服务端写入权限
CREATE POLICY "Service role full access on companies" ON companies FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on price_records" ON price_records FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on permits" ON permits FOR ALL TO service_role USING (true);

-- ============================================
-- 9. 触发器
-- ============================================

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 企业评分更新触发器
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies
  SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE company_id = NEW.company_id AND status = 'published'),
    review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND status = 'published')
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_rating();

-- 行业计数更新触发器
CREATE OR REPLACE FUNCTION update_industry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE industries SET company_count = (
      SELECT COUNT(*) FROM companies WHERE industry_id = NEW.industry_id AND is_active = true
    ) WHERE id = NEW.industry_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE industries SET company_count = (
      SELECT COUNT(*) FROM companies WHERE industry_id = OLD.industry_id AND is_active = true
    ) WHERE id = OLD.industry_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_industry_count
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_industry_count();

-- ============================================
-- 10. 初始数据
-- ============================================

-- 插入订阅计划
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, searches_per_month, price_unlocks_per_month, saved_companies_limit, export_enabled, api_access, priority_support, company_reports, financial_data, contact_info, historical_data, features, sort_order)
VALUES 
  ('free', 'Free', '免费试用，基础功能', 0, 0, 10, 0, 5, false, false, false, false, false, false, false, '["Basic search", "View company profiles", "5 saved companies"]', 1),
  ('basic', 'Basic', '个人用户，基础比价功能', 9.99, 95.90, 100, 20, 50, false, false, false, false, false, false, false, '["100 searches/month", "20 price unlocks/month", "50 saved companies", "Price trend charts"]', 2),
  ('pro', 'Professional', '专业用户，完整功能', 29.99, 287.90, 1000, -1, 500, true, false, true, true, false, true, true, '["1000 searches/month", "Unlimited price unlocks", "500 saved companies", "Export to CSV/Excel", "Company reports", "Contact information", "Historical price data"]', 3),
  ('enterprise', 'Enterprise', '企业用户，全功能+API', 99.99, 959.90, -1, -1, -1, true, true, true, true, true, true, true, '["Unlimited searches", "Unlimited everything", "API access", "Financial data", "Priority support", "Custom integrations"]', 4)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;

-- 插入美国各州
INSERT INTO states (code, name, region, population) VALUES
  ('AL', 'Alabama', 'South', 5024279),
  ('AK', 'Alaska', 'West', 733391),
  ('AZ', 'Arizona', 'West', 7278717),
  ('AR', 'Arkansas', 'South', 3017804),
  ('CA', 'California', 'West', 39512223),
  ('CO', 'Colorado', 'West', 5758736),
  ('CT', 'Connecticut', 'East', 3565287),
  ('DE', 'Delaware', 'East', 973764),
  ('FL', 'Florida', 'South', 21538187),
  ('GA', 'Georgia', 'South', 10617423),
  ('HI', 'Hawaii', 'West', 1415872),
  ('ID', 'Idaho', 'West', 1839106),
  ('IL', 'Illinois', 'Midwest', 12671821),
  ('IN', 'Indiana', 'Midwest', 6732219),
  ('IA', 'Iowa', 'Midwest', 3155070),
  ('KS', 'Kansas', 'Midwest', 2913314),
  ('KY', 'Kentucky', 'South', 4467673),
  ('LA', 'Louisiana', 'South', 4648794),
  ('ME', 'Maine', 'East', 1344212),
  ('MD', 'Maryland', 'East', 6045680),
  ('MA', 'Massachusetts', 'East', 6892503),
  ('MI', 'Michigan', 'Midwest', 9986857),
  ('MN', 'Minnesota', 'Midwest', 5639632),
  ('MS', 'Mississippi', 'South', 2976149),
  ('MO', 'Missouri', 'Midwest', 6137428),
  ('MT', 'Montana', 'West', 1068778),
  ('NE', 'Nebraska', 'Midwest', 1934408),
  ('NV', 'Nevada', 'West', 3080156),
  ('NH', 'New Hampshire', 'East', 1359711),
  ('NJ', 'New Jersey', 'East', 8882190),
  ('NM', 'New Mexico', 'West', 2096829),
  ('NY', 'New York', 'East', 19453561),
  ('NC', 'North Carolina', 'South', 10488084),
  ('ND', 'North Dakota', 'Midwest', 762062),
  ('OH', 'Ohio', 'Midwest', 11689100),
  ('OK', 'Oklahoma', 'South', 3956971),
  ('OR', 'Oregon', 'West', 4217737),
  ('PA', 'Pennsylvania', 'East', 12801989),
  ('RI', 'Rhode Island', 'East', 1059361),
  ('SC', 'South Carolina', 'South', 5148714),
  ('SD', 'South Dakota', 'Midwest', 884659),
  ('TN', 'Tennessee', 'South', 6829174),
  ('TX', 'Texas', 'South', 28995881),
  ('UT', 'Utah', 'West', 3205958),
  ('VT', 'Vermont', 'East', 623989),
  ('VA', 'Virginia', 'South', 8535519),
  ('WA', 'Washington', 'West', 7614893),
  ('WV', 'West Virginia', 'South', 1792147),
  ('WI', 'Wisconsin', 'Midwest', 5822434),
  ('WY', 'Wyoming', 'West', 578759),
  ('DC', 'District of Columbia', 'East', 705749)
ON CONFLICT (code) DO NOTHING;

-- 插入行业分类
INSERT INTO industries (name, name_zh, slug, icon, description, default_price_unit, sort_order) VALUES
  ('Roofing', '屋顶', 'roofing', '🏠', 'Roofing installation, repair, and maintenance services', 'per sqft', 1),
  ('Plumbing', '管道', 'plumbing', '🔧', 'Plumbing installation, repair, and maintenance', 'per hour', 2),
  ('Electrical', '电气', 'electrical', '⚡', 'Electrical installation, repair, and wiring services', 'per hour', 3),
  ('HVAC', '暖通空调', 'hvac', '❄️', 'Heating, ventilation, and air conditioning services', 'per unit', 4),
  ('Flooring', '地板', 'flooring', '🪵', 'Flooring installation including hardwood, tile, carpet', 'per sqft', 5),
  ('Painting', '油漆', 'painting', '🎨', 'Interior and exterior painting services', 'per sqft', 6),
  ('Landscaping', '园林', 'landscaping', '🌳', 'Landscaping, lawn care, and outdoor design', 'per project', 7),
  ('General Contracting', '综合承包', 'general-contracting', '🏗️', 'General construction and renovation services', 'per project', 8),
  ('Home Cleaning', '家政清洁', 'home-cleaning', '🧹', 'Residential and commercial cleaning services', 'per hour', 9),
  ('Pest Control', '害虫防治', 'pest-control', '🐜', 'Pest control and extermination services', 'per visit', 10),
  ('Moving Services', '搬家服务', 'moving', '📦', 'Residential and commercial moving services', 'per hour', 11),
  ('Auto Repair', '汽车维修', 'auto-repair', '🚗', 'Auto repair and maintenance services', 'per hour', 12),
  ('Legal Services', '法律服务', 'legal', '⚖️', 'Legal consultation and services', 'per hour', 13),
  ('Accounting', '会计', 'accounting', '📊', 'Accounting and bookkeeping services', 'per hour', 14),
  ('Real Estate', '房地产', 'real-estate', '🏢', 'Real estate services and agencies', 'per transaction', 15),
  ('Healthcare', '医疗保健', 'healthcare', '🏥', 'Healthcare and medical services', 'per visit', 16),
  ('Retail', '零售', 'retail', '🛒', 'Retail stores and shops', 'per item', 17),
  ('Restaurants', '餐饮', 'restaurants', '🍽️', 'Restaurants and food services', 'per meal', 18),
  ('IT Services', 'IT服务', 'it-services', '💻', 'IT consulting and tech services', 'per hour', 19),
  ('Marketing', '市场营销', 'marketing', '📈', 'Marketing and advertising agencies', 'per project', 20)
ON CONFLICT (slug) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- ============================================
-- 完成！
-- ============================================
