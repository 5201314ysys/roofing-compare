# Vercel 部署配置文档

## 环境变量配置

部署到 Vercel 后，需要在 Vercel Dashboard 中配置以下环境变量：

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| EMAIL_HOST | SMTP 服务器地址 | smtp.gmail.com |
| EMAIL_PORT | SMTP 端口 | 587 |
| EMAIL_USER | 发件邮箱账号 | your-email@gmail.com |
| EMAIL_PASSWORD | 邮箱密码或应用专用密码 | xxxx xxxx xxxx xxxx |
| EMAIL_FROM | 发件人地址 | your-email@gmail.com |
| EMAIL_TO | 收件人地址 | apex.roofing.group@outlook.com |

### 配置步骤

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `roofing-compare` 项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New** 添加上述每个环境变量
5. 选择环境：Production, Preview, Development (全选)
6. 保存后 Vercel 会自动重新部署

### Gmail 配置特别说明

如果使用 Gmail 发送邮件：
1. 前往 [Google Account Security](https://myaccount.google.com/security)
2. 开启「两步验证」
3. 生成「应用专用密码」：https://myaccount.google.com/apppasswords
4. 使用生成的 16 位密码作为 `EMAIL_PASSWORD`

### Outlook 配置

如果使用 Outlook/Hotmail：
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### 本地开发

1. 复制 `.env.example` 为 `.env.local`
2. 填入真实的邮箱配置
3. `.env.local` 不会被提交到 Git

### 测试邮件发送

部署完成后，访问网站并点击 "Unlock Contractor Pricing"，应该会：
1. 打开用户的邮件客户端
2. 同时向管理员邮箱发送通知邮件

如果仍然收不到邮件，检查：
- Vercel 日志中是否有错误
- SMTP 服务器是否允许第三方应用访问
- 防火墙是否拦截了 587 端口
