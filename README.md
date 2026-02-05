# 🏠 Roofing Compare - 全美屋顶承包商数据平台

基于真实政府建筑许可数据的屋顶承包商价格对比平台。

## ✨ 特性

- 🌎 **全美覆盖** - 支持多个美国主要城市（芝加哥、奥斯汀、西雅图等）
- 📊 **真实数据** - 基于政府公开建筑许可记录
- ☁️ **云数据库** - 使用Supabase实时数据存储
- 🔍 **智能搜索** - 支持承包商名称搜索和城市筛选
- 💰 **价格透明** - 显示市场均价和承包商底价
- 📱 **响应式设计** - 完美支持移动端和桌面端

## 🚀 快速开始

### 方式 1: 使用本地数据（快速演示）
```bash
# 克隆项目
git clone <repository-url>
cd roofing-compare

# 安装依赖
npm install

# 获取芝加哥数据
node scripts/fetch-permits.js

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 方式 2: 使用Supabase云数据库（推荐生产环境）
```bash
# 1. 运行自动化设置脚本
./setup-supabase.sh

# 2. 或者手动设置（详见 SUPABASE_SETUP.md）
```

## 📊 数据源

当前支持的城市：

| 城市 | 数据量 | 状态 |
|------|--------|------|
| Chicago, IL | ~3,000条/次 | ✅ |
| Austin, TX | ~2,000条/次 | ✅ |
| Seattle, WA | ~2,000条/次 | ✅ |

**可扩展至**: 纽约、洛杉矶、旧金山、波士顿等20+城市

所有数据来自美国城市政府的Socrata Open Data API，100%真实可靠。

## 🏗️ 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **数据库**: Supabase (PostgreSQL)
- **图标**: Lucide React
- **数据源**: Socrata Open Data APIs

## 📁 项目结构

```
roofing-compare/
├── app/
│   ├── page.tsx              # 主页面（本地JSON版本）
│   ├── page-supabase.tsx     # Supabase版本前端
│   ├── data.json             # 本地缓存数据
│   └── api/
│       └── notify/           # 邮件通知API
├── scripts/
│   ├── fetch-permits.js      # 单城市数据挖掘（芝加哥）
│   └── fetch-permits-supabase.js  # 多城市 + Supabase版本
├── supabase-schema.sql       # 数据库表结构
├── .env.local.example        # 环境变量模板
├── setup-supabase.sh         # 自动化设置脚本
├── SUPABASE_SETUP.md         # Supabase详细设置指南
└── UPGRADE_SUMMARY.md        # 升级总结文档
```

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 邮件通知（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

详细配置步骤请查看 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 📖 文档

- 📘 [Supabase设置指南](SUPABASE_SETUP.md) - 完整的数据库设置教程
- 📗 [升级总结](UPGRADE_SUMMARY.md) - 架构升级说明
- 📙 [脚本说明](scripts/README.md) - 数据挖掘脚本文档
- 📕 [Vercel部署](VERCEL_SETUP.md) - 部署指南

## 🎯 功能说明

### 数据挖掘
```bash
# 单城市（芝加哥）
node scripts/fetch-permits.js

# 多城市 + Supabase
node scripts/fetch-permits-supabase.js
```

### 数据库管理
- 查看数据: 访问Supabase控制台
- 更新数据: 重新运行数据挖掘脚本
- 备份数据: Supabase自动备份

### 前端切换
```bash
# 切换到Supabase版本
mv app/page.tsx app/page-local.tsx
mv app/page-supabase.tsx app/page.tsx

# 切换回本地版本
mv app/page.tsx app/page-supabase.tsx
mv app/page-local.tsx app/page.tsx
```

## 📈 数据统计

- **承包商数量**: 400+
- **许可证记录**: 7,000+
- **覆盖城市**: 3+ (可扩展至20+)
- **数据时间**: 2020-2026
- **更新频率**: 每周（可配置）

## 🔒 安全性

- ✅ 环境变量隔离（`.env.local`不提交）
- ✅ Supabase行级安全（RLS）
- ✅ 公开只读策略（前端安全）
- ✅ 服务角色保护（后端专用）

## 🚢 部署

### Vercel (推荐)
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

在Vercel项目设置中添加环境变量。

### 其他平台
支持任何支持Next.js的平台：
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 贡献

欢迎贡献！可以：
- 添加新的城市数据源
- 优化数据清洗算法
- 改进UI/UX设计
- 修复bug

## 📄 许可证

MIT License

## 🙋 常见问题

**Q: 数据多久更新一次？**  
A: 建议每周运行一次数据挖掘脚本。可以设置Cron Job自动化。

**Q: 如何添加更多城市？**  
A: 编辑 `scripts/fetch-permits-supabase.js`，在 `DATA_SOURCES` 数组中添加新城市配置。

**Q: Supabase免费版够用吗？**  
A: 完全够用！免费版支持50,000行数据和5GB带宽，当前数据量远低于限制。

**Q: 数据准确吗？**  
A: 100%真实！所有数据直接来自美国城市政府的公开API。

## 📞 支持

- 📧 Email: apex.roofing.group@outlook.com
- 📖 文档: 查看 `docs/` 目录
- 🐛 Bug报告: 提交Issue

---

**最后更新**: 2026年2月4日  
**版本**: 2.0.0 (Supabase + 多城市)

Made with ❤️ using real government data

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
