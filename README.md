# 理发沙龙预约系统

一个现代化的理发沙龙在线预约系统，使用 Next.js、Prisma 和 Neon 数据库构建。

## 写在前面（参考视频）

[Cursor 实用 MCP 推荐 | Cursor 0.47 更新：更稳更强，效率倍增](https://www.bilibili.com/video/BV1fSRwYSEAM?spm_id_from=333.788.videopod.sections&vd_source=50442939bf93cd24f3538854e9ddeddd)

## 功能特点

- 响应式设计，适配不同尺寸的设备
- 客户可以不用登录就可以预约服务
- 管理员后台用于管理预约和服务
- 与 Neon PostgreSQL 数据库集成
- 使用 NextAuth 进行管理员身份验证

## 技术栈

- **前端框架**: Next.js 14, React 18
- **样式**: Tailwind CSS, shadcn/ui 组件
- **数据库**: Neon PostgreSQL
- **ORM**: Prisma
- **身份验证**: NextAuth.js
- **表单处理**: React Hook Form, Zod
- **日期处理**: date-fns, react-day-picker

## 入门指南

### 前提条件

- Node.js 18+
- npm 或 yarn
- Neon 数据库账户

### 安装

1. 克隆仓库

```
git clone <repository-url>
cd cursor-hairbook-demo
```

2. 安装依赖

```
npm install
```

3. 设置环境变量
   创建`.env`文件，添加以下内容：

```
DATABASE_URL="你的Neon数据库连接字符串"
DIRECT_URL="你的Neon数据库直连字符串"
NEXTAUTH_SECRET="你的密钥"
NEXTAUTH_URL="http://localhost:3000"
```

4. 生成 Prisma 客户端

```
npx prisma generate
```

5. 初始化数据库
   访问 `/setup` 页面或运行种子脚本：

```
npm run seed
```

6. 启动开发服务器

```
npm run dev
```

7. 唤醒数据库连接

```
npx prisma db pull
```

## 管理员登录

- URL: `/admin/login`
- 默认管理员邮箱: `admin@hairsalon.com`
- 默认密码: `admin123`

## 项目结构

- `/app` - Next.js App Router 页面
- `/components` - React 组件
- `/lib` - 工具函数
- `/prisma` - Prisma 模式和迁移
- `/public` - 静态资源
- `/scripts` - 数据库种子等脚本

## 许可

MIT
