import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

// Neon数据库连接配置
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 使用缓存的PrismaClient实例，避免开发环境下创建多个连接
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// 在非生产环境下缓存Prisma实例
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Neon直接连接池（备用方案）
export const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

// 简单测试数据库连接
export async function testDbConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return { success: true, message: "数据库连接成功", result };
  } catch (error: any) {
    console.error("数据库连接测试失败:", error);
    return {
      success: false,
      message: "数据库连接失败",
      error: error.message || String(error)
    };
  }
}

export default prisma;
