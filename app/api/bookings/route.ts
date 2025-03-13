import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 预约数据验证架构
const bookingSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要2个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  phone: z.string().min(6, { message: '请输入有效的电话号码' }),
  serviceId: z.string({ required_error: '请选择服务' }),
  barberId: z.string({ required_error: '请选择理发师' }),
  date: z.string({ required_error: '请选择日期' }),
  timeSlotId: z.string({ required_error: '请选择时间段' }),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 解析请求数据
    const body = await request.json();

    // 验证数据
    const validationResult = bookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "数据验证失败",
        errors: validationResult.error.format()
      }, { status: 400 });
    }

    const bookingData = validationResult.data;

    // 检查服务是否存在
    const service = await prisma.service.findUnique({
      where: { id: bookingData.serviceId },
    });

    if (!service) {
      return NextResponse.json({
        success: false,
        message: "所选服务不存在"
      }, { status: 400 });
    }

    // 检查理发师是否存在
    const barber = await prisma.barber.findUnique({
      where: { id: bookingData.barberId },
    });

    if (!barber) {
      return NextResponse.json({
        success: false,
        message: "所选理发师不存在"
      }, { status: 400 });
    }

    // 将日期字符串转换为Date对象
    const bookingDate = new Date(bookingData.date);

    // 创建预约记录
    const booking = await prisma.booking.create({
      data: {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        date: bookingDate,
        timeSlotId: bookingData.timeSlotId,
        notes: bookingData.notes || "",
        service: { connect: { id: bookingData.serviceId } },
        barber: { connect: { id: bookingData.barberId } },
        status: "PENDING", // 预约状态：待确认
      },
    });

    return NextResponse.json({
      success: true,
      message: "预约成功",
      booking
    });
  } catch (error: any) {
    console.error("创建预约失败:", error);

    // Prisma错误处理
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: "该时间段已被预约",
        error: "时间冲突"
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: "创建预约失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}

// 获取预约列表（管理员功能）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');

    // 构建查询条件
    const where: any = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (barberId) {
      where.barberId = barberId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        barber: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings
    });
  } catch (error: any) {
    console.error("获取预约列表失败:", error);

    return NextResponse.json({
      success: false,
      message: "获取预约列表失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
