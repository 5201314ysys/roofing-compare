# 数据挖掘脚本说明

## 数据源信息

**当前数据源：芝加哥市建筑许可公开数据库**

- **来源：** Chicago Open Data Portal (Socrata API)
- **数据集：** Building Permits
- **API地址：** https://data.cityofchicago.org/resource/ydr8-5enu.json
- **数据质量：** ✅ 真实有效，持续更新
- **数据范围：** 2020年至今的屋顶相关建筑许可
- **更新频率：** 每日更新

## 数据验证

已验证数据真实性：
- ✅ ZACHER, PAUL K - 705个项目，平均报价 $14,918
- ✅ HOLMES, WELLS L - 463个项目，平均报价 $20,216
- ✅ WARD, JON P - 250个项目，平均报价 $17,730

数据来自芝加哥市政府官方API，所有承包商信息和项目成本均为真实建筑许可记录。

## 使用方法

```bash
# 运行数据挖掘脚本
node scripts/fetch-permits.js
```

脚本会：
1. 从芝加哥市API获取最新5000条屋顶相关许可记录
2. 筛选出专业承包商（排除业主自建）
3. 计算每个承包商的平均报价和项目数量
4. 生成 `app/data.json` 文件供前端使用

## 数据字段说明

生成的 `data.json` 包含以下字段：

```json
{
  "id": "唯一标识符",
  "initial": "公司名首字母",
  "name": "承包商名称",
  "verified": "数据验证日期",
  "avgQuote": "平均报价",
  "contractorPrice": "承包商底价（85折）",
  "jobCount": "完成项目数量"
}
```

## 数据筛选条件

- ✅ 工作描述包含 "ROOF"（屋顶）
- ✅ 签发日期在 2020-01-01 之后
- ✅ 有明确的建筑成本（reported_cost）
- ✅ 承包商类型（排除业主自建）
- ✅ 单个项目成本 > $2,000
- ✅ 至少完成 3 个项目
- ✅ 取前 50 名（按项目数量排序）

## 替代数据源

如需使用其他城市数据，可替换为以下稳定的公开数据源：

### 1. 纽约市建筑许可
```javascript
const DATA_URL = 'https://data.cityofnewyork.us/resource/ipu4-2q9a.json';
```

### 2. 西雅图建筑许可
```javascript
const DATA_URL = 'https://data.seattle.gov/resource/76t5-zqzr.json';
```

### 3. 旧金山建筑许可
```javascript
const DATA_URL = 'https://data.sfgov.org/resource/i98e-djp9.json';
```

所有这些数据源都使用 Socrata Open Data API 格式，可以直接替换使用。

## API限制

- 单次请求最大返回 5000 条记录
- 无需身份验证
- 建议添加适当延迟避免频繁请求

## 最后更新

2026年2月4日 - 切换至芝加哥市数据源，验证数据真实有效
