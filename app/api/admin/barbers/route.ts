import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 理发师数据验证
const BarberSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
});

// 创建新理发师
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = BarberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const barberData = validationResult.data;

    // 检查理发师名称是否已存在
    const existingBarber = await prisma.barber.findFirst({
      where: { name: barberData.name },
    });

    if (existingBarber) {
      return NextResponse.json({
        success: false,
        message: "该理发师姓名已存在",
      }, { status: 409 });
    }

    // 创建新理发师
    const newBarber = await prisma.barber.create({
      data: barberData,
    });

    return NextResponse.json({
      success: true,
      message: "理发师创建成功",
      barber: newBarber,
    }, { status: 201 });
  } catch (error: any) {
    console.error("创建理发师失败:", error);
    return NextResponse.json({
      success: false,
      message: "创建理发师失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
