import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BookingStatus } from "@prisma/client";

// 更新预约状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();
    let { status } = body;

    // 检查预约是否存在
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        message: "预约不存在",
      }, { status: 404 });
    }

    // 验证状态值是否有效，并转换为大写以匹配枚举
    status = status.toUpperCase();
    const validStatuses = Object.values(BookingStatus);

    if (!validStatuses.includes(status as BookingStatus)) {
      return NextResponse.json({
        success: false,
        message: "无效的预约状态",
        validStatuses: validStatuses,
      }, { status: 400 });
    }

    // 执行状态特定的业务逻辑
    let additionalData: any = {};

    // 如果是完成状态，记录完成时间
    if (status === BookingStatus.COMPLETED) {
      additionalData.completedAt = new Date();
    }

    // 如果是取消状态，记录取消原因(如果提供)
    if (status === BookingStatus.CANCELLED && body.cancelReason) {
      additionalData.notes = existingBooking.notes
        ? `${existingBooking.notes}\n取消原因: ${body.cancelReason}`
        : `取消原因: ${body.cancelReason}`;
    }

    // 更新预约状态
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status as BookingStatus,
        ...additionalData
      },
      include: {
        service: {
          select: { name: true },
        },
        barber: {
          select: { name: true },
        },
      },
    });

    // 可以在这里添加发送通知的逻辑，比如发送短信或邮件通知客户预约状态变更
    // 这里只是模拟记录日志
    console.log(`预约 ${bookingId} 状态已更改为 ${status}，应向客户 ${updatedBooking.name} 发送通知`);

    return NextResponse.json({
      success: true,
      message: "预约状态已更新",
      booking: {
        id: updatedBooking.id,
        customerName: updatedBooking.name,
        customerPhone: updatedBooking.phone,
        serviceId: updatedBooking.serviceId,
        barberId: updatedBooking.barberId,
        dateTime: updatedBooking.date.toISOString(),
        timeSlotId: updatedBooking.timeSlotId,
        status: updatedBooking.status,
        serviceName: updatedBooking.service?.name,
        barberName: updatedBooking.barber?.name,
        createdAt: updatedBooking.createdAt.toISOString(),
        email: updatedBooking.email,
        notes: updatedBooking.notes || '',
      },
    });
  } catch (error: any) {
    console.error("更新预约状态失败:", error);
    return NextResponse.json({
      success: false,
      message: "更新预约状态失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}

// 删除预约
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    // 检查预约是否存在
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        message: "预约不存在",
      }, { status: 404 });
    }

    // 安全检查：只允许删除已完成或已取消的预约
    if (existingBooking.status !== BookingStatus.COMPLETED &&
        existingBooking.status !== BookingStatus.CANCELLED) {
      return NextResponse.json({
        success: false,
        message: "只能删除已完成或已取消的预约",
      }, { status: 400 });
    }

    // 删除预约
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    // 记录操作日志
    console.log(`预约 ${bookingId} 已被删除`);

    return NextResponse.json({
      success: true,
      message: "预约已删除",
    });
  } catch (error: any) {
    console.error("删除预约失败:", error);
    return NextResponse.json({
      success: false,
      message: "删除预约失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
