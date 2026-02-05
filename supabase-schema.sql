-- ============================================
-- 屋顶承包商数据库 Schema
-- ============================================

-- 1. 承包商表 (contractors)
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  initial CHAR(1),
  
  -- 基本信息
  city VARCHAR(100),
  state VARCHAR(50),
  address TEXT,
  zip_code VARCHAR(20),
  
  -- 联系方式
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  
  -- 社交媒体
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  
  -- 公司详情
  description TEXT,
  license_number VARCHAR(100),
  founded_year INTEGER,
  employee_count INTEGER,
  insurance_verified BOOLEAN DEFAULT false,
  bonded BOOLEAN DEFAULT false,
  
  -- 服务信息
  service_areas TEXT[], -- PostgreSQL数组类型，存储服务区域列表
  specialties TEXT[], -- 专业领域（如：residential, commercial, metal roofing等）
  emergency_service BOOLEAN DEFAULT false,
  warranty_years INTEGER,
  
  -- 评分和评价
  rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5), -- 0-5星评分
  review_count INTEGER DEFAULT 0,
  bbb_rating VARCHAR(10), -- Better Business Bureau评级（A+, A, B+等）
  
  -- 营业信息
  business_hours JSONB, -- 存储营业时间 {"monday": "8:00-17:00", ...}
  logo_url VARCHAR(500),
  
  -- 项目统计
  total_projects INTEGER DEFAULT 0,
  total_value NUMERIC(12, 2) DEFAULT 0,
  avg_quote NUMERIC(10, 2),
  contractor_price NUMERIC(10, 2),
  
  -- 系统字段
  verified_at TIMESTAMP DEFAULT NOW(),
  first_permit_date DATE,
  last_permit_date DATE,
  is_featured BOOLEAN DEFAULT false, -- 是否为推荐承包商
  is_active BOOLEAN DEFAULT true, -- 是否营业中
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 许可证记录表 (permits)
CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  permit_number VARCHAR(100) UNIQUE,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  description TEXT,
  work_type VARCHAR(100),
  reported_cost NUMERIC(12, 2),
  issue_date DATE,
  status VARCHAR(50),
  address TEXT,
  data_source VARCHAR(100), -- 数据来源（芝加哥、纽约等）
  raw_data JSONB, -- 存储原始API响应
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_contractors_name ON contractors(name);
CREATE INDEX IF NOT EXISTS idx_contractors_city ON contractors(city);
CREATE INDEX IF NOT EXISTS idx_contractors_state ON contractors(state);
CREATE INDEX IF NOT EXISTS idx_contractors_zip_code ON contractors(zip_code);
CREATE INDEX IF NOT EXISTS idx_contractors_total_projects ON contractors(total_projects DESC);
CREATE INDEX IF NOT EXISTS idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_contractors_is_featured ON contractors(is_featured);
CREATE INDEX IF NOT EXISTS idx_contractors_is_active ON contractors(is_active);
CREATE INDEX IF NOT EXISTS idx_permits_contractor_id ON permits(contractor_id);
CREATE INDEX IF NOT EXISTS idx_permits_city ON permits(city);
CREATE INDEX IF NOT EXISTS idx_permits_issue_date ON permits(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_permits_data_source ON permits(data_source);

-- 4. 创建视图：按城市统计承包商
CREATE OR REPLACE VIEW contractor_stats_by_city AS
SELECT 
  city,
  state,
  COUNT(DISTINCT id) as contractor_count,
  SUM(total_projects) as total_projects,
  AVG(avg_quote) as avg_quote_price,
  MAX(updated_at) as last_update
FROM contractors
WHERE city IS NOT NULL
GROUP BY city, state
ORDER BY total_projects DESC;

-- 5. 创建视图：热门承包商（按项目数量排序）
CREATE OR REPLACE VIEW top_contractors AS
SELECT 
  id,
  name,
  initial,
  city,
  state,
  phone,
  email,
  website,
  total_projects,
  avg_quote,
  contractor_price,
  rating,
  review_count,
  verified_at,
  logo_url,
  is_featured,
  service_areas,
  specialties,
  ROUND((total_value / NULLIF(total_projects, 0))::NUMERIC, 2) as calculated_avg
FROM contractors
WHERE total_projects >= 3 AND is_active = true
ORDER BY 
  is_featured DESC,
  rating DESC NULLS LAST,
  total_projects DESC
LIMIT 100;

-- 6. 启用行级安全性 (RLS)
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- 7. 创建公开读取策略（任何人都可以读取数据）
CREATE POLICY "Allow public read access on contractors"
  ON contractors FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on permits"
  ON permits FOR SELECT
  USING (true);

-- 8. 创建服务角色写入策略（只有服务端可以写入）
CREATE POLICY "Allow service role to insert contractors"
  ON contractors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update contractors"
  ON contractors FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to insert permits"
  ON permits FOR INSERT
  WITH CHECK (true);

-- 9. 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractors_updated_at
BEFORE UPDATE ON contractors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 10. 创建统计函数
CREATE OR REPLACE FUNCTION get_contractor_summary()
RETURNS TABLE (
  total_contractors BIGINT,
  total_permits BIGINT,
  total_cities BIGINT,
  avg_projects_per_contractor NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id),
    COUNT(p.id),
    COUNT(DISTINCT c.city),
    AVG(c.total_projects)
  FROM contractors c
  LEFT JOIN permits p ON c.id = p.contractor_id;
END;
$$ LANGUAGE plpgsql;

-- 11. 创建视图：推荐承包商（用于首页展示）
CREATE OR REPLACE VIEW featured_contractors AS
SELECT 
  id,
  name,
  initial,
  city,
  state,
  phone,
  email,
  website,
  logo_url,
  description,
  total_projects,
  avg_quote,
  contractor_price,
  rating,
  review_count,
  specialties,
  service_areas,
  emergency_service,
  warranty_years,
  verified_at
FROM contractors
WHERE is_featured = true AND is_active = true
ORDER BY rating DESC NULLS LAST, total_projects DESC;

-- 12. 创建视图：按服务类型分组的承包商
CREATE OR REPLACE VIEW contractors_by_specialty AS
SELECT 
  unnest(specialties) as specialty,
  COUNT(*) as contractor_count,
  AVG(rating) as avg_rating,
  AVG(avg_quote) as avg_price
FROM contractors
WHERE is_active = true AND specialties IS NOT NULL
GROUP BY unnest(specialties)
ORDER BY contractor_count DESC;

-- 13. 创建函数：搜索承包商（支持多条件搜索）
CREATE OR REPLACE FUNCTION search_contractors(
  search_name VARCHAR DEFAULT NULL,
  search_city VARCHAR DEFAULT NULL,
  search_state VARCHAR DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  max_quote NUMERIC DEFAULT NULL,
  required_specialties TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  city VARCHAR,
  state VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  rating NUMERIC,
  review_count INTEGER,
  total_projects INTEGER,
  avg_quote NUMERIC,
  contractor_price NUMERIC,
  specialties TEXT[],
  logo_url VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.city,
    c.state,
    c.phone,
    c.email,
    c.website,
    c.rating,
    c.review_count,
    c.total_projects,
    c.avg_quote,
    c.contractor_price,
    c.specialties,
    c.logo_url
  FROM contractors c
  WHERE 
    c.is_active = true
    AND (search_name IS NULL OR c.name ILIKE '%' || search_name || '%')
    AND (search_city IS NULL OR c.city ILIKE '%' || search_city || '%')
    AND (search_state IS NULL OR c.state = search_state)
    AND (min_rating IS NULL OR c.rating >= min_rating)
    AND (max_quote IS NULL OR c.avg_quote <= max_quote)
    AND (required_specialties IS NULL OR c.specialties && required_specialties)
  ORDER BY 
    c.is_featured DESC,
    c.rating DESC NULLS LAST,
    c.total_projects DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 14. 创建函数：获取承包商详细信息（包括最近的项目）
CREATE OR REPLACE FUNCTION get_contractor_details(contractor_uuid UUID)
RETURNS TABLE (
  -- 基本信息
  id UUID,
  name VARCHAR,
  description TEXT,
  -- 联系信息
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  -- 社交媒体
  facebook_url VARCHAR,
  instagram_url VARCHAR,
  linkedin_url VARCHAR,
  -- 评分和统计
  rating NUMERIC,
  review_count INTEGER,
  bbb_rating VARCHAR,
  total_projects INTEGER,
  total_value NUMERIC,
  avg_quote NUMERIC,
  contractor_price NUMERIC,
  -- 服务信息
  specialties TEXT[],
  service_areas TEXT[],
  emergency_service BOOLEAN,
  warranty_years INTEGER,
  insurance_verified BOOLEAN,
  bonded BOOLEAN,
  -- 其他
  logo_url VARCHAR,
  business_hours JSONB,
  founded_year INTEGER,
  verified_at TIMESTAMP,
  -- 最近项目
  recent_permits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.phone,
    c.email,
    c.website,
    c.address,
    c.city,
    c.state,
    c.zip_code,
    c.facebook_url,
    c.instagram_url,
    c.linkedin_url,
    c.rating,
    c.review_count,
    c.bbb_rating,
    c.total_projects,
    c.total_value,
    c.avg_quote,
    c.contractor_price,
    c.specialties,
    c.service_areas,
    c.emergency_service,
    c.warranty_years,
    c.insurance_verified,
    c.bonded,
    c.logo_url,
    c.business_hours,
    c.founded_year,
    c.verified_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'permit_number', p.permit_number,
          'city', p.city,
          'issue_date', p.issue_date,
          'reported_cost', p.reported_cost,
          'description', p.description
        )
        ORDER BY p.issue_date DESC
      )
      FROM permits p
      WHERE p.contractor_id = c.id
      LIMIT 10
    ) as recent_permits
  FROM contractors c
  WHERE c.id = contractor_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成！现在可以运行此SQL在Supabase中创建表结构
-- ============================================
