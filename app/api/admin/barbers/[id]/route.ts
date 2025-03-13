import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 理发师更新数据验证
const BarberUpdateSchema = z.object({
  name: z.string().min(1, "姓名不能为空").optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
});

// 更新理发师
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barberId = params.id;
    const body = await request.json();

    // 验证请求数据
    const validationResult = BarberUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.errors,
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // 检查理发师是否存在
    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!existingBarber) {
      return NextResponse.json({
        success: false,
        message: "理发师不存在",
      }, { status: 404 });
    }

    // 如果更新名称，检查名称是否已被其他理发师使用
    if (updateData.name && updateData.name !== existingBarber.name) {
      const nameExists = await prisma.barber.findFirst({
        where: {
          name: updateData.name,
          id: { not: barberId }
        },
      });

      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: "该理发师姓名已被使用",
        }, { status: 409 });
      }
    }

    // 更新理发师
    const updatedBarber = await prisma.barber.update({
      where: { id: barberId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "理发师信息更新成功",
      barber: updatedBarber,
    });
  } catch (error: any) {
    console.error("更新理发师失败:", error);
    return NextResponse.json({
      success: false,
      message: "更新理发师失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}

// 删除理发师
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barberId = params.id;

    // 检查理发师是否存在
    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!existingBarber) {
      return NextResponse.json({
        success: false,
        message: "理发师不存在",
      }, { status: 404 });
    }

    // 检查是否有使用该理发师的预约
    const bookingsWithBarber = await prisma.booking.count({
      where: { barberId },
    });

    if (bookingsWithBarber > 0) {
      // 如果有相关预约，仅将理发师标记为不活跃，而不是删除
      await prisma.barber.update({
        where: { id: barberId },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        message: "理发师已标记为不活跃（存在关联预约）",
        soft_delete: true,
      });
    }

    // 如果没有关联预约，直接删除理发师
    await prisma.barber.delete({
      where: { id: barberId },
    });

    return NextResponse.json({
      success: true,
      message: "理发师已成功删除",
    });
  } catch (error: any) {
    console.error("删除理发师失败:", error);
    return NextResponse.json({
      success: false,
      message: "删除理发师失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
