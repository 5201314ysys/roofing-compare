# 免费 API Keys 获取指南

本指南介绍如何获取数据抓取系统的免费 API 密钥。

## 📌 概述

大多数数据源都提供免费套餐，足以满足开发和适度使用需求：

| 数据源 | 免费额度 | 限制 | 超出后费用 |
|--------|----------|------|------------|
| Google Places | 每月 $200 额度 | 约 40,000 次请求 | 每 1,000 次 $17 |
| Yelp Fusion | 100% 免费 | 每天 500 次调用 | 不适用 |
| OpenCorporates | 免费（公开） | 每天 500 次调用 | 每月 $15 |
| SEC EDGAR | 100% 免费 | 每秒 10 次请求 | 永久免费 |
| State SOS | 100% 免费 | 因州而异 | 永久免费 |

## 🔑 获取 API 密钥

### 1. Google Places API（推荐 - 数据最佳）

**免费额度**: 每月 $200 额度 = 约 40,000 次 Place Details 请求

#### 步骤：
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 API：
   - 点击 "APIs & Services" → "Enable APIs and Services"
   - 搜索 "Places API" 并启用
   - 搜索 "Maps JavaScript API" 并启用（可选）
4. 创建凭据：
   - 点击 "Credentials" → "Create Credentials" → "API Key"
   - 复制您的 API 密钥
5. 限制密钥（重要，保护安全）：
   - 点击 API 密钥名称
   - 在 "API restrictions" 下，选择 "Restrict key"
   - 勾选 "Places API"
   - 在 "Application restrictions" 下添加您的 IP 地址
6. 计费：
   - 转到 "Billing" 添加付款方式
   - 不用担心 - 您每月有 $200 免费额度
   - 设置预算提醒以避免意外收费

**添加到 `.env` 文件：**
```env
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**测试：**
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Apple+Inc&key=YOUR_API_KEY"
```

---

### 2. Yelp Fusion API（100% 免费）

**免费额度**: 每天 500 次请求，永久免费

#### 步骤：
1. 访问 [Yelp Fusion](https://www.yelp.com/developers)
2. 点击 "Get Started" 或 "Create App"
3. 使用 Yelp 账户登录（如需要请创建）
4. 填写应用表单：
   - App Name: "BizCompare Data Scraper"
   - Industry: "Business Information"
   - Description: "Collecting business ratings and reviews"
5. 同意条款并创建应用
6. 复制您的 API Key（以 Bearer token 开头）

**添加到 `.env` 文件：**
```env
YELP_API_KEY=YOUR_YELP_API_KEY_HERE
```

**测试：**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.yelp.com/v3/businesses/search?term=coffee&location=san+francisco"
```

---

### 3. OpenCorporates API（免费公开访问）

**免费额度**: 无 API 密钥每月 500 次请求，无限公开搜索

#### 选项 A：无 API 密钥（有限）
您可以不使用 API 密钥进行基本搜索：
- 每月 500 次请求
- 每次搜索 200 条结果
- 速率限制：每秒 1 次请求

在 `.env` 中将 `OPENCORPORATES_API_KEY` 留空即可

#### 选项 B：免费 API 密钥（更好的限制）
1. 访问 [OpenCorporates API](https://opencorporates.com/api_accounts/new)
2. 注册免费账户
3. 选择 "Community" 计划（免费）
4. 验证您的邮箱
5. 转到账户设置获取 API token

**免费计划包括：**
- 每天 500 次 API 调用
- 更高的速率限制
- 更好的数据访问

**添加到 `.env` 文件：**
```env
OPENCORPORATES_API_KEY=YOUR_OPENCORPORATES_TOKEN
```

**测试：**
```bash
curl "https://api.opencorporates.com/v0.4/companies/search?q=Apple+Inc&jurisdiction_code=us_ca"
```

---

### 4. SEC EDGAR（永久免费 - 无需密钥）

**免费额度**: 完全免费，无需 API 密钥

#### 要求：
- 必须在 User-Agent 标头中包含您的邮箱
- 速率限制：每秒 10 次请求
- 无需注册

抓取器已自动处理：
```python
headers = {"User-Agent": "BizCompare research@bizcompare.com"}
```

**在抓取器中将邮箱改为您自己的：**
在 `comprehensive_scraper.py` 第 173 行：
```python
headers = {"User-Agent": "BizCompare your-email@example.com"}
```

**测试：**
```bash
curl -H "User-Agent: YourCompany your-email@example.com" \
  "https://data.sec.gov/submissions/CIK0000320193.json"
```

---

### 5. 州务卿网站（永久免费）

大多数州网站免费访问，无需 API 密钥。但是：

- 某些州需要解决验证码
- 速率限制因州而异
- 最好在非高峰时段使用

**无需设置** - 抓取器会处理。

---

### 6. Better Business Bureau（免费 - 无需密钥）

BBB 数据可通过其搜索界面公开访问。无需 API 密钥。

**无需设置** - 抓取器会处理。

---

## 🚀 快速设置

### 完整的 `.env` 文件模板

在项目根目录创建 `.env` 文件：

```env
# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Places API（推荐 - 每月 $200 免费）
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Yelp API（100% 免费）
YELP_API_KEY=YOUR_YELP_API_KEY_HERE

# OpenCorporates（可选 - 每天 500 次免费）
OPENCORPORATES_API_KEY=YOUR_OPENCORPORATES_TOKEN

# Stripe（用于支付）
STRIPE_SECRET_KEY=sk_test_XXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX
```

---

## 💡 不使用 API 密钥开始

您仍然可以从以下来源获取数据：

### 免费来源（无需密钥）：
✅ SEC EDGAR - 上市公司数据
✅ State SOS 网站 - 注册数据
✅ BBB - 评级和认证
✅ OSHA - 安全记录

### 需要密钥的来源：
⚠️ Google Places - 评价/评级最佳
⚠️ Yelp - 评价不错
⚠️ OpenCorporates - 注册数据

### 推荐最低配置：
1. **必须有**: Supabase（数据库）
2. **强烈推荐**: Google Places（$200 免费）+ Yelp（100% 免费）
3. **可选**: OpenCorporates

---

## 📊 API 使用量估算

### 小规模（10,000 家公司）
对于拥有 10,000 家公司且每 30 分钟更新一次的数据库：

| 来源 | 每日请求 | 月度费用 |
|--------|--------------|--------------|
| Google Places | 约 700 | $0（免费额度内）|
| Yelp | 约 700 | $0（永久免费）|
| OpenCorporates | 约 700 | $0（免费额度）|
| SEC EDGAR | 约 200 | $0（永久免费）|
| **总计** | **约 2,300** | **$0** |

### 🚀 大规模（100 万+ 家公司 - 全美覆盖）

**现实检查**: 美国有**约 3300 万家企业**（600 万公司 + 2700 万个体户）

对于全面覆盖，您需要不同的策略：

#### 初始数据收集（一次性）
| 来源 | 公司数量 | 请求数 | 时间 | 费用 |
|--------|-----------|----------|------|------|
| State SOS | 600 万公司 | 600 万 | 60 天 | $0 |
| OpenCorporates | 600 万 | 600 万 | 120 天 | $5,000 |
| Google Places | 500 万中小企业 | 500 万 | 30 天 | $85,000 |
| SEC EDGAR | 5,000 | 5K | 1 天 | $0 |
| BBB | 100 万 | 100 万 | 20 天 | $0 |
| **总计** | **约 1800 万** | **约 1800 万** | **4-6 个月** | **约 $90,000** |

#### 持续更新（30 分钟刷新）
| 来源 | 每日更新 | 每月 | 月度费用 |
|--------|-------------|---------|------------|
| Google Places（评价）| 50 万 | 1500 万 | $255,000 |
| State 变更 | 1 万 | 30 万 | $0 |
| SEC 文件 | 1K | 3 万 | $0 |
| **总计** | **51.1 万** | **1530 万** | **约 $255,000** |

**💡 这对创业公司来说不现实！**

---

## 🎯 全美覆盖的实用策略

### 阶段 1：从高价值细分开始（免费/$100/月）

**目标**: 100,000 - 500,000 家公司

专注于用户最需要价值的特定领域：

1. **持证承包商**（50 万家公司）
   - 建筑、屋顶、管道、电气、暖通空调
   - 州执照委员会（免费数据）
   - 搜索量高
   
2. **上市公司**（5,000 家公司）
   - SEC EDGAR（免费，完整数据）
   - 数据质量高
   - 用户兴趣高

3. **大型私营公司**（50,000 家公司）
   - 收入 > $1000 万
   - D&B、OpenCorporates 可获得
   - 数据质量更好

4. **热门本地企业**（100,000 家公司）
   - Google/Yelp 评价数量高
   - 餐馆、零售、服务
   - 用户流量高

**预估成本**: $0 - $100/月
**覆盖率**: 约 50 万家公司（按价值计前 1.5%）
**用户价值**: 涵盖 80% 的搜索查询

### 阶段 2：批量数据购买（明智的方法）

不要使用 API 调用，而是**购买批量数据集**：

#### 选项 A：商业数据供应商
| 供应商 | 覆盖范围 | 费用 | 更新频率 |
|--------|----------|------|------------------|
| **Dun & Bradstreet** | 3000 万美国企业 | 每年 $1 万-5 万 | 月度更新 |
| **InfoGroup (Data Axle)** | 3300 万企业 | 每年 $5K-2 万 | 季度 |
| **ZoomInfo** | 1 亿+ 联系人 | 每年 $1.5 万-3 万 | 实时 |
| **Factual/Foursquare** | 6000 万 POI | 每年 $5K-1.5 万 | 每周 |
| **SafeGraph** | 700 万 POI | 每年 $3K-1 万 | 月度 |

**最适合创业公司**: Data Axle 或 SafeGraph（最实惠）

#### 选项 B：政府批量下载（免费！）
| 来源 | 覆盖范围 | 格式 | 费用 |
|--------|----------|--------|------|
| **IRS 免税组织** | 180 万非营利组织 | CSV | 免费 |
| **SAM.gov** | 50 万承包商 | API/CSV | 免费 |
| **SEC EDGAR** | 1 万+ 上市公司 | JSON/XML | 免费 |
| **State SOS 批量** | 因州而异 | CSV/DB | $0-$500 |
| **USPS 地址数据库** | 所有美国地址 | CSV | 一次性 $1,800 |

**许多州提供批量下载** 费用 $0-$500：
- 加利福尼亚州：$55（650 万+ 企业）
- 特拉华州：$200（150 万+ 企业）
- 内华达州：免费（50 万+ 企业）
- 怀俄明州：免费（20 万+ 企业）

### 阶段 3：智能更新（最小化 API 成本）

不要每 30 分钟更新所有公司：

#### 分层更新策略
| 公司等级 | 更新频率 | 数据库百分比 | 原因 |
|--------------|------------------|---------------|--------|
| **热门**（过去 7 天浏览）| 30 分钟 | 1% | 用户活跃兴趣 |
| **温热**（过去 30 天浏览）| 6 小时 | 5% | 近期兴趣 |
| **流行**（搜索量高）| 每日 | 10% | 保持新鲜度 |
| **标准**（所有其他）| 每周 | 84% | 基线更新 |

**结果**: 减少 **95%** 的 API 调用，同时保持数据质量！

对于 100 万家公司：
- 热门：1 万 × 每天 48 次更新 = 48 万次调用
- 温热：5 万 × 每天 4 次更新 = 20 万次调用  
- 流行：10 万 × 每天 1 次更新 = 10 万次调用
- 标准：84 万 × 每天 0.14 次更新 = 12 万次调用

**总计**: 每天 90 万次调用 vs 每天 4800 万次调用（节省 50 倍！）
**月度费用**: 约 $15,000 vs 约 $800,000

---

## 💰 实际成本预测

### 选项 1：专注细分市场（推荐用于 MVP）
- **目标**: 10 万-50 万家高价值公司
- **初始**: $0-1K（批量下载 + 免费 API）
- **每月**: $100-500（API 更新）
- **数据质量**: 高（专注努力）
- **上线时间**: 1-2 个月

### 选项 2：批量数据 + 智能更新
- **目标**: 500 万-1000 万家公司
- **初始**: $5K-15K（Data Axle 或 SafeGraph）
- **每月**: $2K-5K（分层 API 更新）
- **数据质量**: 中高
- **上线时间**: 2-3 个月

### 选项 3：全面覆盖（初期不推荐）
- **目标**: 3000 万+ 家公司
- **初始**: $5 万-10 万（多个供应商）
- **每月**: $2 万-5 万（API 成本）
- **数据质量**: 中等（难以维护）
- **上线时间**: 6-12 个月

---

## 🎓 您的平台推荐路径

### 步骤 1：MVP 启动（第 1-2 个月）- 免费
从**免费政府数据**开始：

1. **SEC EDGAR**: 5,000 家上市公司（免费，优质数据）
2. **州执照委员会**: 50 万承包商（免费抓取）
3. **SAM.gov**: 50 万联邦承包商（免费 API）
4. **BBB 顶级公司**: 10 万企业（免费抓取）

**总计**: 约 100 万家公司，**成本 $0**
**覆盖**: 承包商、上市公司、联邦承包商

### 步骤 2：添加评价（第 2-3 个月）- $200-500/月
- 为前 5 万家公司使用 Google Places API
- 使用 Yelp API 补充
- 专注于搜索量高的公司

### 步骤 3：使用批量数据扩展（第 3-6 个月）- $5K-10K
- 购买 Data Axle 或 SafeGraph 数据集
- 获得 500 万-1000 万家额外公司
- 实施分层更新策略

### 步骤 4：智能扩展（第 6 个月+）- $2K-5K/月
- 分层更新策略
- 专注于高价值细分市场
- 让用户搜索驱动数据更新（拉模式 vs 推模式）

---

## 🔧 替代方案：用户驱动的数据收集

**智能方法**: 不要预先抓取所有内容！

### 按需数据获取
1. 用户搜索 "ABC Roofing, CA"
2. 检查数据库 - 未找到
3. **从 API 实时获取**（2-3 秒）
4. 缓存结果 30 天
5. 如果再次查看则刷新

**优势**:
- 只为用户真正想要的公司付费
- 数据始终新鲜
- 从 $0 数据库开始
- 随用户自然扩展

**成本**:
- 每天 1,000 次搜索 = 每月 $17
- 每天 10,000 次搜索 = 每月 $170
- 每天 100,000 次搜索 = 每月 $1,700

远好于预先抓取 3000 万家公司！

---

## 🆘 故障排除

### Google Places "API Key Invalid"
- 确保在 Google Cloud Console 中启用了 "Places API"
- 检查是否启用了计费（即使免费套餐也需要）
- 验证 IP 限制未阻止您的请求

### Yelp "Authentication Failed"
- 确保使用完整的 API 密钥（以长字母数字开头）
- 在 Authorization 标头中包含 "Bearer " 前缀
- 检查您的应用是否已获批准

### OpenCorporates "Rate Limit Exceeded"
- 免费套餐：每天 500 次，每秒 1 次请求
- 在请求之间添加延迟
- 考虑获取免费 API 密钥以获得更好的限制

### SEC EDGAR 阻止请求
- 必须在 User-Agent 中包含有效电子邮件
- 不要超过每秒 10 次请求
- 避免在交易时段（美东时间上午 9:30 - 下午 4:00）发出请求

---

## 📦 批量数据源（用于扩展）

### 免费政府批量下载

#### 1. 加利福尼亚州商业实体（$55）
- **650 万+ 企业**
- https://bizfileonline.sos.ca.gov/
- CSV 格式，每月更新
- 包括：名称、状态、地址、代理人、备案日期

#### 2. 特拉华州公司（$200）
- **150 万+ 企业** 
- https://icis.corp.delaware.gov/
- 大多数美国公司在这里注册
- 完整的高管信息

#### 3. SAM.gov 实体（免费）
- **50 万+ 联邦承包商**
- https://sam.gov/data-services/Entity%20Management/Public%20V3
- 免费 API 或批量下载
- 优质数据

#### 4. IRS 企业主文件（免费）
- **180 万+ 免税组织**
- https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
- 月度更新
- 非营利组织、501(c)(3)

#### 5. SEC 公司代码（免费）
- **13,000+ 上市公司**
- https://www.sec.gov/files/company_tickers.json
- 实时更新
- 包括 CIK、代码、名称

### 州批量下载（大多数提供 $0-$500）

查看各州州务卿网站：
- **内华达州**: 免费批量下载
- **怀俄明州**: 免费批量下载  
- **德克萨斯州**: $200-$500
- **纽约州**: $500
- **佛罗里达州**: $500

### 商业批量数据供应商

#### 预算友好选项
1. **Data Axle (InfoGroup)** - 每年 $5K-10K
   - 3300 万美国企业
   - 电话、电子邮件、员工数
   - 适合中小企业

2. **SafeGraph** - 每年 $3K-10K
   - 700 万 POI 及客流量
   - 位置数据专家
   - 适合零售/餐饮

3. **Factual/Foursquare** - 每年 $5K-15K
   - 6000 万全球 POI
   - 丰富的地点属性
   - 适合本地企业

#### 企业级选项
1. **Dun & Bradstreet** - 每年 $1 万-5 万
   - 3000 万+ 企业
   - D-U-N-S 编号
   - 信用评分
   - 最全面

2. **ZoomInfo** - 每年 $1.5 万-3 万
   - 1 亿+ 联系人
   - 1400 万+ 公司
   - 最适合 B2B 销售
   - 实时更新

3. **Experian Business** - 每年 $1.5 万-4 万
   - 商业信用数据
   - 风险评分
   - 适合金融服务

---

## 📚 其他资源

- [Google Places API 文档](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Yelp Fusion API 文档](https://www.yelp.com/developers/documentation/v3)
- [OpenCorporates API 文档](https://api.opencorporates.com/)
- [SEC EDGAR API 指南](https://www.sec.gov/edgar/sec-api-documentation)

---

## 🎉 总结

### 快速开始（免费 - 0-2 周）
**目标**: 5K-10K 家公司以测试平台

1. **必需**（5 分钟）：
   - 设置 Supabase 账户（免费套餐）
   
2. **推荐**（15 分钟）：
   - 获取 Google Places API 密钥（每月 $200 免费）
   - 获取 Yelp API 密钥（100% 永久免费）

3. **可选**（5 分钟）：
   - 获取 OpenCorporates API 密钥（每天 500 次免费）

**总设置时间**: 25 分钟  
**总成本**: 每月 $0  
**覆盖**: 手动数据录入或小规模抓取

---

### MVP 启动（免费/$100 - 第 1-2 个月）
**目标**: 10 万-50 万家高价值公司

1. **免费政府数据**：
   - SEC EDGAR（5K 上市公司）
   - 州执照委员会（50 万承包商）
   - SAM.gov（50 万联邦承包商）
   
2. **批量下载**（$0-500）：
   - 加州企业（$55）
   - 内华达/怀俄明（免费）
   
3. **评价 API**（每月 $100）：
   - 为顶级公司使用 Google Places
   - 使用 Yelp 补充

**总成本**: 初始 $100-600 + 每月 $100  
**覆盖**: 100 万家公司（高价值细分市场）  
**上线时间**: 4-8 周

---

### 增长阶段（$5K-10K - 第 3-6 个月）
**目标**: 500 万-1000 万家公司

1. **批量数据购买**（$5K-10K）：
   - Data Axle 或 SafeGraph 数据集
   
2. **智能 API 更新**（每月 $500-2K）：
   - 分层更新策略
   - 专注于浏览过的公司

**总成本**: 初始 $5K-10K + 每月 $500-2K  
**覆盖**: 500 万-1000 万家公司  
**数据质量**: 中高

---

### 扩展阶段（$2 万+ - 第 6 个月+）
**目标**: 3000 万+ 家公司（全美）

1. **多个数据供应商**（$2 万-5 万）：
   - D&B + Data Axle + SafeGraph
   
2. **大规模 API**（每月 $5K-2 万）：
   - 复杂的缓存
   - 用户驱动更新

**总成本**: 初始 $5 万+ + 每月 $1 万-3 万  
**覆盖**: 全美覆盖  
**推荐**: 仅在验证产品市场契合度后

---

### 🏆 推荐路径

**阶段 1（免费）**: 从政府数据开始
- SEC、State SOS、SAM.gov
- 100 万家公司，$0 成本
- 验证商业模式

**阶段 2（每月 $100）**: 增加用户价值
- 为顶级公司添加 Google/Yelp 评价  
- 按需数据获取
- 随用户增长扩展

**阶段 3（$5K-10K）**: 盈利后购买批量数据
- 仅在证明收入后
- Data Axle 或类似
- 战略性扩大覆盖范围

**不要在第一天就尝试抓取 3000 万家公司！** 

从小做起，通过用户验证，然后扩展。大多数查询无论如何都会集中在前 1% 的公司上。🚀
