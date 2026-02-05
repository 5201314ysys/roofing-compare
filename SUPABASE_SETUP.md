# 🚀 Supabase 数据库设置指南

本指南将帮你完成从本地JSON到Supabase云数据库的完整迁移。

---

## 📋 目录

1. [创建Supabase项目](#1-创建supabase项目)
2. [创建数据库表](#2-创建数据库表)
3. [配置环境变量](#3-配置环境变量)
4. [运行数据挖掘脚本](#4-运行数据挖掘脚本)
5. [更新前端代码](#5-更新前端代码)
6. [验证数据](#6-验证数据)

---

## 1. 创建Supabase项目

### 步骤 1.1：注册Supabase账号
1. 访问 https://supabase.com
2. 点击 "Start your project" 或 "Sign Up"
3. 使用GitHub或Email注册（推荐GitHub，更快）

### 步骤 1.2：创建新项目
1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Name**: `roofing-compare-db` (或你喜欢的名字)
   - **Database Password**: 设置一个强密码（保存好！）
   - **Region**: 选择 `West US (N. California)` 或离你最近的区域
   - **Pricing Plan**: 选择 `Free` (免费版足够使用)
3. 点击 "Create new project"
4. 等待约2分钟，项目会自动初始化

### 步骤 1.3：获取API凭据
项目创建完成后：
1. 在侧边栏点击 ⚙️ **Settings** → **API**
2. 你会看到两个重要的信息：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Project API keys**:
     - `anon public` (公开密钥) - 用于前端
     - `service_role` (服务角色密钥) - 用于后端脚本

**⚠️ 重要：** 复制并保存这些信息！

---

## 2. 创建数据库表

### 步骤 2.1：打开SQL编辑器
1. 在Supabase项目侧边栏点击 🗃️ **SQL Editor**
2. 点击 "+ New query"

### 步骤 2.2：执行Schema SQL
1. 打开项目中的 `supabase-schema.sql` 文件
2. 复制全部内容
3. 粘贴到Supabase的SQL编辑器中
4. 点击右下角的 **Run** 按钮 ▶️
5. 等待执行完成（应该看到 "Success" 提示）

### 步骤 2.3：验证表创建
1. 在侧边栏点击 📊 **Table Editor**
2. 你应该能看到两个新表：
   - ✅ `contractors` (承包商表)
   - ✅ `permits` (许可证表)

---

## 3. 配置环境变量

### 步骤 3.1：创建 .env.local 文件
在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/chenjunhao/Downloads/10/roofing-compare
cp .env.local.example .env.local
```

### 步骤 3.2：填写Supabase凭据
编辑 `.env.local` 文件，填入你在步骤1.3获取的信息：

```bash
# 将下面的值替换为你的真实凭据
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 邮件配置（可选，如果不用通知功能可以不填）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**⚠️ 安全提示：**
- 不要将 `.env.local` 提交到Git
- `SUPABASE_SERVICE_ROLE_KEY` 有完全权限，务必保密

---

## 4. 运行数据挖掘脚本

### 步骤 4.1：安装依赖（如果还没安装）
```bash
npm install @supabase/supabase-js dotenv
```

### 步骤 4.2：运行数据挖掘脚本
```bash
node scripts/fetch-permits-supabase.js
```

### 步骤 4.3：查看输出
你应该看到类似的输出：
```
🚀 开始挖掘全美国建筑许可数据库...
📊 数据源: 3 个美国主要城市
🔗 Supabase: https://xxxxxxxxxxxxx.supabase.co

📍 正在获取 Chicago, IL 的数据...
   ✓ 获取到 3000 条原始记录
   ✓ 提取到 245 家承包商
   ✓ 处理了 2847 条有效许可记录

📍 正在获取 Austin, TX 的数据...
   ✓ 获取到 2000 条原始记录
   ✓ 提取到 156 家承包商
   ✓ 处理了 1923 条有效许可记录

📍 正在获取 Seattle, WA 的数据...
   ✓ 获取到 2000 条原始记录
   ✓ 提取到 0 家承包商
   ✓ 处理了 2000 条有效许可记录

📈 数据汇总:
   总承包商数: 401
   总许可记录: 6770

💾 开始保存数据到 Supabase...
   ✓ 已保存 387 家承包商
   ✓ 已保存 6523 条许可记录

✅ 数据挖掘完成！
```

### 步骤 4.4：验证数据
在Supabase控制台：
1. 点击 📊 **Table Editor**
2. 选择 `contractors` 表
3. 你应该能看到数百条承包商记录
4. 选择 `permits` 表
5. 你应该能看到数千条许可证记录

---

## 5. 更新前端代码

### 步骤 5.1：备份旧文件
```bash
mv app/page.tsx app/page-old.tsx
```

### 步骤 5.2：使用新的Supabase版本
```bash
mv app/page-supabase.tsx app/page.tsx
```

### 步骤 5.3：重启开发服务器
```bash
# 先停止现有服务器（Ctrl+C）
npm run dev
```

---

## 6. 验证数据

### 步骤 6.1：访问应用
打开浏览器访问：http://localhost:3001

### 步骤 6.2：检查功能
- ✅ 页面能正常加载
- ✅ 能看到从Supabase加载的承包商列表
- ✅ 搜索功能正常工作
- ✅ 城市筛选功能正常工作
- ✅ 显示真实的项目数量和价格

### 步骤 6.3：验证数据实时性
1. 在Supabase控制台手动添加一条测试数据
2. 刷新前端页面
3. 新数据应该立即显示

---

## 🎯 数据源城市列表

当前脚本支持以下城市（可扩展）：

| 城市 | 州 | 数据量 | API类型 |
|------|----|----|---------|
| **Chicago** | IL | ~3000条/次 | Socrata |
| **Austin** | TX | ~2000条/次 | Socrata |
| **Seattle** | WA | ~2000条/次 | Socrata |

### 添加更多城市

编辑 `scripts/fetch-permits-supabase.js`，在 `DATA_SOURCES` 数组中添加：

```javascript
{
  name: '城市名',
  state: '州缩写',
  url: 'API地址',
  limit: 2000,
  query: { /* 查询参数 */ },
  parser: (row) => ({ /* 数据解析 */ })
}
```

可添加的城市：
- 纽约 (New York, NY)
- 洛杉矶 (Los Angeles, CA)
- 旧金山 (San Francisco, CA)
- 波士顿 (Boston, MA)
- 丹佛 (Denver, CO)

---

## ⚙️ 配置选项

### 数据挖掘频率
建议每周运行一次脚本更新数据：
```bash
# 可以设置cron job
0 0 * * 0 cd /path/to/project && node scripts/fetch-permits-supabase.js
```

### 数据筛选条件
在脚本中可以调整：
- **最小项目数**: 当前为3个（第110行）
- **最小成本**: 当前为$2,000（各城市parser中）
- **日期范围**: 当前为2020年后（各城市query中）

---

## 🔧 故障排查

### 问题1：脚本报错 "请配置 Supabase 凭据"
**解决方案：** 检查 `.env.local` 文件是否存在且填写了正确的值

### 问题2：数据保存失败
**解决方案：** 
1. 检查Supabase项目是否正常运行
2. 确认 `service_role` 密钥是否正确
3. 查看Supabase控制台的日志

### 问题3：前端显示空白
**解决方案：**
1. 打开浏览器开发者工具查看Console错误
2. 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否配置
3. 确认Supabase RLS策略允许公开读取

### 问题4：API请求超时
**解决方案：**
1. 某些城市的API可能较慢，增加timeout设置
2. 减少单次请求的数据量（调整 `limit` 参数）

---

## 📊 数据库结构

### contractors 表
```sql
- id (UUID, 主键)
- name (承包商名称, 唯一)
- city (城市)
- state (州)
- total_projects (总项目数)
- avg_quote (平均报价)
- contractor_price (承包商底价)
- verified_at (验证时间)
```

### permits 表
```sql
- id (UUID, 主键)
- contractor_id (外键 → contractors.id)
- permit_number (许可证号, 唯一)
- city (城市)
- reported_cost (报价成本)
- issue_date (签发日期)
- data_source (数据来源)
```

---

## 🎉 完成！

恭喜！你现在已经：
- ✅ 设置了Supabase云数据库
- ✅ 从多个美国城市获取真实数据
- ✅ 实现了前后端完全集成
- ✅ 拥有了可扩展的数据架构

数据会自动从云端加载，无需再依赖本地JSON文件。

---

## 📚 相关资源

- [Supabase文档](https://supabase.com/docs)
- [Socrata API文档](https://dev.socrata.com/)
- [项目GitHub](https://github.com/your-repo)

有问题？查看 `scripts/README.md` 或提交Issue。
