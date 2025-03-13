import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 获取所有预约
export async function GET(request: NextRequest) {
  try {
    // 从请求中获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const serviceId = searchParams.get('serviceId');

    // 构建查询条件
    const whereClause: any = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (barberId) {
      whereClause.barberId = barberId;
    }

    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    // 获取预约数据，包括关联的服务和理发师信息
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            name: true,
          },
        },
        barber: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // 格式化返回数据
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.name,
      customerPhone: booking.phone,
      serviceId: booking.serviceId,
      barberId: booking.barberId,
      dateTime: booking.date.toISOString(),
      timeSlotId: booking.timeSlotId,
      status: booking.status,
      serviceName: booking.service?.name,
      barberName: booking.barber?.name,
      createdAt: booking.createdAt.toISOString(),
      email: booking.email,
      notes: booking.notes || '',
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
    });
  } catch (error: any) {
    console.error("获取预约列表失败:", error);
    return NextResponse.json({
      success: false,
      message: "获取预约列表失败",
      error: error.message || String(error),
    }, { status: 500 });
  }
}
