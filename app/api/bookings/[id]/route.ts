import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 验证状态更新
const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 验证请求数据
    const { status } = updateSchema.parse(body);

    // 检查预约是否存在
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: '预约不存在' },
        { status: 404 }
      );
    }

    // 更新预约状态
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // 如果取消预约，则释放时间段
    if (status === 'cancelled') {
      await prisma.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { available: true },
      });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Booking update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, message: '更新预约时发生错误' },
      { status: 500 }
    );
  }
}
