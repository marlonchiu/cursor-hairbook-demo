import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

// 仅在开发环境中开放此API
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    // 仅允许在开发环境中使用
    if (!IS_DEVELOPMENT) {
      return NextResponse.json({
        success: false,
        message: "此API仅在开发环境中可用"
      }, { status: 403 });
    }

    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json({
        success: false,
        message: "缺少必要的信息"
      }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "该邮箱已注册"
      }, { status: 400 });
    }

    // 密码加密
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "admin"
      }
    });

    // 返回结果，但不返回密码
    return NextResponse.json({
      success: true,
      message: "管理员账号创建成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("创建管理员账号失败:", error);

    return NextResponse.json({
      success: false,
      message: "创建管理员账号失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
