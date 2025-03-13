# Neon 数据库设置指南

本项目使用 Neon 作为 PostgreSQL 数据库。以下是配置步骤：

## 1. 创建 Neon 账户和项目

1. 访问 [Neon 官网](https://neon.tech/) 并注册账户
2. 创建一个新项目
3. 在项目中创建一个新的分支（默认为 `main`）

## 2. 获取连接字符串

1. 在项目控制台中，点击"Connection Details"
2. 选择 Prisma 连接方式
3. 复制连接字符串，它看起来类似这样：
   ```
   postgresql://[user]:[password]@[neon-host]/[dbname]?sslmode=require
   ```

## 3. 配置环境变量

1. 在项目根目录创建一个 `.env.local` 文件（如果尚未存在）
2. 添加以下内容：
   ```
   DATABASE_URL="你的Neon连接字符串"
   DIRECT_URL="你的Neon直接连接字符串"
   ```

## 4. 初始化数据库

1. 安装必要的依赖：
   ```bash
   npm install @prisma/client pg
   ```

2. 生成 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

3. 部署数据库结构：
   ```bash
   npx prisma db push
   ```

4. 初始化数据库数据：
   在浏览器中访问：
   ```
   http://localhost:3000/api/setup-db
   ```
   或使用 cURL：
   ```bash
   curl -X POST http://localhost:3000/api/setup-db
   ```

## 5. 数据库结构

本项目的数据库包含以下表：

- `Barber`: 理发师信息
- `Service`: 服务项目
- `Booking`: 预约记录

## 6. 常见问题

### 连接错误

如果遇到数据库连接错误，请检查：

1. 连接字符串是否正确
2. IP 访问权限是否已配置
3. SSL 连接是否已启用（Neon 需要 SSL 连接）

### 数据库迁移问题

如果修改了 `prisma/schema.prisma` 文件：

1. 生成迁移文件：
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. 重新生成 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

## 7. 调试工具

- Prisma Studio: `npx prisma studio`
  启动 Prisma 内置的数据库查看工具

- 测试 API: `/api/test-db`
  查看数据库连接状态
