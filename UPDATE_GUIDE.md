# 数据库和网站展示更新说明

## 🎉 更新内容

### 1. 数据库Schema更新
已更新 `supabase-schema.sql`，新增以下字段：

#### 📞 联系信息
- `phone` - 电话号码
- `email` - 邮箱地址  
- `website` - 官方网站
- `address` - 详细地址
- `zip_code` - 邮编

#### ⭐ 评价系统
- `rating` - 星级评分（0-5分）
- `review_count` - 评论数量
- `bbb_rating` - BBB评级（A+, A, B+等）

#### 🏢 公司详情
- `description` - 公司介绍
- `license_number` - 营业执照号
- `founded_year` - 成立年份
- `employee_count` - 员工数量
- `insurance_verified` - 保险认证状态
- `bonded` - 担保认证状态
- `logo_url` - Logo图片URL

#### 🛠️ 服务信息
- `specialties` - 专业领域数组（如：Residential Roofing, Metal Roofing等）
- `service_areas` - 服务区域数组
- `emergency_service` - 是否提供24/7紧急服务
- `warranty_years` - 质保年限

#### 🎯 运营状态
- `is_featured` - 是否为推荐承包商
- `is_active` - 是否营业中
- `business_hours` - 营业时间（JSON格式）

#### 🔗 社交媒体
- `facebook_url`
- `instagram_url`
- `linkedin_url`

### 2. 网站页面更新
已更新 `app/page-supabase.tsx`，新增展示：

✅ **星级评分和评论数**
✅ **BBB评级徽章**
✅ **认证徽章**（保险认证、担保认证、24/7紧急服务、质保年限）
✅ **专业领域标签**
✅ **联系按钮**（电话、网站、邮件）
✅ **公司Logo**（如果有）
✅ **推荐标识**（⭐ 推荐）
✅ **更美观的卡片设计**

---

## 🚀 如何应用更新

### 步骤 1: 更新Supabase数据库结构

1. 登录你的 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 `SQL Editor`
4. **重要：先备份现有数据！** 运行：
   ```sql
   -- 备份现有承包商数据
   CREATE TABLE contractors_backup AS SELECT * FROM contractors;
   ```

5. 由于我们要添加新字段到现有表，使用以下SQL（而不是完整的schema）：

```sql
-- 添加新字段到contractors表
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS bonded BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS service_areas TEXT[];
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS emergency_service BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS warranty_years INTEGER;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS bbb_rating VARCHAR(10);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS business_hours JSONB;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 添加约束
ALTER TABLE contractors ADD CONSTRAINT check_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- 创建新索引
CREATE INDEX IF NOT EXISTS idx_contractors_state ON contractors(state);
CREATE INDEX IF NOT EXISTS idx_contractors_zip_code ON contractors(zip_code);
CREATE INDEX IF NOT EXISTS idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_contractors_is_featured ON contractors(is_featured);
CREATE INDEX IF NOT EXISTS idx_contractors_is_active ON contractors(is_active);

-- 更新视图
CREATE OR REPLACE VIEW top_contractors AS
SELECT 
  id, name, initial, city, state,
  phone, email, website, total_projects,
  avg_quote, contractor_price, rating, review_count,
  verified_at, logo_url, is_featured,
  service_areas, specialties,
  ROUND((total_value / NULLIF(total_projects, 0))::NUMERIC, 2) as calculated_avg
FROM contractors
WHERE total_projects >= 3 AND is_active = true
ORDER BY 
  is_featured DESC,
  rating DESC NULLS LAST,
  total_projects DESC
LIMIT 100;

-- 创建推荐承包商视图
CREATE OR REPLACE VIEW featured_contractors AS
SELECT 
  id, name, initial, city, state,
  phone, email, website, logo_url, description,
  total_projects, avg_quote, contractor_price,
  rating, review_count, specialties, service_areas,
  emergency_service, warranty_years, verified_at
FROM contractors
WHERE is_featured = true AND is_active = true
ORDER BY rating DESC NULLS LAST, total_projects DESC;
```

### 步骤 2: 填充示例数据（可选但推荐）

运行我们创建的脚本来为现有承包商添加示例数据：

```bash
cd /Users/chenjunhao/Downloads/10/roofing-compare
node scripts/update-contractors-data.js
```

这个脚本会：
- ✅ 为每个承包商生成联系方式
- ✅ 添加随机但真实的评分和评论数
- ✅ 设置专业领域和服务区域
- ✅ 添加认证状态和其他详细信息

### 步骤 3: 更新网站显示

网站代码已经更新完成！重新运行开发服务器：

```bash
cd /Users/chenjunhao/Downloads/10/roofing-compare
npm run dev
```

访问 http://localhost:3000 查看更新后的页面！

---

## 📱 新的展示效果

### 列表页现在显示：

1. **公司Logo或首字母圆圈**
2. **星级评分** ⭐⭐⭐⭐⭐ (4.8)
3. **评论数量** (127 条评论)
4. **BBB评级徽章** 
5. **认证徽章**：
   - 🔥 24/7紧急服务
   - 🛡️ 保险认证
   - 🏆 担保认证
   - ⏰ 10年质保
6. **专业领域标签**（如：Residential Roofing, Metal Roofing）
7. **快速联系按钮**（电话、网站、邮件）
8. **推荐标识**（⭐ 推荐）

### 搜索和排序优化：

- 推荐承包商自动置顶
- 按评分排序（评分高的优先）
- 只显示活跃营业的承包商
- 更智能的筛选逻辑

---

## 🎨 下一步建议

### 短期（立即可做）：
1. ✅ 运行数据库更新脚本
2. ✅ 测试新的页面展示
3. 📸 添加真实的Logo图片URL
4. 📝 编写真实的公司介绍

### 中期（1-2周）：
1. 🔍 创建承包商详情页（点击卡片查看完整信息）
2. 🗺️ 集成Google Maps显示公司位置
3. 📊 添加评论和评分系统
4. 🔔 添加收藏夹功能

### 长期（1个月+）：
1. 💬 实时聊天功能
2. 📅 在线预约系统
3. 📈 价格走势图表
4. 🤖 AI推荐匹配算法

---

## ⚠️ 重要提示

### 数据隐私：
- ⚠️ `contractor_price` 仍然是付费墙保护的核心资产
- ✅ 联系方式现在公开展示（这是合理的，便于客户联系）
- ✅ 评分和认证信息增加信任度

### 性能优化：
- 已添加多个数据库索引，查询速度更快
- 只加载必要的字段，减少数据传输
- 使用视图(views)预计算常用查询

### SEO优化建议：
- 添加更多文字内容（公司介绍）有助于搜索引擎收录
- 联系方式和地址有助于本地SEO
- 评分和评论增加页面权威性

---

## 🆘 遇到问题？

### 常见问题：

**Q: 数据库更新后，网站显示不完整？**
A: 运行 `node scripts/update-contractors-data.js` 填充示例数据

**Q: 评分显示为空？**
A: 这是正常的，因为新字段默认为NULL。运行更新脚本即可。

**Q: 需要恢复旧数据？**
A: 如果你创建了备份，运行：
```sql
DROP TABLE contractors;
ALTER TABLE contractors_backup RENAME TO contractors;
```

**Q: 如何手动添加某个承包商的真实数据？**
A: 在Supabase Dashboard的Table Editor中直接编辑，或者使用SQL：
```sql
UPDATE contractors 
SET 
  phone = '(305) 555-1234',
  email = 'info@example.com',
  website = 'https://example.com',
  rating = 4.8,
  review_count = 89,
  specialties = ARRAY['Residential Roofing', 'Metal Roofing'],
  insurance_verified = true
WHERE name = '公司名称';
```

---

## 📚 相关文档

- [DATABASE_FIELDS_GUIDE.md](./DATABASE_FIELDS_GUIDE.md) - 详细的字段说明文档
- [supabase-schema.sql](./supabase-schema.sql) - 完整的数据库Schema
- [scripts/update-contractors-data.js](./scripts/update-contractors-data.js) - 数据更新脚本

---

**祝使用愉快！** 🎉

如有任何问题，请随时询问。
