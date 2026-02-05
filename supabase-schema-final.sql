-- ============================================
-- BizCompare Pro - 全美企业比价与信息透明平台
-- 完整数据库 Schema v3.0
-- 类似天眼查/企查查的美国版本
-- ============================================

-- 启用必要扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用于模糊搜索

-- ============================================
-- 1. 基础配置表
-- ============================================

-- 1.1 行业分类表 (支持多级分类)
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'Building2',
  description TEXT,
  description_zh TEXT,
  parent_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  company_count INTEGER DEFAULT 0,
  avg_price NUMERIC(12, 2),
  avg_price_change NUMERIC(5, 2) DEFAULT 0,
  default_price_unit VARCHAR(50),
  data_sources TEXT[],
  sic_codes VARCHAR(10)[], -- 标准行业分类代码
  naics_codes VARCHAR(10)[], -- 北美行业分类代码
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 美国州表
CREATE TABLE IF NOT EXISTS states (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50),
  division VARCHAR(50),
  capital VARCHAR(100),
  largest_city VARCHAR(100),
  population INTEGER,
  area_sq_miles NUMERIC(12, 2),
  gdp NUMERIC(15, 2),
  median_income NUMERIC(12, 2),
  company_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.3 城市/地区表
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  state_code CHAR(2) REFERENCES states(code) ON DELETE CASCADE,
  county VARCHAR(100),
  zip_codes TEXT[],
  population INTEGER,
  area_sq_miles NUMERIC(10, 2),
  median_income NUMERIC(12, 2),
  is_metro BOOLEAN DEFAULT false,
  metro_area VARCHAR(100),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  timezone VARCHAR(50),
  company_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, state_code, county)
);

-- ============================================
-- 2. 用户与订阅系统
-- ============================================

-- 2.1 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_zh VARCHAR(50),
  description TEXT,
  description_zh TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  price_yearly NUMERIC(10, 2) NOT NULL,
  
  -- 功能限制
  searches_per_month INTEGER DEFAULT 10,
  company_views_per_month INTEGER DEFAULT 20,
  price_unlocks_per_month INTEGER DEFAULT 0,
  saved_companies_limit INTEGER DEFAULT 5,
  export_enabled BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  
  -- 数据访问权限
  basic_info BOOLEAN DEFAULT true,
  contact_info BOOLEAN DEFAULT false,
  financial_data BOOLEAN DEFAULT false,
  historical_data BOOLEAN DEFAULT false,
  competitor_analysis BOOLEAN DEFAULT false,
  company_reports BOOLEAN DEFAULT false,
  real_time_alerts BOOLEAN DEFAULT false,
  
  -- Stripe
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  stripe_product_id VARCHAR(100),
  
  features JSONB,
  badge_color VARCHAR(20),
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2.2 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(100),
  industry VARCHAR(100),
  
  -- 订阅信息
  subscription_tier VARCHAR(20) DEFAULT 'free' REFERENCES subscription_plans(id),
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_started_at TIMESTAMP,
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  -- 使用统计
  searches_this_month INTEGER DEFAULT 0,
  company_views_this_month INTEGER DEFAULT 0,
  price_unlocks_this_month INTEGER DEFAULT 0,
  last_usage_reset TIMESTAMP DEFAULT NOW(),
  
  -- 偏好设置
  preferred_industries UUID[],
  preferred_states CHAR(2)[],
  email_notifications BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT true,
  
  -- 系统字段
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.3 用户订阅历史
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) REFERENCES subscription_plans(id),
  action VARCHAR(20), -- 'subscribe', 'upgrade', 'downgrade', 'cancel', 'renew'
  billing_period VARCHAR(10),
  amount NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_invoice_id VARCHAR(100),
  stripe_payment_intent_id VARCHAR(100),
  status VARCHAR(20),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. 企业数据表 (核心)
-- ============================================

-- 3.1 企业主表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  legal_name VARCHAR(255),
  dba_name VARCHAR(255),
  initial CHAR(1),
  
  -- 分类
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  sub_industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  sic_code VARCHAR(10),
  naics_code VARCHAR(10),
  
  -- 地理位置
  state_code CHAR(2) REFERENCES states(code),
  city_id UUID REFERENCES cities(id),
  city VARCHAR(100),
  county VARCHAR(100),
  zip_code VARCHAR(20),
  address TEXT,
  address_line2 TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- 联系方式 (部分需要会员)
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  
  -- 社交媒体
  social_media JSONB DEFAULT '{}',
  
  -- 企业详情
  description TEXT,
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  gallery_urls TEXT[],
  
  -- 注册信息 (类似天眼查)
  ein VARCHAR(20),
  duns_number VARCHAR(20),
  business_type VARCHAR(50),
  entity_type VARCHAR(50),
  incorporation_state CHAR(2),
  incorporation_date DATE,
  registration_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  status_date DATE,
  
  -- 许可证信息
  license_number VARCHAR(100),
  license_type VARCHAR(100),
  license_state CHAR(2),
  license_issue_date DATE,
  license_expiry_date DATE,
  license_status VARCHAR(50),
  
  -- 公司规模
  founded_year INTEGER,
  employee_count INTEGER,
  employee_range VARCHAR(50),
  annual_revenue NUMERIC(15, 2),
  revenue_range VARCHAR(50),
  
  -- 认证与评级
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by VARCHAR(100),
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMP,
  
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
  payment_methods TEXT[],
  financing_available BOOLEAN DEFAULT false,
  
  -- 营业信息
  business_hours JSONB,
  emergency_service BOOLEAN DEFAULT false,
  warranty_info TEXT,
  free_estimates BOOLEAN DEFAULT false,
  
  -- 定价信息
  avg_price NUMERIC(12, 2),
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  price_unit VARCHAR(50),
  price_trend NUMERIC(5, 2),
  price_last_updated TIMESTAMP,
  
  -- 项目统计
  total_projects INTEGER DEFAULT 0,
  total_value NUMERIC(15, 2) DEFAULT 0,
  avg_project_value NUMERIC(12, 2),
  completed_projects INTEGER DEFAULT 0,
  
  -- 数据来源
  data_sources TEXT[],
  primary_source VARCHAR(100),
  source_url VARCHAR(500),
  last_scraped_at TIMESTAMP,
  data_quality_score NUMERIC(3, 2),
  
  -- 系统字段
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  search_vector tsvector,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.2 企业联系人表 (高级会员)
CREATE TABLE IF NOT EXISTS company_executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  role VARCHAR(50), -- CEO, CFO, COO, Owner, etc.
  department VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url VARCHAR(500),
  
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  biography TEXT,
  education TEXT,
  previous_positions JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.3 企业财务数据表 (企业会员)
CREATE TABLE IF NOT EXISTS company_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,
  
  revenue NUMERIC(15, 2),
  revenue_growth NUMERIC(5, 2),
  gross_profit NUMERIC(15, 2),
  gross_margin NUMERIC(5, 2),
  operating_income NUMERIC(15, 2),
  operating_margin NUMERIC(5, 2),
  net_income NUMERIC(15, 2),
  net_margin NUMERIC(5, 2),
  ebitda NUMERIC(15, 2),
  
  total_assets NUMERIC(15, 2),
  total_liabilities NUMERIC(15, 2),
  total_equity NUMERIC(15, 2),
  current_assets NUMERIC(15, 2),
  current_liabilities NUMERIC(15, 2),
  
  cash_flow_operations NUMERIC(15, 2),
  capital_expenditure NUMERIC(15, 2),
  free_cash_flow NUMERIC(15, 2),
  
  employee_count INTEGER,
  revenue_per_employee NUMERIC(12, 2),
  
  data_source VARCHAR(100),
  is_audited BOOLEAN DEFAULT false,
  is_estimated BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_quarter)
);

-- 3.4 企业关联关系表 (子公司/母公司/关联公司)
CREATE TABLE IF NOT EXISTS company_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  related_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  relationship_type VARCHAR(50), -- parent, subsidiary, affiliate, investor, partner
  ownership_percentage NUMERIC(5, 2),
  effective_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  
  notes TEXT,
  data_source VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, related_company_id, relationship_type)
);

-- 3.5 企业历史变更表
CREATE TABLE IF NOT EXISTS company_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  change_type VARCHAR(50), -- name_change, address_change, status_change, ownership_change
  change_date DATE,
  old_value TEXT,
  new_value TEXT,
  
  document_url VARCHAR(500),
  data_source VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. 价格与项目数据
-- ============================================

-- 4.1 服务/产品价格表
CREATE TABLE IF NOT EXISTS service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  service_category VARCHAR(100),
  service_name VARCHAR(200) NOT NULL,
  service_description TEXT,
  
  base_price NUMERIC(12, 2),
  price_unit VARCHAR(50) NOT NULL,
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  
  -- 价格因素
  factors JSONB, -- 影响价格的因素
  
  city_id UUID REFERENCES cities(id),
  state_code CHAR(2) REFERENCES states(code),
  zip_code VARCHAR(20),
  
  effective_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3, 2),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4.2 价格历史表 (趋势分析)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 可以关联企业或地区级别
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  state_code CHAR(2) REFERENCES states(code),
  city_id UUID REFERENCES cities(id),
  
  service_category VARCHAR(100),
  service_name VARCHAR(200),
  
  avg_price NUMERIC(12, 2) NOT NULL,
  median_price NUMERIC(12, 2),
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  price_unit VARCHAR(50) NOT NULL,
  
  sample_size INTEGER DEFAULT 1,
  std_deviation NUMERIC(12, 2),
  
  period_type VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, yearly
  period_date DATE NOT NULL,
  
  yoy_change NUMERIC(5, 2), -- 同比变化
  mom_change NUMERIC(5, 2), -- 环比变化
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, service_name, period_type, period_date)
);

-- 4.3 许可证/项目记录表
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  permit_number VARCHAR(100),
  permit_type VARCHAR(100),
  work_type VARCHAR(100),
  work_description TEXT,
  
  city_id UUID REFERENCES cities(id),
  city VARCHAR(100),
  state_code CHAR(2) REFERENCES states(code),
  county VARCHAR(100),
  zip_code VARCHAR(20),
  address TEXT,
  
  reported_cost NUMERIC(12, 2),
  sqft NUMERIC(10, 2),
  cost_per_sqft NUMERIC(10, 2),
  
  issue_date DATE,
  start_date DATE,
  completion_date DATE,
  expiry_date DATE,
  status VARCHAR(50),
  
  contractor_name VARCHAR(255),
  contractor_license VARCHAR(100),
  owner_name VARCHAR(255),
  
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  source_record_id VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. 评价与互动
-- ============================================

-- 5.1 企业评价表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  
  -- 细分评分
  quality_rating NUMERIC(2, 1),
  price_rating NUMERIC(2, 1),
  service_rating NUMERIC(2, 1),
  timeliness_rating NUMERIC(2, 1),
  
  pros TEXT,
  cons TEXT,
  
  -- 项目信息
  project_type VARCHAR(100),
  project_cost NUMERIC(12, 2),
  project_date DATE,
  
  -- 验证
  is_verified BOOLEAN DEFAULT false,
  verification_method VARCHAR(50),
  
  helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  -- 来源
  source VARCHAR(50) DEFAULT 'platform', -- platform, google, yelp, bbb
  source_review_id VARCHAR(100),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5.2 用户收藏企业
CREATE TABLE IF NOT EXISTS saved_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  folder VARCHAR(100) DEFAULT 'default',
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 5.3 价格提醒
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 监控目标
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  state_code CHAR(2) REFERENCES states(code),
  service_category VARCHAR(100),
  
  -- 提醒条件
  alert_type VARCHAR(20), -- price_drop, price_rise, threshold
  threshold_price NUMERIC(12, 2),
  threshold_percent NUMERIC(5, 2),
  
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  trigger_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. 搜索与分析
-- ============================================

-- 6.1 搜索日志
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  query TEXT,
  search_type VARCHAR(50), -- company, industry, price, location
  
  filters JSONB,
  result_count INTEGER,
  selected_result_id UUID,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6.2 页面访问日志
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  page_type VARCHAR(50), -- company, industry, pricing, search
  page_id UUID,
  page_url VARCHAR(500),
  
  referrer VARCHAR(500),
  ip_address INET,
  user_agent TEXT,
  
  duration_seconds INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6.3 报告生成记录
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  report_type VARCHAR(50), -- company_report, market_analysis, price_comparison
  title VARCHAR(255),
  
  parameters JSONB,
  file_url VARCHAR(500),
  file_format VARCHAR(20),
  file_size INTEGER,
  
  status VARCHAR(20) DEFAULT 'pending',
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. 数据采集与更新
-- ============================================

-- 7.1 数据源配置
CREATE TABLE IF NOT EXISTS data_sources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- api, scraper, file, manual
  url VARCHAR(500),
  
  credentials JSONB, -- 加密存储
  config JSONB,
  
  schedule VARCHAR(50), -- cron expression
  last_run_at TIMESTAMP,
  last_success_at TIMESTAMP,
  last_error TEXT,
  
  records_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7.2 数据采集任务
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id VARCHAR(50) REFERENCES data_sources(id),
  
  job_type VARCHAR(50),
  parameters JSONB,
  
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  error_log TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. 索引优化
-- ============================================

-- 企业搜索索引
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_state ON companies(state_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(is_featured, total_projects DESC) WHERE is_active = true;

-- 价格索引
CREATE INDEX IF NOT EXISTS idx_service_prices_company ON service_prices(company_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_state ON service_prices(state_code);
CREATE INDEX IF NOT EXISTS idx_price_history_period ON price_history(period_date DESC);

-- 许可证索引
CREATE INDEX IF NOT EXISTS idx_permits_company ON permits(company_id);
CREATE INDEX IF NOT EXISTS idx_permits_date ON permits(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_permits_state ON permits(state_code);

-- 用户索引
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_expires_at);

-- ============================================
-- 9. 触发器与函数
-- ============================================

-- 更新企业搜索向量
CREATE OR REPLACE FUNCTION update_company_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.legal_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.dba_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.specialties, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_search
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_company_search_vector();

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_companies_updated
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 更新企业统计
CREATE OR REPLACE FUNCTION update_company_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新评价统计
  IF TG_TABLE_NAME = 'reviews' THEN
    UPDATE companies SET
      rating = (SELECT AVG(rating) FROM reviews WHERE company_id = NEW.company_id AND is_active = true),
      review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND is_active = true),
      updated_at = NOW()
    WHERE id = NEW.company_id;
  END IF;
  
  -- 更新项目统计
  IF TG_TABLE_NAME = 'permits' THEN
    UPDATE companies SET
      total_projects = (SELECT COUNT(*) FROM permits WHERE company_id = NEW.company_id),
      total_value = (SELECT COALESCE(SUM(reported_cost), 0) FROM permits WHERE company_id = NEW.company_id),
      avg_project_value = (SELECT AVG(reported_cost) FROM permits WHERE company_id = NEW.company_id),
      updated_at = NOW()
    WHERE id = NEW.company_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_stats();

CREATE TRIGGER trigger_update_permit_stats
  AFTER INSERT OR UPDATE OR DELETE ON permits
  FOR EACH ROW
  EXECUTE FUNCTION update_company_stats();

-- ============================================
-- 10. 平台统计函数
-- ============================================

CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_companies BIGINT,
  total_industries BIGINT,
  total_states BIGINT,
  total_projects BIGINT,
  total_reviews BIGINT,
  total_users BIGINT,
  avg_price_change NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM companies WHERE is_active = true),
    (SELECT COUNT(*) FROM industries WHERE is_active = true),
    (SELECT COUNT(*) FROM states WHERE is_active = true),
    (SELECT COALESCE(SUM(total_projects), 0) FROM companies WHERE is_active = true),
    (SELECT COUNT(*) FROM reviews WHERE is_active = true),
    (SELECT COUNT(*) FROM users WHERE is_active = true),
    (SELECT AVG(avg_price_change) FROM industries WHERE is_active = true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. 初始数据
-- ============================================

-- 订阅计划
INSERT INTO subscription_plans (id, name, name_zh, description, price_monthly, price_yearly, 
  searches_per_month, company_views_per_month, price_unlocks_per_month, saved_companies_limit,
  export_enabled, api_access, priority_support, basic_info, contact_info, financial_data, 
  historical_data, competitor_analysis, company_reports, real_time_alerts,
  features, badge_color, is_popular, sort_order) VALUES

('free', 'Free', '免费版', 'Basic access to company information', 0, 0,
  10, 20, 0, 5, false, false, false, true, false, false, false, false, false, false,
  '["10 searches/month", "20 company views/month", "Basic company info", "5 saved companies"]',
  'gray', false, 1),

('basic', 'Basic', '基础版', 'Essential tools for small businesses', 19.99, 199.99,
  100, 200, 20, 50, false, false, false, true, true, false, false, false, false, false,
  '["100 searches/month", "200 company views/month", "Contact information", "20 price unlocks/month", "50 saved companies"]',
  'blue', false, 2),

('pro', 'Professional', '专业版', 'Advanced features for professionals', 49.99, 499.99,
  1000, 2000, -1, 500, true, false, true, true, true, true, true, true, false, true,
  '["1000 searches/month", "2000 company views/month", "Unlimited price unlocks", "Financial data access", "Historical data & trends", "Competitor analysis", "Export to CSV/PDF", "Priority support", "Real-time alerts"]',
  'purple', true, 3),

('enterprise', 'Enterprise', '企业版', 'Complete solution for large organizations', 199.99, 1999.99,
  -1, -1, -1, -1, true, true, true, true, true, true, true, true, true, true,
  '["Unlimited everything", "API access", "Custom reports", "Dedicated support", "White-label options", "Team management", "Advanced analytics"]',
  'gold', false, 4)

ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features;

-- 美国州数据
INSERT INTO states (code, name, region, population) VALUES
('AL', 'Alabama', 'South', 5024279),
('AK', 'Alaska', 'West', 733391),
('AZ', 'Arizona', 'West', 7278717),
('AR', 'Arkansas', 'South', 3011524),
('CA', 'California', 'West', 39538223),
('CO', 'Colorado', 'West', 5773714),
('CT', 'Connecticut', 'Northeast', 3605944),
('DE', 'Delaware', 'South', 989948),
('FL', 'Florida', 'South', 21538187),
('GA', 'Georgia', 'South', 10711908),
('HI', 'Hawaii', 'West', 1455271),
('ID', 'Idaho', 'West', 1839106),
('IL', 'Illinois', 'Midwest', 12812508),
('IN', 'Indiana', 'Midwest', 6785528),
('IA', 'Iowa', 'Midwest', 3190369),
('KS', 'Kansas', 'Midwest', 2937880),
('KY', 'Kentucky', 'South', 4505836),
('LA', 'Louisiana', 'South', 4657757),
('ME', 'Maine', 'Northeast', 1362359),
('MD', 'Maryland', 'South', 6177224),
('MA', 'Massachusetts', 'Northeast', 7029917),
('MI', 'Michigan', 'Midwest', 10077331),
('MN', 'Minnesota', 'Midwest', 5706494),
('MS', 'Mississippi', 'South', 2961279),
('MO', 'Missouri', 'Midwest', 6154913),
('MT', 'Montana', 'West', 1084225),
('NE', 'Nebraska', 'Midwest', 1961504),
('NV', 'Nevada', 'West', 3104614),
('NH', 'New Hampshire', 'Northeast', 1377529),
('NJ', 'New Jersey', 'Northeast', 9288994),
('NM', 'New Mexico', 'West', 2117522),
('NY', 'New York', 'Northeast', 20201249),
('NC', 'North Carolina', 'South', 10439388),
('ND', 'North Dakota', 'Midwest', 779094),
('OH', 'Ohio', 'Midwest', 11799448),
('OK', 'Oklahoma', 'South', 3959353),
('OR', 'Oregon', 'West', 4237256),
('PA', 'Pennsylvania', 'Northeast', 13002700),
('RI', 'Rhode Island', 'Northeast', 1097379),
('SC', 'South Carolina', 'South', 5118425),
('SD', 'South Dakota', 'Midwest', 886667),
('TN', 'Tennessee', 'South', 6910840),
('TX', 'Texas', 'South', 29145505),
('UT', 'Utah', 'West', 3271616),
('VT', 'Vermont', 'Northeast', 643077),
('VA', 'Virginia', 'South', 8631393),
('WA', 'Washington', 'West', 7614893),
('WV', 'West Virginia', 'South', 1793716),
('WI', 'Wisconsin', 'Midwest', 5893718),
('WY', 'Wyoming', 'West', 576851),
('DC', 'Washington D.C.', 'South', 689545)
ON CONFLICT (code) DO NOTHING;

-- 行业数据
INSERT INTO industries (name, name_zh, slug, icon, description, default_price_unit, sort_order) VALUES
('Roofing', '屋顶', 'roofing', 'Home', 'Roofing installation, repair and maintenance', 'per sqft', 1),
('HVAC', '暖通空调', 'hvac', 'Wind', 'Heating, ventilation, and air conditioning', 'per unit', 2),
('Plumbing', '管道', 'plumbing', 'Droplet', 'Plumbing installation and repair', 'per hour', 3),
('Electrical', '电气', 'electrical', 'Zap', 'Electrical installation and repair', 'per hour', 4),
('Flooring', '地板', 'flooring', 'Grid3X3', 'Flooring installation - hardwood, tile, carpet', 'per sqft', 5),
('Painting', '油漆', 'painting', 'Paintbrush', 'Interior and exterior painting', 'per sqft', 6),
('Landscaping', '园艺', 'landscaping', 'Trees', 'Lawn care and landscaping', 'per project', 7),
('Windows & Doors', '门窗', 'windows-doors', 'DoorOpen', 'Window and door installation', 'per unit', 8),
('Siding', '壁板', 'siding', 'Square', 'Siding installation and repair', 'per sqft', 9),
('Fencing', '围栏', 'fencing', 'Fence', 'Fence installation and repair', 'per linear ft', 10),
('Pest Control', '害虫控制', 'pest-control', 'Bug', 'Pest extermination and control', 'per visit', 11),
('Solar', '太阳能', 'solar', 'Sun', 'Solar panel installation', 'per watt', 12),
('Auto Repair', '汽车维修', 'auto-repair', 'Car', 'Automotive repair and maintenance', 'per hour', 13),
('Moving', '搬家', 'moving', 'Truck', 'Moving and relocation services', 'per hour', 14),
('Pool & Spa', '泳池', 'pool-spa', 'Waves', 'Pool and spa installation and maintenance', 'per project', 15),
('Cleaning', '清洁', 'cleaning', 'Sparkles', 'Residential and commercial cleaning', 'per sqft', 16),
('General Contracting', '总承包', 'general-contracting', 'Wrench', 'General construction and remodeling', 'per project', 17),
('Retail', '零售', 'retail', 'Building2', 'Retail stores and shops', 'per item', 18),
('Supermarket', '超市', 'supermarket', 'Building2', 'Grocery and supermarket chains', 'per item', 19),
('Restaurant', '餐饮', 'restaurant', 'Building2', 'Food service and restaurants', 'per meal', 20)
ON CONFLICT (slug) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 启用 Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Public companies are viewable by everyone" ON companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view their saved companies" ON saved_companies
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can manage their saved companies" ON saved_companies
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
