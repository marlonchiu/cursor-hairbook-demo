import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 服务更新数据验证
const ServiceUpdateSchema = z.object({
  name: z.string().min(1, "服务名称不能为空").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "价格不能为负数").optional(),
  duration: z.number().min(5, "服务时长不能少于5分钟").optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
});

// 更新服务
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    const body = await request.json();

    // 验证请求数据
    const validationResult = ServiceUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // 检查服务是否存在
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return NextResponse.json({
        success: false,
        message: "服务不存在",
      }, { status: 404 });
    }

    // 如果更新名称，检查名称是否已被其他服务使用
    if (updateData.name && updateData.name !== existingService.name) {
      const nameExists = await prisma.service.findFirst({
        where: {
          name: updateData.name,
          id: { not: serviceId }
        },
      });

      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: "该服务名称已被使用",
        }, { status: 409 });
      }
    }

    // 更新服务
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "服务更新成功",
      service: updatedService,
    });
  } catch (error: any) {
    console.error("更新服务失败:", error);
    return NextResponse.json({
      success: false,
      message: "更新服务失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}

// 删除服务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;

    // 检查服务是否存在
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return NextResponse.json({
        success: false,
        message: "服务不存在",
      }, { status: 404 });
    }

    // 检查是否有使用该服务的预约
    const bookingsWithService = await prisma.booking.count({
      where: { serviceId },
    });

    if (bookingsWithService > 0) {
      // 如果有相关预约，仅将服务标记为不活跃，而不是删除
      await prisma.service.update({
        where: { id: serviceId },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        message: "服务已标记为不活跃（存在关联预约）",
        soft_delete: true,
      });
    }

    // 如果没有关联预约，直接删除服务
    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: "服务已成功删除",
    });
  } catch (error: any) {
    console.error("删除服务失败:", error);
    return NextResponse.json({
      success: false,
      message: "删除服务失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
