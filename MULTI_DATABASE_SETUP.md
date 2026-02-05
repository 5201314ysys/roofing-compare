# 多数据库方案设置指南

## 架构概述

使用 **Supabase (500MB) + Railway (8GB)** 两个免费数据库，总计 **8.5GB 存储**，可存储约 **80 万家企业完整数据**。

### 数据分片策略

**Supabase (500MB)** - 存储热门企业：
- 所有上市公司（SEC 数据）
- BBB A+ 评级企业
- 大型联邦承包商（SAM.gov 前 50,000）
- 用户高频搜索企业
- **约 50,000 家企业**

**Railway (8GB)** - 存储长尾企业：
- 其他所有企业数据
- 州注册企业
- 中小型企业
- **约 750,000 家企业**

## 步骤 1：设置 Railway 数据库

### 1.1 注册 Railway 账号

访问 https://railway.app/ 并注册：

```bash
# 使用 GitHub 账号登录（推荐）
# 免费计划：
# - 8GB 存储
# - 500 小时运行时间/月
# - 无需信用卡
```

### 1.2 创建 PostgreSQL 数据库

1. 点击 "New Project"
2. 选择 "Deploy PostgreSQL"
3. 等待部署完成（约 1-2 分钟）
4. 点击 PostgreSQL 服务获取连接信息

### 1.3 获取连接信息

在 Railway 控制台，点击 PostgreSQL → "Connect" 标签页：

```bash
# 复制以下信息：
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway

# 或者单独的连接信息：
PGHOST=[HOST]
PGPORT=[PORT]
PGUSER=postgres
PGPASSWORD=[PASSWORD]
PGDATABASE=railway
```

## 步骤 2：配置环境变量

创建 `.env.local` 文件：

```bash
# Supabase (主数据库 - 热门企业)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Railway (辅助数据库 - 长尾企业)
RAILWAY_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway

# 或者分开配置
RAILWAY_PGHOST=[HOST]
RAILWAY_PGPORT=[PORT]
RAILWAY_PGUSER=postgres
RAILWAY_PGPASSWORD=[PASSWORD]
RAILWAY_PGDATABASE=railway
```

## 步骤 3：初始化 Railway 数据库

使用相同的 schema 初始化 Railway 数据库：

```bash
# 安装 psql（如果没有）
brew install postgresql

# 连接到 Railway 数据库
psql $RAILWAY_DATABASE_URL

# 或者使用单独的参数
psql -h [HOST] -p [PORT] -U postgres -d railway
```

在 psql 中执行：

```sql
-- 复制 supabase-schema-extended.sql 的内容并执行
\i roofing-compare/supabase-schema-extended.sql

-- 或者直接从命令行执行
psql $RAILWAY_DATABASE_URL < roofing-compare/supabase-schema-extended.sql
```

## 步骤 4：Python 配置

创建 `python-scraper/db_config.py`：

```python
import os
from typing import Literal

# 数据库配置
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
RAILWAY_URL = os.getenv('RAILWAY_DATABASE_URL')

# 企业类型到数据库的映射
DatabaseType = Literal['supabase', 'railway']

def get_database_for_company(company_data: dict) -> DatabaseType:
    """
    根据企业数据决定存储到哪个数据库
    
    优先级（存入 Supabase）：
    1. 上市公司（有 SEC CIK）
    2. BBB A+ 评级
    3. 大型联邦承包商（年合同额 > $1M）
    4. 用户搜索频率高
    """
    # 上市公司
    if company_data.get('cik_number'):
        return 'supabase'
    
    # BBB A+ 评级
    if company_data.get('bbb_rating') == 'A+':
        return 'supabase'
    
    # 大型承包商
    annual_revenue = company_data.get('annual_revenue', 0)
    if annual_revenue and annual_revenue > 1_000_000:
        return 'supabase'
    
    # 默认存入 Railway
    return 'railway'

def should_cache_in_supabase(company_id: str, search_count: int) -> bool:
    """
    判断是否应该将高频搜索企业从 Railway 迁移到 Supabase
    """
    # 搜索次数超过 10 次，迁移到主数据库
    return search_count >= 10
```

## 步骤 5：更新数据同步代码

修改 `python-scraper/data_scheduler.py` 以支持双数据库：

```python
import psycopg2
from supabase import create_client, Client
from db_config import (
    SUPABASE_URL, SUPABASE_KEY, RAILWAY_URL,
    get_database_for_company
)

class MultiDatabaseManager:
    def __init__(self):
        # Supabase 客户端
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Railway PostgreSQL 连接
        self.railway_conn = psycopg2.connect(RAILWAY_URL)
        self.railway_cursor = self.railway_conn.cursor()
    
    def insert_company(self, company_data: dict):
        """插入企业数据到合适的数据库"""
        target_db = get_database_for_company(company_data)
        
        if target_db == 'supabase':
            # 插入到 Supabase
            self.supabase.table('companies').insert(company_data).execute()
        else:
            # 插入到 Railway
            columns = ', '.join(company_data.keys())
            placeholders = ', '.join(['%s'] * len(company_data))
            query = f"INSERT INTO companies ({columns}) VALUES ({placeholders})"
            self.railway_cursor.execute(query, list(company_data.values()))
            self.railway_conn.commit()
    
    def search_company(self, query: str):
        """跨数据库搜索企业"""
        # 先搜索 Supabase（热门企业）
        supabase_results = self.supabase.table('companies') \
            .select('*') \
            .ilike('name', f'%{query}%') \
            .limit(50) \
            .execute()
        
        results = supabase_results.data
        
        # 如果结果不足，再搜索 Railway
        if len(results) < 10:
            self.railway_cursor.execute(
                "SELECT * FROM companies WHERE name ILIKE %s LIMIT %s",
                (f'%{query}%', 50 - len(results))
            )
            railway_results = self.railway_cursor.fetchall()
            # 转换为字典格式
            columns = [desc[0] for desc in self.railway_cursor.description]
            results.extend([dict(zip(columns, row)) for row in railway_results])
        
        return results
    
    def migrate_hot_company(self, company_id: str):
        """将高频搜索企业从 Railway 迁移到 Supabase"""
        # 从 Railway 读取
        self.railway_cursor.execute(
            "SELECT * FROM companies WHERE id = %s",
            (company_id,)
        )
        company = self.railway_cursor.fetchone()
        
        if company:
            columns = [desc[0] for desc in self.railway_cursor.description]
            company_data = dict(zip(columns, company))
            
            # 插入到 Supabase
            self.supabase.table('companies').insert(company_data).execute()
            
            # 从 Railway 删除
            self.railway_cursor.execute(
                "DELETE FROM companies WHERE id = %s",
                (company_id,)
            )
            self.railway_conn.commit()
    
    def close(self):
        """关闭连接"""
        self.railway_cursor.close()
        self.railway_conn.close()
```

## 步骤 6：更新 Next.js API

修改 `app/lib/supabase.ts` 支持多数据库：

```typescript
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

// Supabase 客户端
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Railway PostgreSQL 连接池
export const railwayPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// 跨数据库搜索
export async function searchCompanies(query: string, limit = 50) {
  const results = []
  
  // 先搜索 Supabase（热门企业）
  const { data: supabaseData } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(limit)
  
  results.push(...(supabaseData || []))
  
  // 如果结果不足，搜索 Railway
  if (results.length < 10) {
    const client = await railwayPool.connect()
    try {
      const res = await client.query(
        'SELECT * FROM companies WHERE name ILIKE $1 LIMIT $2',
        [`%${query}%`, limit - results.length]
      )
      results.push(...res.rows)
    } finally {
      client.release()
    }
  }
  
  return results
}

// 获取企业详情（跨数据库）
export async function getCompanyById(id: string) {
  // 先尝试 Supabase
  const { data: supabaseData } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()
  
  if (supabaseData) {
    return supabaseData
  }
  
  // 再尝试 Railway
  const client = await railwayPool.connect()
  try {
    const res = await client.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    )
    return res.rows[0] || null
  } finally {
    client.release()
  }
}
```

## 步骤 7：安装依赖

```bash
# Python 依赖
cd python-scraper
pip install psycopg2-binary

# Node.js 依赖
cd ..
npm install pg
```

## 步骤 8：测试连接

创建测试脚本 `python-scraper/test_multi_db.py`：

```python
import os
from supabase import create_client
import psycopg2

# 测试 Supabase
print("Testing Supabase connection...")
supabase = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)
result = supabase.table('companies').select('count').execute()
print(f"✅ Supabase connected! Companies: {result.data}")

# 测试 Railway
print("\nTesting Railway connection...")
railway_conn = psycopg2.connect(os.getenv('RAILWAY_DATABASE_URL'))
cursor = railway_conn.cursor()
cursor.execute("SELECT COUNT(*) FROM companies")
count = cursor.fetchone()[0]
print(f"✅ Railway connected! Companies: {count}")
cursor.close()
railway_conn.close()

print("\n🎉 Both databases connected successfully!")
```

运行测试：

```bash
cd python-scraper
python test_multi_db.py
```

## 步骤 9：开始数据收集

```bash
# 运行数据收集器（自动分配到不同数据库）
python comprehensive_scraper.py

# 启动定时任务
python data_scheduler.py
```

## 监控和维护

### 查看数据库使用情况

**Supabase**：
- 访问 https://app.supabase.com
- 进入项目 → Settings → Database
- 查看 "Database size"

**Railway**：
- 访问 https://railway.app
- 进入项目 → PostgreSQL → Metrics
- 查看 "Disk Usage"

### 优化查询性能

```sql
-- 在两个数据库都创建索引
CREATE INDEX idx_companies_name ON companies USING gin(name gin_trgm_ops);
CREATE INDEX idx_companies_state ON companies(state);
CREATE INDEX idx_companies_industry ON companies(industry_code);

-- 启用 pg_trgm 扩展（用于模糊搜索）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## 成本和限制

| 项目 | Supabase 免费版 | Railway 免费版 |
|------|----------------|---------------|
| 存储 | 500MB | 8GB |
| 带宽 | 5GB/月 | 100GB/月 |
| 连接数 | 500 | 100 |
| 月度费用 | $0 | $0 |

**总计**：
- 存储：8.5GB
- 企业数：~800,000 家（完整数据）
- 成本：$0/月

## 故障排查

### 问题 1：Railway 连接超时

```bash
# 检查防火墙设置
# Railway 需要允许出站连接

# 测试连接
psql $RAILWAY_DATABASE_URL -c "SELECT 1"
```

### 问题 2：Supabase RLS 权限问题

```sql
-- 禁用 RLS（开发环境）
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- 或创建服务角色策略
CREATE POLICY "Service role can do everything" 
ON companies FOR ALL 
USING (auth.role() = 'service_role');
```

### 问题 3：跨数据库搜索慢

```typescript
// 使用并行查询
const [supabaseResults, railwayResults] = await Promise.all([
  searchSupabase(query),
  searchRailway(query)
])
```

## 下一步

1. ✅ 完成数据库设置
2. ⏳ 收集前 10,000 家企业测试
3. ⏳ 验证查询性能
4. ⏳ 实施自动迁移（热门企业）
5. ⏳ 启动定时更新任务

🎉 现在您有 8.5GB 免费存储，可以容纳 80 万家企业！
