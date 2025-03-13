import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password) {
      return NextResponse.json({
        success: false,
        message: "请提供邮箱和密码"
      }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 用户不存在
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 验证密码
    const passwordMatch = await bcryptjs.compare(data.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 登录成功
    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("登录失败:", error);

    return NextResponse.json({
      success: false,
      message: "登录失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
