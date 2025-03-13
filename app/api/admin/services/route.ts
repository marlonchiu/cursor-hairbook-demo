import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 服务数据验证
const ServiceSchema = z.object({
  name: z.string().min(1, "服务名称不能为空"),
  description: z.string().optional(),
  price: z.number().min(0, "价格不能为负数"),
  duration: z.number().min(5, "服务时长不能少于5分钟"),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
});

// 创建新服务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = ServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const serviceData = validationResult.data;

    // 检查服务名称是否已存在
    const existingService = await prisma.service.findFirst({
      where: { name: serviceData.name },
    });

    if (existingService) {
      return NextResponse.json({
        success: false,
        message: "该服务名称已存在",
      }, { status: 409 });
    }

    // 创建新服务
    const newService = await prisma.service.create({
      data: serviceData,
    });

    return NextResponse.json({
      success: true,
      message: "服务创建成功",
      service: newService,
    }, { status: 201 });
  } catch (error: any) {
    console.error("创建服务失败:", error);
    return NextResponse.json({
      success: false,
      message: "创建服务失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
