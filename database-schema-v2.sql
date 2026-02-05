-- ============================================
-- 全美多行业比价平台 - 完整数据库架构 v2
-- PriceCompare Pro - 支持多行业、多地区
-- ============================================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS search_logs CASCADE;
DROP TABLE IF EXISTS saved_companies CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS price_records CASCADE;
DROP TABLE IF EXISTS permits CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. 行业表 (industries)
-- ============================================
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_zh VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50), -- Lucide icon name
  description TEXT,
  description_zh TEXT,
  company_count INTEGER DEFAULT 0,
  avg_price_change NUMERIC(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入默认行业
INSERT INTO industries (name, name_zh, slug, icon, description, sort_order) VALUES
  ('Roofing', '屋顶安装', 'roofing', 'Home', '屋顶安装、维修和更换服务', 1),
  ('Flooring', '地板安装', 'flooring', 'Grid3X3', '地板铺设、瓷砖和木地板安装', 2),
  ('HVAC', '暖通空调', 'hvac', 'Wind', '供暖、通风和空调系统安装维护', 3),
  ('Plumbing', '水管工程', 'plumbing', 'Droplet', '管道安装、维修和疏通服务', 4),
  ('Electrical', '电气工程', 'electrical', 'Zap', '电气安装、布线和维修服务', 5),
  ('Landscaping', '园艺景观', 'landscaping', 'Trees', '园林设计、草坪维护和景观美化', 6),
  ('Painting', '油漆粉刷', 'painting', 'Paintbrush', '室内外油漆和墙面装饰服务', 7),
  ('Construction', '建筑工程', 'construction', 'Building2', '新建、改建和装修工程', 8),
  ('Pest Control', '害虫防治', 'pest-control', 'Bug', '害虫消灭和预防服务', 9),
  ('Cleaning', '清洁服务', 'cleaning', 'Sparkles', '家庭和商业清洁服务', 10),
  ('Moving', '搬家服务', 'moving', 'Truck', '本地和长途搬家服务', 11),
  ('Auto Repair', '汽车维修', 'auto-repair', 'Car', '汽车维修、保养和检测服务', 12),
  ('Solar', '太阳能', 'solar', 'Sun', '太阳能板安装和维护', 13),
  ('Pool Service', '泳池服务', 'pool-service', 'Waves', '泳池建设、维护和清洁', 14),
  ('Security', '安保系统', 'security', 'Shield', '安防系统安装和监控服务', 15),
  ('Appliance Repair', '家电维修', 'appliance-repair', 'Wrench', '家用电器维修服务', 16),
  ('Concrete', '混凝土工程', 'concrete', 'Square', '混凝土浇筑和修复', 17),
  ('Fencing', '围栏工程', 'fencing', 'Fence', '围栏安装和维修', 18),
  ('Window & Door', '门窗安装', 'window-door', 'DoorOpen', '门窗安装和更换', 19),
  ('Garage Door', '车库门', 'garage-door', 'GarageDoor', '车库门安装和维修', 20);

-- ============================================
-- 2. 公司/企业表 (companies)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  initial CHAR(1),
  
  -- 行业关联
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  
  -- 地理位置
  state VARCHAR(2) NOT NULL, -- 州代码 (CA, TX, FL等)
  state_name VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- 联系信息
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
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  license_number VARCHAR(100),
  founded_year INTEGER,
  employee_count INTEGER,
  annual_revenue NUMERIC(15, 2),
  
  -- 认证信息
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
  languages TEXT[] DEFAULT ARRAY['English'],
  
  -- 营业信息
  business_hours JSONB,
  emergency_service BOOLEAN DEFAULT false,
  free_estimates BOOLEAN DEFAULT false,
  financing_available BOOLEAN DEFAULT false,
  warranty_years INTEGER,
  
  -- 项目统计
  total_projects INTEGER DEFAULT 0,
  total_value NUMERIC(15, 2) DEFAULT 0,
  
  -- 定价信息（会员可见）
  avg_price NUMERIC(12, 2),
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  price_unit VARCHAR(50) DEFAULT 'per project', -- per sqft, per hour, per project
  price_trend NUMERIC(5, 2), -- 价格变化百分比
  
  -- 系统字段
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  data_source VARCHAR(100),
  first_record_date DATE,
  last_record_date DATE,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一性约束
  CONSTRAINT unique_company_name_location UNIQUE (name, city, state)
);

-- ============================================
-- 3. 价格记录表 (price_records) - 当前价格
-- ============================================
CREATE TABLE price_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_type VARCHAR(200) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50) NOT NULL, -- per sqft, per hour, per linear ft
  min_price NUMERIC(12, 2),
  max_price NUMERIC(12, 2),
  recorded_at TIMESTAMP DEFAULT NOW(),
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. 价格历史表 (price_history) - 历史趋势
-- ============================================
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  service_type VARCHAR(200),
  state VARCHAR(2),
  city VARCHAR(100),
  price NUMERIC(12, 2) NOT NULL,
  price_unit VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT NOW(),
  month VARCHAR(7), -- YYYY-MM 格式
  data_source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. 许可证/项目记录表 (permits)
-- ============================================
CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  permit_number VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  description TEXT,
  work_type VARCHAR(200),
  reported_cost NUMERIC(15, 2),
  issue_date DATE,
  completion_date DATE,
  status VARCHAR(50),
  address TEXT,
  property_type VARCHAR(50), -- residential, commercial, industrial
  data_source VARCHAR(100),
  source_url VARCHAR(500),
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_permit UNIQUE (permit_number, city, state)
);

-- ============================================
-- 6. 用户评价表 (reviews)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  service_type VARCHAR(200),
  project_cost NUMERIC(12, 2),
  would_recommend BOOLEAN DEFAULT true,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  response TEXT, -- 公司回复
  response_at TIMESTAMP,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. 用户表 (users) - 扩展Supabase auth
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE, -- Supabase auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  company VARCHAR(200),
  
  -- 订阅信息
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, basic, pro, enterprise
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR(100),
  
  -- 使用统计
  searches_this_month INTEGER DEFAULT 0,
  price_unlocks_this_month INTEGER DEFAULT 0,
  last_search_at TIMESTAMP,
  
  -- 系统字段
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. 订阅表 (subscriptions)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- basic, pro, enterprise
  status VARCHAR(20) NOT NULL, -- active, canceled, past_due, trialing
  
  -- Stripe信息
  stripe_subscription_id VARCHAR(100),
  stripe_price_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- 时间
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  
  -- 计费
  billing_interval VARCHAR(20), -- month, year
  amount NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. 收藏公司表 (saved_companies)
-- ============================================
CREATE TABLE saved_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_saved UNIQUE (user_id, company_id)
);

-- ============================================
-- 10. 搜索日志表 (search_logs)
-- ============================================
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query VARCHAR(500),
  filters JSONB,
  result_count INTEGER,
  industry_id UUID,
  state VARCHAR(2),
  city VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 11. 创建索引提升查询性能
-- ============================================

-- 公司表索引
CREATE INDEX idx_companies_industry ON companies(industry_id);
CREATE INDEX idx_companies_state ON companies(state);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_state_city ON companies(state, city);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_rating ON companies(rating DESC NULLS LAST);
CREATE INDEX idx_companies_total_projects ON companies(total_projects DESC);
CREATE INDEX idx_companies_avg_price ON companies(avg_price);
CREATE INDEX idx_companies_featured ON companies(is_featured DESC, rating DESC NULLS LAST);
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 价格记录索引
CREATE INDEX idx_price_records_company ON price_records(company_id);
CREATE INDEX idx_price_records_service ON price_records(service_type);
CREATE INDEX idx_price_records_date ON price_records(recorded_at DESC);

-- 价格历史索引
CREATE INDEX idx_price_history_company ON price_history(company_id);
CREATE INDEX idx_price_history_industry ON price_history(industry_id);
CREATE INDEX idx_price_history_state ON price_history(state);
CREATE INDEX idx_price_history_month ON price_history(month DESC);

-- 许可证索引
CREATE INDEX idx_permits_company ON permits(company_id);
CREATE INDEX idx_permits_city ON permits(city);
CREATE INDEX idx_permits_state ON permits(state);
CREATE INDEX idx_permits_date ON permits(issue_date DESC);
CREATE INDEX idx_permits_source ON permits(data_source);

-- 评价索引
CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(created_at DESC);

-- 用户索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- 订阅索引
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- 收藏索引
CREATE INDEX idx_saved_user ON saved_companies(user_id);
CREATE INDEX idx_saved_company ON saved_companies(company_id);

-- 搜索日志索引
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_date ON search_logs(created_at DESC);

-- ============================================
-- 12. 创建视图
-- ============================================

-- 行业统计视图
CREATE OR REPLACE VIEW industry_stats AS
SELECT 
  i.id,
  i.name,
  i.slug,
  i.icon,
  COUNT(DISTINCT c.id) as company_count,
  COUNT(DISTINCT c.state) as state_count,
  AVG(c.rating) as avg_rating,
  AVG(c.avg_price) as avg_price,
  SUM(c.total_projects) as total_projects,
  i.avg_price_change as price_trend
FROM industries i
LEFT JOIN companies c ON c.industry_id = i.id AND c.is_active = true
WHERE i.is_active = true
GROUP BY i.id, i.name, i.slug, i.icon, i.avg_price_change
ORDER BY company_count DESC;

-- 州统计视图
CREATE OR REPLACE VIEW state_stats AS
SELECT 
  state,
  state_name,
  COUNT(DISTINCT id) as company_count,
  COUNT(DISTINCT city) as city_count,
  COUNT(DISTINCT industry_id) as industry_count,
  AVG(rating) as avg_rating,
  AVG(avg_price) as avg_price,
  SUM(total_projects) as total_projects
FROM companies
WHERE is_active = true
GROUP BY state, state_name
ORDER BY company_count DESC;

-- 热门公司视图
CREATE OR REPLACE VIEW top_companies AS
SELECT 
  c.*,
  i.name as industry_name,
  i.slug as industry_slug,
  i.icon as industry_icon
FROM companies c
LEFT JOIN industries i ON c.industry_id = i.id
WHERE c.is_active = true
  AND c.total_projects >= 5
ORDER BY 
  c.is_featured DESC,
  c.rating DESC NULLS LAST,
  c.total_projects DESC
LIMIT 100;

-- 价格趋势视图
CREATE OR REPLACE VIEW price_trends AS
SELECT 
  ph.industry_id,
  i.name as industry_name,
  ph.state,
  ph.month,
  AVG(ph.price) as avg_price,
  COUNT(DISTINCT ph.company_id) as sample_size
FROM price_history ph
JOIN industries i ON ph.industry_id = i.id
GROUP BY ph.industry_id, i.name, ph.state, ph.month
ORDER BY ph.month DESC, i.name;

-- ============================================
-- 13. 启用行级安全性 (RLS)
-- ============================================
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. 创建RLS策略
-- ============================================

-- 公开数据（任何人可读）
CREATE POLICY "Public read industries" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read permits" ON permits FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (is_approved = true);

-- 价格数据（需要登录，部分需要订阅）
CREATE POLICY "Auth read price_records" ON price_records FOR SELECT USING (true);
CREATE POLICY "Auth read price_history" ON price_history FOR SELECT USING (true);

-- 用户数据（只能访问自己的）
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid()::text = auth_id::text);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid()::text = auth_id::text);

-- 订阅数据
CREATE POLICY "Users read own subscriptions" ON subscriptions FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 收藏数据
CREATE POLICY "Users manage own saved" ON saved_companies FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 搜索日志（只能读自己的）
CREATE POLICY "Users read own logs" ON search_logs FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Anyone can insert logs" ON search_logs FOR INSERT WITH CHECK (true);

-- 服务端写入策略
CREATE POLICY "Service role full access industries" ON industries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access price_records" ON price_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access price_history" ON price_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access permits" ON permits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 15. 创建函数和触发器
-- ============================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
CREATE TRIGGER update_industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 更新行业公司数量函数
CREATE OR REPLACE FUNCTION update_industry_company_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新旧行业的数量
  IF TG_OP = 'UPDATE' AND OLD.industry_id IS DISTINCT FROM NEW.industry_id THEN
    UPDATE industries SET company_count = (
      SELECT COUNT(*) FROM companies WHERE industry_id = OLD.industry_id AND is_active = true
    ) WHERE id = OLD.industry_id;
  END IF;
  
  -- 更新新行业的数量
  IF NEW.industry_id IS NOT NULL THEN
    UPDATE industries SET company_count = (
      SELECT COUNT(*) FROM companies WHERE industry_id = NEW.industry_id AND is_active = true
    ) WHERE id = NEW.industry_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_industry_count_on_company_change
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_industry_company_count();

-- 生成公司slug函数
CREATE OR REPLACE FUNCTION generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.name || '-' || NEW.city || '-' || NEW.state, '[^a-zA-Z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    ));
    -- 确保唯一性
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug = NEW.slug || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_company_slug_trigger
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION generate_company_slug();

-- 设置公司首字母
CREATE OR REPLACE FUNCTION set_company_initial()
RETURNS TRIGGER AS $$
BEGIN
  NEW.initial = UPPER(SUBSTRING(NEW.name, 1, 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_company_initial_trigger
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_company_initial();

-- 更新公司评分函数
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE company_id = NEW.company_id AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id AND is_approved = true)
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_rating();

-- 获取平台统计函数
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_companies BIGINT,
  total_industries BIGINT,
  total_states BIGINT,
  total_cities BIGINT,
  total_projects BIGINT,
  total_reviews BIGINT,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM companies WHERE is_active = true),
    (SELECT COUNT(*) FROM industries WHERE is_active = true),
    (SELECT COUNT(DISTINCT state) FROM companies WHERE is_active = true),
    (SELECT COUNT(DISTINCT city) FROM companies WHERE is_active = true),
    (SELECT COALESCE(SUM(total_projects), 0) FROM companies WHERE is_active = true),
    (SELECT COUNT(*) FROM reviews WHERE is_approved = true),
    (SELECT ROUND(AVG(rating), 2) FROM companies WHERE is_active = true AND rating IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成！
-- ============================================
