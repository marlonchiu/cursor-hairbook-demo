import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const barberId = searchParams.get('barberId');

    // 日期必须提供
    if (!date) {
      return NextResponse.json({
        success: false,
        message: "缺少日期参数"
      }, { status: 400 });
    }

    // 服务和理发师必须提供
    if (!serviceId || !barberId) {
      return NextResponse.json({
        success: false,
        message: "缺少服务ID或理发师ID参数"
      }, { status: 400 });
    }

    // 获取预约日期当天的所有已预约时间段
    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    // 查找已存在的预约，确定不可用时间段
    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId: barberId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        timeSlotId: true
      }
    });

    // 已预约的时间段IDs
    const bookedTimeSlotIds = existingBookings.map(booking => booking.timeSlotId);

    // 获取理发师的工作时间和服务时长
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!barber || !service) {
      return NextResponse.json({
        success: false,
        message: "找不到理发师或服务"
      }, { status: 404 });
    }

    // 生成可能的时间段（这里使用简化的固定时间段）
    const allPossibleTimeSlots = [
      { id: "1", startTime: "09:00", endTime: "10:00" },
      { id: "2", startTime: "10:00", endTime: "11:00" },
      { id: "3", startTime: "11:00", endTime: "12:00" },
      { id: "4", startTime: "13:00", endTime: "14:00" },
      { id: "5", startTime: "14:00", endTime: "15:00" },
      { id: "6", startTime: "15:00", endTime: "16:00" },
      { id: "7", startTime: "16:00", endTime: "17:00" },
      { id: "8", startTime: "17:00", endTime: "18:00" }
    ];

    // 过滤掉已预约的时间段
    const availableTimeSlots = allPossibleTimeSlots.filter(
      slot => !bookedTimeSlotIds.includes(slot.id)
    );

    // 检查是否周末，如果是周末，可能会有不同的工作时间
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 返回可用时间段
    return NextResponse.json({
      success: true,
      timeSlots: availableTimeSlots,
      meta: {
        date,
        isWeekend,
        serviceId,
        serviceDuration: service.duration,
        barberId
      }
    });
  } catch (error: any) {
    console.error("获取时间段失败:", error);

    return NextResponse.json({
      success: false,
      message: "获取时间段失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
