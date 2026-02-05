-- ============================================
-- PriceCompare Pro - 全美多行业比价平台数据库
-- Version 2.0 - 支持多行业、订阅制、真实数据
-- ============================================

-- 删除旧表（如果需要重建）
-- DROP TABLE IF EXISTS price_history CASCADE;
-- DROP TABLE IF EXISTS user_favorites CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS service_prices CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS subcategories CASCADE;
-- DROP TABLE IF EXISTS industries CASCADE;
-- DROP TABLE IF EXISTS regions CASCADE;
-- DROP TABLE IF EXISTS states CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS subscription_plans CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. 用户系统
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  
  -- Stripe相关
  stripe_customer_id VARCHAR(255),
  
  -- 使用统计
  searches_this_month INTEGER DEFAULT 0,
  last_search_reset TIMESTAMP DEFAULT NOW(),
  
  -- 系统字段
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- 价格
  price_monthly NUMERIC(10, 2) NOT NULL,
  price_yearly NUMERIC(10, 2) NOT NULL,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  -- 功能限制
  max_searches_per_month INTEGER, -- NULL表示无限
  can_unlock_prices BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  can_access_api BOOLEAN DEFAULT false,
  can_view_trends BOOLEAN DEFAULT false,
  can_compare_unlimited BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  
  -- 排序和显示
  sort_order INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) REFERENCES subscription_plans(id),
  
  -- Stripe订阅信息
  stripe_subscription_id VARCHAR(255),
  stripe_status VARCHAR(50), -- active, canceled, past_due, etc.
  
  -- 订阅周期
  billing_period VARCHAR(20) CHECK (billing_period IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. 地区系统
-- ============================================

-- 州表
CREATE TABLE IF NOT EXISTS states (
  code CHAR(2) PRIMARY KEY, -- 如: CA, TX, FL
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50), -- 如: West, South, Northeast, Midwest
  timezone VARCHAR(50),
  population INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- 地区/城市表
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES states(code),
  name VARCHAR(100) NOT NULL, -- 城市名
  county VARCHAR(100),
  zip_codes TEXT[], -- 该地区的邮编列表
  population INTEGER,
  median_income NUMERIC(12, 2),
  cost_of_living_index NUMERIC(5, 2), -- 生活成本指数，100为全国平均
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_metro BOOLEAN DEFAULT false, -- 是否为大都市区
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(state_code, name)
);

-- ============================================
-- 3. 行业分类系统
-- ============================================

-- 行业大类表
CREATE TABLE IF NOT EXISTS industries (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_cn VARCHAR(100), -- 中文名
  icon VARCHAR(50), -- 图标名称
  description TEXT,
  description_cn TEXT,
  color VARCHAR(20), -- 主题色
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 子分类表
CREATE TABLE IF NOT EXISTS subcategories (
  id VARCHAR(50) PRIMARY KEY,
  industry_id VARCHAR(50) REFERENCES industries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  name_cn VARCHAR(100),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 服务/产品类型表
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id VARCHAR(50) REFERENCES subcategories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255),
  description TEXT,
  
  -- 价格单位
  price_unit VARCHAR(50), -- per_sqft, per_hour, per_item, per_project等
  price_unit_display VARCHAR(100), -- 显示文字：每平方英尺、每小时等
  
  -- 典型价格范围
  typical_price_min NUMERIC(12, 2),
  typical_price_max NUMERIC(12, 2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. 公司/企业数据
-- ============================================

-- 公司表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255), -- 法定名称
  dba_name VARCHAR(255), -- Doing Business As
  industry_id VARCHAR(50) REFERENCES industries(id),
  subcategory_id VARCHAR(50) REFERENCES subcategories(id),
  
  -- 位置
  state_code CHAR(2) REFERENCES states(code),
  region_id UUID REFERENCES regions(id),
  address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(20),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- 联系方式
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  
  -- 社交媒体
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  yelp_url VARCHAR(500),
  
  -- 公司详情
  description TEXT,
  year_founded INTEGER,
  employee_count_range VARCHAR(50), -- 1-10, 11-50, 51-200等
  annual_revenue_range VARCHAR(50), -- 估计年收入范围
  
  -- 资质认证
  license_number VARCHAR(100),
  license_state CHAR(2),
  license_expiry DATE,
  insurance_verified BOOLEAN DEFAULT false,
  bonded BOOLEAN DEFAULT false,
  certifications TEXT[], -- 认证列表
  
  -- 评分
  overall_rating NUMERIC(3, 2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  review_count INTEGER DEFAULT 0,
  bbb_rating VARCHAR(10),
  google_rating NUMERIC(3, 2),
  yelp_rating NUMERIC(3, 2),
  
  -- 业务信息
  business_hours JSONB,
  service_areas TEXT[], -- 服务区域
  payment_methods TEXT[], -- 接受的支付方式
  languages TEXT[], -- 服务语言
  
  -- 特色
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_premium_listing BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- 数据来源
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  last_verified_at TIMESTAMP,
  
  -- 系统字段
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 公司服务价格表
CREATE TABLE IF NOT EXISTS service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  
  -- 价格信息
  price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50), -- 继承自service或自定义
  price_min NUMERIC(12, 2), -- 最低价
  price_max NUMERIC(12, 2), -- 最高价
  
  -- 价格上下文
  is_estimated BOOLEAN DEFAULT false, -- 是否为估计价格
  includes_materials BOOLEAN, -- 是否包含材料
  includes_labor BOOLEAN, -- 是否包含人工
  notes TEXT, -- 备注
  
  -- 有效期
  effective_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  
  -- 数据来源
  data_source VARCHAR(100), -- government, user_submitted, scraped, api
  source_url VARCHAR(500),
  confidence_score NUMERIC(3, 2), -- 数据可信度 0-1
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 价格历史表（用于趋势分析）
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  
  price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50),
  recorded_at DATE NOT NULL,
  data_source VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. 用户互动数据
-- ============================================

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, company_id)
);

-- 用户评论表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  
  -- 具体评分
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  
  -- 审核
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 价格报告表（用户提交的价格数据）
CREATE TABLE IF NOT EXISTS price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  
  reported_price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50),
  service_date DATE,
  description TEXT,
  
  -- 审核状态
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. 数据爬取管理
-- ============================================

-- 数据源配置表
CREATE TABLE IF NOT EXISTS data_sources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50), -- government_api, web_scrape, partner_api
  base_url VARCHAR(500),
  api_key_env_var VARCHAR(100), -- 环境变量名
  
  -- 配置
  rate_limit INTEGER, -- 每分钟请求限制
  config JSONB, -- 额外配置
  
  -- 状态
  last_fetch_at TIMESTAMP,
  last_fetch_status VARCHAR(50),
  total_records_fetched INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 爬取任务日志
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id VARCHAR(50) REFERENCES data_sources(id),
  
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(50), -- running, success, failed, partial
  
  records_fetched INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  errors JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_regions_state ON regions(state_code);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);

CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry_id);
CREATE INDEX IF NOT EXISTS idx_companies_subcategory ON companies(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_companies_state ON companies(state_code);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(region_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_service_prices_company ON service_prices(company_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_service ON service_prices(service_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_price ON service_prices(price);

CREATE INDEX IF NOT EXISTS idx_price_history_company ON price_history(company_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- ============================================
-- 8. 视图
-- ============================================

-- 行业统计视图
CREATE OR REPLACE VIEW industry_stats AS
SELECT 
  i.id,
  i.name,
  i.icon,
  COUNT(DISTINCT c.id) as company_count,
  COUNT(DISTINCT c.state_code) as states_covered,
  AVG(sp.price) as avg_price,
  MIN(sp.price) as min_price,
  MAX(sp.price) as max_price
FROM industries i
LEFT JOIN companies c ON i.id = c.industry_id AND c.is_active = true
LEFT JOIN service_prices sp ON c.id = sp.company_id AND sp.is_active = true
WHERE i.is_active = true
GROUP BY i.id, i.name, i.icon;

-- 地区价格比较视图
CREATE OR REPLACE VIEW regional_price_comparison AS
SELECT 
  r.id as region_id,
  r.name as city,
  r.state_code,
  s.name as state_name,
  i.id as industry_id,
  i.name as industry_name,
  COUNT(DISTINCT c.id) as company_count,
  AVG(sp.price) as avg_price,
  MIN(sp.price) as min_price,
  MAX(sp.price) as max_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sp.price) as median_price
FROM regions r
JOIN states s ON r.state_code = s.code
LEFT JOIN companies c ON r.id = c.region_id AND c.is_active = true
LEFT JOIN industries i ON c.industry_id = i.id
LEFT JOIN service_prices sp ON c.id = sp.company_id AND sp.is_active = true
WHERE r.is_active = true
GROUP BY r.id, r.name, r.state_code, s.name, i.id, i.name;

-- ============================================
-- 9. RLS策略
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public read industries" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read states" ON states FOR SELECT USING (true);
CREATE POLICY "Public read regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subscription_plans" ON subscription_plans FOR SELECT USING (is_active = true);

-- 受限读取策略（需要订阅）
CREATE POLICY "Subscribers read service_prices" ON service_prices FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);

-- 用户自己的数据
CREATE POLICY "Users manage own favorites" ON user_favorites 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON reviews 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own price_reports" ON price_reports 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 10. 初始数据
-- ============================================

-- 订阅计划
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, max_searches_per_month, can_unlock_prices, can_export_data, can_access_api, can_view_trends, can_compare_unlimited, priority_support, sort_order, is_popular) VALUES
('free', 'Free', 'Basic access to explore the platform', 0, 0, 10, false, false, false, false, false, false, 1, false),
('basic', 'Basic', 'Essential features for individuals', 9.99, 99.99, 100, true, false, false, false, false, false, 2, false),
('pro', 'Professional', 'Advanced features for professionals', 29.99, 299.99, NULL, true, true, false, true, true, false, 3, true),
('enterprise', 'Enterprise', 'Full access with API for businesses', 99.99, 999.99, NULL, true, true, true, true, true, true, 4, false)
ON CONFLICT (id) DO NOTHING;

-- 美国各州
INSERT INTO states (code, name, region, timezone) VALUES
('AL', 'Alabama', 'South', 'America/Chicago'),
('AK', 'Alaska', 'West', 'America/Anchorage'),
('AZ', 'Arizona', 'West', 'America/Phoenix'),
('AR', 'Arkansas', 'South', 'America/Chicago'),
('CA', 'California', 'West', 'America/Los_Angeles'),
('CO', 'Colorado', 'West', 'America/Denver'),
('CT', 'Connecticut', 'Northeast', 'America/New_York'),
('DE', 'Delaware', 'Northeast', 'America/New_York'),
('FL', 'Florida', 'South', 'America/New_York'),
('GA', 'Georgia', 'South', 'America/New_York'),
('HI', 'Hawaii', 'West', 'Pacific/Honolulu'),
('ID', 'Idaho', 'West', 'America/Boise'),
('IL', 'Illinois', 'Midwest', 'America/Chicago'),
('IN', 'Indiana', 'Midwest', 'America/Indiana/Indianapolis'),
('IA', 'Iowa', 'Midwest', 'America/Chicago'),
('KS', 'Kansas', 'Midwest', 'America/Chicago'),
('KY', 'Kentucky', 'South', 'America/New_York'),
('LA', 'Louisiana', 'South', 'America/Chicago'),
('ME', 'Maine', 'Northeast', 'America/New_York'),
('MD', 'Maryland', 'Northeast', 'America/New_York'),
('MA', 'Massachusetts', 'Northeast', 'America/New_York'),
('MI', 'Michigan', 'Midwest', 'America/Detroit'),
('MN', 'Minnesota', 'Midwest', 'America/Chicago'),
('MS', 'Mississippi', 'South', 'America/Chicago'),
('MO', 'Missouri', 'Midwest', 'America/Chicago'),
('MT', 'Montana', 'West', 'America/Denver'),
('NE', 'Nebraska', 'Midwest', 'America/Chicago'),
('NV', 'Nevada', 'West', 'America/Los_Angeles'),
('NH', 'New Hampshire', 'Northeast', 'America/New_York'),
('NJ', 'New Jersey', 'Northeast', 'America/New_York'),
('NM', 'New Mexico', 'West', 'America/Denver'),
('NY', 'New York', 'Northeast', 'America/New_York'),
('NC', 'North Carolina', 'South', 'America/New_York'),
('ND', 'North Dakota', 'Midwest', 'America/Chicago'),
('OH', 'Ohio', 'Midwest', 'America/New_York'),
('OK', 'Oklahoma', 'South', 'America/Chicago'),
('OR', 'Oregon', 'West', 'America/Los_Angeles'),
('PA', 'Pennsylvania', 'Northeast', 'America/New_York'),
('RI', 'Rhode Island', 'Northeast', 'America/New_York'),
('SC', 'South Carolina', 'South', 'America/New_York'),
('SD', 'South Dakota', 'Midwest', 'America/Chicago'),
('TN', 'Tennessee', 'South', 'America/Chicago'),
('TX', 'Texas', 'South', 'America/Chicago'),
('UT', 'Utah', 'West', 'America/Denver'),
('VT', 'Vermont', 'Northeast', 'America/New_York'),
('VA', 'Virginia', 'South', 'America/New_York'),
('WA', 'Washington', 'West', 'America/Los_Angeles'),
('WV', 'West Virginia', 'South', 'America/New_York'),
('WI', 'Wisconsin', 'Midwest', 'America/Chicago'),
('WY', 'Wyoming', 'West', 'America/Denver'),
('DC', 'Washington D.C.', 'Northeast', 'America/New_York')
ON CONFLICT (code) DO NOTHING;

-- 行业分类
INSERT INTO industries (id, name, name_cn, icon, description, color, sort_order) VALUES
('home-services', 'Home Services', '家居服务', '🏠', 'Roofing, HVAC, Plumbing, Electrical and more', '#3B82F6', 1),
('construction', 'Construction', '建筑工程', '🏗️', 'General contractors, builders, renovation', '#F59E0B', 2),
('automotive', 'Automotive', '汽车服务', '🚗', 'Auto repair, detailing, tire services', '#EF4444', 3),
('healthcare', 'Healthcare', '医疗健康', '🏥', 'Medical services, dental, optometry', '#10B981', 4),
('retail', 'Retail', '零售商业', '🛒', 'Grocery, supermarkets, department stores', '#8B5CF6', 5),
('food-beverage', 'Food & Beverage', '餐饮服务', '🍽️', 'Restaurants, catering, food delivery', '#F97316', 6),
('professional', 'Professional Services', '专业服务', '💼', 'Legal, accounting, consulting', '#6366F1', 7),
('beauty-wellness', 'Beauty & Wellness', '美容健身', '💆', 'Salons, spas, fitness centers', '#EC4899', 8),
('technology', 'Technology', '科技服务', '💻', 'IT services, software, repairs', '#06B6D4', 9),
('real-estate', 'Real Estate', '房地产', '🏢', 'Property management, realtors, movers', '#84CC16', 10),
('education', 'Education', '教育培训', '📚', 'Tutoring, schools, training centers', '#A855F7', 11),
('financial', 'Financial Services', '金融服务', '🏦', 'Banks, insurance, investments', '#14B8A6', 12)
ON CONFLICT (id) DO NOTHING;

-- 子分类示例
INSERT INTO subcategories (id, industry_id, name, name_cn, sort_order) VALUES
-- 家居服务
('roofing', 'home-services', 'Roofing', '屋顶服务', 1),
('hvac', 'home-services', 'HVAC', '暖通空调', 2),
('plumbing', 'home-services', 'Plumbing', '管道水暖', 3),
('electrical', 'home-services', 'Electrical', '电气服务', 4),
('flooring', 'home-services', 'Flooring', '地板安装', 5),
('painting', 'home-services', 'Painting', '油漆粉刷', 6),
('landscaping', 'home-services', 'Landscaping', '园林绿化', 7),
('cleaning', 'home-services', 'Cleaning', '清洁服务', 8),
-- 汽车服务
('auto-repair', 'automotive', 'Auto Repair', '汽车维修', 1),
('auto-body', 'automotive', 'Auto Body', '车身修复', 2),
('tire-service', 'automotive', 'Tire Service', '轮胎服务', 3),
('oil-change', 'automotive', 'Oil Change', '换油服务', 4),
('car-wash', 'automotive', 'Car Wash', '洗车服务', 5),
-- 医疗健康
('general-medical', 'healthcare', 'General Medical', '全科医疗', 1),
('dental', 'healthcare', 'Dental', '牙科服务', 2),
('optometry', 'healthcare', 'Optometry', '眼科验光', 3),
('pharmacy', 'healthcare', 'Pharmacy', '药房', 4),
('urgent-care', 'healthcare', 'Urgent Care', '急诊护理', 5),
-- 零售
('grocery', 'retail', 'Grocery', '杂货超市', 1),
('electronics', 'retail', 'Electronics', '电子产品', 2),
('furniture', 'retail', 'Furniture', '家具家居', 3),
('clothing', 'retail', 'Clothing', '服装服饰', 4)
ON CONFLICT (id) DO NOTHING;

-- 服务类型示例
INSERT INTO services (subcategory_id, name, name_cn, price_unit, price_unit_display, typical_price_min, typical_price_max) VALUES
-- 屋顶服务
('roofing', 'Roof Replacement (Asphalt Shingles)', '屋顶更换(沥青瓦)', 'per_sqft', '/sq ft', 3.50, 7.50),
('roofing', 'Roof Repair', '屋顶维修', 'per_project', '/project', 300, 1500),
('roofing', 'Metal Roof Installation', '金属屋顶安装', 'per_sqft', '/sq ft', 8.00, 14.00),
('roofing', 'Gutter Installation', '排水槽安装', 'per_linear_ft', '/linear ft', 4.00, 8.00),
-- 暖通空调
('hvac', 'AC Installation', '空调安装', 'per_unit', '/unit', 3000, 7000),
('hvac', 'Furnace Installation', '暖炉安装', 'per_unit', '/unit', 2500, 6000),
('hvac', 'HVAC Repair', '暖通维修', 'per_hour', '/hour', 75, 150),
-- 管道水暖
('plumbing', 'Pipe Repair', '管道维修', 'per_hour', '/hour', 45, 200),
('plumbing', 'Water Heater Installation', '热水器安装', 'per_unit', '/unit', 800, 2000),
('plumbing', 'Drain Cleaning', '下水道疏通', 'per_service', '/service', 100, 300),
-- 地板
('flooring', 'Hardwood Flooring', '硬木地板', 'per_sqft', '/sq ft', 6.00, 12.00),
('flooring', 'Tile Installation', '瓷砖安装', 'per_sqft', '/sq ft', 4.00, 15.00),
('flooring', 'Carpet Installation', '地毯安装', 'per_sqft', '/sq ft', 2.00, 8.00),
-- 汽车服务
('oil-change', 'Conventional Oil Change', '常规换油', 'per_service', '/service', 25, 50),
('oil-change', 'Synthetic Oil Change', '全合成机油更换', 'per_service', '/service', 45, 90),
('tire-service', 'Tire Rotation', '轮胎换位', 'per_service', '/service', 20, 50),
('tire-service', 'Tire Replacement (per tire)', '单轮胎更换', 'per_tire', '/tire', 100, 300),
-- 牙科
('dental', 'Dental Cleaning', '牙齿清洁', 'per_visit', '/visit', 75, 200),
('dental', 'Teeth Whitening', '牙齿美白', 'per_treatment', '/treatment', 300, 800),
('dental', 'Dental Crown', '牙冠', 'per_tooth', '/tooth', 800, 2000)
ON CONFLICT DO NOTHING;

-- 数据源配置
INSERT INTO data_sources (id, name, source_type, base_url, rate_limit) VALUES
('chicago_permits', 'Chicago Building Permits', 'government_api', 'https://data.cityofchicago.org/resource/ydr8-5enu.json', 60),
('nyc_permits', 'NYC Building Permits', 'government_api', 'https://data.cityofnewyork.us/resource/ipu4-2vj7.json', 60),
('la_permits', 'LA Building Permits', 'government_api', 'https://data.lacity.org/resource/yv23-pmwf.json', 60),
('austin_permits', 'Austin Building Permits', 'government_api', 'https://data.austintexas.gov/resource/3syk-w9eu.json', 60),
('seattle_permits', 'Seattle Building Permits', 'government_api', 'https://data.seattle.gov/resource/76t5-zqzr.json', 60),
('yelp_api', 'Yelp Fusion API', 'partner_api', 'https://api.yelp.com/v3', 30),
('google_places', 'Google Places API', 'partner_api', 'https://maps.googleapis.com/maps/api/place', 100)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 完成！
-- ============================================
