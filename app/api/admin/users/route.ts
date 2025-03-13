import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

// 用户数据验证
const UserSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码长度至少6位"),
  role: z.enum(["admin", "staff"]).default("staff"),
});

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    // 获取用户列表
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json({
      success: false,
      message: "获取用户列表失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = UserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const userData = validationResult.data;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "该邮箱已被注册",
      }, { status: 409 });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "用户创建成功",
      user: newUser,
    }, { status: 201 });
  } catch (error: any) {
    console.error("创建用户失败:", error);
    return NextResponse.json({
      success: false,
      message: "创建用户失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
