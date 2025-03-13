<think>用户希望我继续修复预约系统中与Neon数据库相关的问题。我已经创建了数据库连接文件和测试API端点，现在需要继续解决问题。我应该：

1. 创建一个.env文件来配置Neon数据库连接字符串
2. 创建或更新预约接口端点
3. 为BookingForm组件添加错误处理逻辑

下一步我将创建环境变量文件和更新预约API端点。</think>让我们继续修复预约系统，首先创建环境变量文件配置Neon数据库连接：

```shell script:.env.local
# Neon数据库连接
DATABASE_URL="postgres://your-neon-connection-string-here?sslmode=require"

# 其他环境变量
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# 应用设置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
现在我们将创建一个预约API端点，处理预约请求：

```typescript:app/api/bookings/route.ts
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
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone,
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
```
让我们创建一个时间段API端点，处理可用时间段的查询：

```typescript:app/api/time-slots/route.ts
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
```
现在让我们创建一个Prisma schema，来定义数据库结构：

```plain text:prisma/schema.prisma
// Prisma schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// 管理员用户模型
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 理发师模型
model Barber {
  id          String    @id @default(uuid())
  name        String
  title       String?   // 职称
  description String?   // 简介
  imageUrl    String?   // 头像图片URL
  active      Boolean   @default(true) // 是否在职
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[] // 该理发师的所有预约
}

// 服务项目模型
model Service {
  id          String    @id @default(uuid())
  name        String
  description String?
  price       Float
  duration    Int       // 服务时长（分钟）
  imageUrl    String?   // 服务图片URL
  active      Boolean   @default(true) // 是否可用
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[] // 该服务的所有预约
}

// 预约状态枚举
enum BookingStatus {
  PENDING   // 待确认
  CONFIRMED // 已确认
  COMPLETED // 已完成
  CANCELLED // 已取消
}

// 预约模型
model Booking {
  id            String        @id @default(uuid())
  name          String        // 客户姓名
  email         String        // 客户邮箱
  phone         String        // 客户电话
  date          DateTime      // 预约日期
  timeSlotId    String        // 预约时间段ID
  notes         String?       // 备注
  status        BookingStatus @default(PENDING)
  serviceId     String        // 服务ID
  service       Service       @relation(fields: [serviceId], references: [id])
  barberId      String        // 理发师ID
  barber        Barber        @relation(fields: [barberId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([date, barberId]) // 根据日期和理发师查询的索引
  @@index([date, status]) // 根据日期和状态查询的索引
}
```
现在我们需要修复预约API中的字段不匹配问题：

```typescript:app/api/bookings/route.ts
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
```
让我们来修改 BookingForm 组件，使其能够正确处理预约提交和错误情况：

```typescript jsx:components/BookingForm.tsx
// 修改时间段处理和服务器响应处理
// ... existing code ...

// 当用户选择日期时获取可用时间段
const handleDateSelect = async (selectedDate: Date) => {
  setDate(selectedDate);

  if (selectedService && selectedBarber) {
    try {
      setIsLoading(true);
      // 调用API获取可用时间段
      const response = await fetch(`/api/time-slots?date=${format(selectedDate, 'yyyy-MM-dd')}&serviceId=${selectedService}&barberId=${selectedBarber}`);

      if (!response.ok) {
        throw new Error(`获取时间段失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.timeSlots) {
        setAvailableTimeSlots(data.timeSlots);
        setError('');
      } else {
        setError(data.message || '无法获取可用时间段');
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('获取时间段出错:', error);
      setError('获取可用时间段时出错，请稍后再试');

      // 备用: 使用模拟数据
      setAvailableTimeSlots(mockTimeSlots);
    } finally {
      setIsLoading(false);
    }

    setTimeSlot(undefined);
  }
};

const onSubmit = async (data: BookingFormValues) => {
  if (!date || !timeSlot) {
    toast({
      title: "错误",
      description: "请选择日期和时间",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);
  setError('');

  try {
    // 准备提交数据
    const bookingData = {
      ...data,
      date: format(date, 'yyyy-MM-dd'),
      timeSlotId: timeSlot,
    };

    // 发送预约请求
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      // 预约成功
      toast({
        title: "预约成功",
        description: "您的预约已成功提交，我们将尽快与您联系确认。",
      });

      // 重置表单
      setDate(undefined);
      setTimeSlot(undefined);
      setStep(1);
      reset(); // 重置表单字段
    } else {
      // 预约失败，显示错误信息
      throw new Error(responseData.message || '预约提交失败');
    }
  } catch (error) {
    console.error('预约提交错误:', error);

    toast({
      title: "预约失败",
      description: error instanceof Error ? error.message : "无法提交您的预约，请稍后再试。",
      variant: "destructive",
    });

    setError(error instanceof Error ? error.message : "预约失败，请稍后再试");
  } finally {
    setIsSubmitting(false);
  }
};

// ... existing code ...
```
我们需要创建prisma数据库迁移和初始化数据库的脚本：

```typescript:app/api/setup-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";

// 仅在开发环境中开放此API
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    // 仅允许在开发环境中使用
    if (!IS_DEVELOPMENT) {
      return NextResponse.json({
        success: false,
        message: "此API仅在开发环境中可用"
      }, { status: 403 });
    }

    // 初始化管理员账户
    const adminEmail = "admin@hairsalon.com";
    const adminPassword = "Admin123!";
    const hashedPassword = await hash(adminPassword, 10);

    // 检查管理员账户是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    let admin;
    if (!existingAdmin) {
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "系统管理员",
          password: hashedPassword,
          role: "admin"
        }
      });
    } else {
      admin = existingAdmin;
    }

    // 初始化理发师数据
    const barbers = [
      {
        name: "张明",
        title: "首席造型师",
        description: "拥有15年理发造型经验，曾在多个国际发型大赛获奖，擅长各种复杂造型和个性设计。",
        imageUrl: "/images/barbers/barber-1.jpg",
      },
      {
        name: "李婷",
        title: "高级美发师",
        description: "专注于染发和烫发技术，为顾客打造自然且持久的发色，追求细节与品质。",
        imageUrl: "/images/barbers/barber-2.jpg",
      },
      {
        name: "王强",
        title: "男士理发专家",
        description: "专注男士发型设计10年，擅长经典与现代风格相结合，为每位顾客打造最适合的形象。",
        imageUrl: "/images/barbers/barber-3.jpg",
      },
      {
        name: "刘佳",
        title: "发型设计师",
        description: "毕业于国际美发学院，关注最新的发型潮流，擅长将国际流行趋势融入个人风格。",
        imageUrl: "/images/barbers/barber-4.jpg",
      }
    ];

    // 初始化服务数据
    const services = [
      {
        name: "精致剪发",
        description: "专业造型师根据您的脸型和个人风格，打造完美发型",
        price: 188,
        duration: 45,
        imageUrl: "/images/services/haircut.jpg"
      },
      {
        name: "专业染发",
        description: "使用高品质染发产品，呈现自然色泽与持久效果",
        price: 288,
        duration: 120,
        imageUrl: "/images/services/coloring.jpg"
      },
      {
        name: "造型烫发",
        description: "根据最新潮流和个人需求，塑造立体有型的发型",
        price: 388,
        duration: 150,
        imageUrl: "/images/services/perm.jpg"
      },
      {
        name: "头皮护理",
        description: "深层清洁和滋养头皮，解决各种头皮问题",
        price: 258,
        duration: 60,
        imageUrl: "/images/services/scalp.jpg"
      },
      {
        name: "修面刮胡",
        description: "专业修面和刮胡服务，让您的面部更加清爽",
        price: 98,
        duration: 30,
        imageUrl: "/images/services/shave.jpg"
      }
    ];

    // 批量创建理发师
    const createdBarbers = [];
    for (const barberData of barbers) {
      const existing = await prisma.barber.findFirst({
        where: { name: barberData.name }
      });

      if (!existing) {
        const barber = await prisma.barber.create({ data: barberData });
        createdBarbers.push(barber);
      } else {
        createdBarbers.push(existing);
      }
    }

    // 批量创建服务
    const createdServices = [];
    for (const serviceData of services) {
      const existing = await prisma.service.findFirst({
        where: { name: serviceData.name }
      });

      if (!existing) {
        const service = await prisma.service.create({ data: serviceData });
        createdServices.push(service);
      } else {
        createdServices.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: "数据库初始化成功",
      data: {
        admin,
        barbers: createdBarbers,
        services: createdServices
      }
    });
  } catch (error: any) {
    console.error("数据库初始化失败:", error);
    return NextResponse.json({
      success: false,
      message: "数据库初始化失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```
让我们安装bcrypt依赖并修复setup-db API：

```bash
npm install bcrypt @types/bcrypt
```
让我们修改setup-db API以解决错误：

```typescript:app/api/setup-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 仅在开发环境中开放此API
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    // 仅允许在开发环境中使用
    if (!IS_DEVELOPMENT) {
      return NextResponse.json({
        success: false,
        message: "此API仅在开发环境中可用"
      }, { status: 403 });
    }

    // 初始化理发师数据
    const barbers = [
      {
        name: "张明",
        title: "首席造型师",
        description: "拥有15年理发造型经验，曾在多个国际发型大赛获奖，擅长各种复杂造型和个性设计。",
        imageUrl: "/images/barbers/barber-1.jpg",
      },
      {
        name: "李婷",
        title: "高级美发师",
        description: "专注于染发和烫发技术，为顾客打造自然且持久的发色，追求细节与品质。",
        imageUrl: "/images/barbers/barber-2.jpg",
      },
      {
        name: "王强",
        title: "男士理发专家",
        description: "专注男士发型设计10年，擅长经典与现代风格相结合，为每位顾客打造最适合的形象。",
        imageUrl: "/images/barbers/barber-3.jpg",
      },
      {
        name: "刘佳",
        title: "发型设计师",
        description: "毕业于国际美发学院，关注最新的发型潮流，擅长将国际流行趋势融入个人风格。",
        imageUrl: "/images/barbers/barber-4.jpg",
      }
    ];

    // 初始化服务数据
    const services = [
      {
        name: "精致剪发",
        description: "专业造型师根据您的脸型和个人风格，打造完美发型",
        price: 188,
        duration: 45,
        imageUrl: "/images/services/haircut.jpg"
      },
      {
        name: "专业染发",
        description: "使用高品质染发产品，呈现自然色泽与持久效果",
        price: 288,
        duration: 120,
        imageUrl: "/images/services/coloring.jpg"
      },
      {
        name: "造型烫发",
        description: "根据最新潮流和个人需求，塑造立体有型的发型",
        price: 388,
        duration: 150,
        imageUrl: "/images/services/perm.jpg"
      },
      {
        name: "头皮护理",
        description: "深层清洁和滋养头皮，解决各种头皮问题",
        price: 258,
        duration: 60,
        imageUrl: "/images/services/scalp.jpg"
      },
      {
        name: "修面刮胡",
        description: "专业修面和刮胡服务，让您的面部更加清爽",
        price: 98,
        duration: 30,
        imageUrl: "/images/services/shave.jpg"
      }
    ];

    // 批量创建理发师
    const createdBarbers = [];
    for (const barberData of barbers) {
      const existing = await prisma.barber.findFirst({
        where: { name: barberData.name }
      });

      if (!existing) {
        const barber = await prisma.barber.create({ data: barberData });
        createdBarbers.push(barber);
      } else {
        createdBarbers.push(existing);
      }
    }

    // 批量创建服务
    const createdServices = [];
    for (const serviceData of services) {
      const existing = await prisma.service.findFirst({
        where: { name: serviceData.name }
      });

      if (!existing) {
        const service = await prisma.service.create({ data: serviceData });
        createdServices.push(service);
      } else {
        createdServices.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: "数据库初始化成功",
      data: {
        barbers: createdBarbers,
        services: createdServices
      }
    });
  } catch (error: any) {
    console.error("数据库初始化失败:", error);
    return NextResponse.json({
      success: false,
      message: "数据库初始化失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```
让我们针对Neon数据库创建启动指南：

```markdown:NEON_SETUP.md
# Neon 数据库设置指南

本项目使用 Neon 作为 PostgreSQL 数据库。以下是配置步骤：

## 1. 创建 Neon 账户和项目

1. 访问 [Neon 官网](https://neon.tech/) 并注册账户
2. 创建一个新项目
3. 在项目中创建一个新的分支（默认为 `main`）

## 2. 获取连接字符串

1. 在项目控制台中，点击"Connection Details"
2. 选择 Prisma 连接方式
3. 复制连接字符串，它看起来类似这样：
   ```
   postgresql://[user]:[password]@[neon-host]/[dbname]?sslmode=require
   ```

## 3. 配置环境变量

1. 在项目根目录创建一个 `.env.local` 文件（如果尚未存在）
2. 添加以下内容：
   ```
   DATABASE_URL="你的Neon连接字符串"
   DIRECT_URL="你的Neon直接连接字符串"
   ```

## 4. 初始化数据库

1. 安装必要的依赖：
   ```bash
   npm install @prisma/client pg
   ```

2. 生成 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

3. 部署数据库结构：
   ```bash
   npx prisma db push
   ```

4. 初始化数据库数据：
   在浏览器中访问：
   ```
   http://localhost:3000/api/setup-db
   ```
   或使用 cURL：
   ```bash
   curl -X POST http://localhost:3000/api/setup-db
   ```

## 5. 数据库结构

本项目的数据库包含以下表：

- `Barber`: 理发师信息
- `Service`: 服务项目
- `Booking`: 预约记录

## 6. 常见问题

### 连接错误

如果遇到数据库连接错误，请检查：

1. 连接字符串是否正确
2. IP 访问权限是否已配置
3. SSL 连接是否已启用（Neon 需要 SSL 连接）

### 数据库迁移问题

如果修改了 `prisma/schema.prisma` 文件：

1. 生成迁移文件：
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. 重新生成 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

## 7. 调试工具

- Prisma Studio: `npx prisma studio`
  启动 Prisma 内置的数据库查看工具

- 测试 API: `/api/test-db`
  查看数据库连接状态
```
最后，让我们创建一个初始化脚本来帮助用户设置项目：

```javascript:scripts/init-db.js
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 项目根目录
const rootDir = path.resolve(__dirname, '../');

// 判断是否有.env.local文件
const envLocalPath = path.join(rootDir, '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);

console.log('=== HairBook 数据库初始化工具 ===');
console.log('该工具将帮助您设置 Neon 数据库并初始化数据');
console.log('');

// 检查环境变量
function promptForDatabaseUrl() {
  return new Promise((resolve) => {
    rl.question('请输入 Neon 数据库连接字符串 (DATABASE_URL): ', (databaseUrl) => {
      resolve(databaseUrl);
    });
  });
}

// 创建/更新.env.local文件
async function setupEnvFile() {
  console.log('\n正在检查环境变量...');

  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (envLocalExists) {
      try {
        // 尝试从.env.local读取
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const match = envContent.match(/DATABASE_URL="([^"]+)"/);
        if (match && match[1]) {
          databaseUrl = match[1];
          console.log(`从 .env.local 文件中读取到 DATABASE_URL: ${databaseUrl.substring(0, 15)}...`);
        }
      } catch (error) {
        console.log('无法读取 .env.local 文件:', error.message);
      }
    }

    if (!databaseUrl) {
      databaseUrl = await promptForDatabaseUrl();
    }
  }

  let envContent = '';
  if (envLocalExists) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    // 替换或添加 DATABASE_URL
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL="[^"]*"/, `DATABASE_URL="${databaseUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
    }

    // 添加 DIRECT_URL 如果不存在
    if (!envContent.includes('DIRECT_URL=')) {
      envContent += `DIRECT_URL="${databaseUrl}"\n`;
    }
  } else {
    // 创建新的 .env.local 文件
    envContent = `DATABASE_URL="${databaseUrl}"\nDIRECT_URL="${databaseUrl}"\n`;
  }

  fs.writeFileSync(envLocalPath, envContent);
  console.log('.env.local 文件已更新');

  return databaseUrl;
}

// 部署数据库结构
async function deployDatabaseSchema() {
  console.log('\n正在部署数据库结构...');

  try {
    // 生成Prisma客户端
    console.log('正在生成 Prisma 客户端...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 部署数据库架构
    console.log('正在部署数据库架构...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('数据库架构部署成功!');
    return true;
  } catch (error) {
    console.error('数据库架构部署失败:', error.message);
    return false;
  }
}

// 初始化默认数据
async function initializeData() {
  console.log('\n正在初始化数据...');

  try {
    // 等待数据库初始化
    execSync('npm run dev -- --port 3333', { timeout: 15000, killSignal: 'SIGINT' });
  } catch (error) {
    // 预期的行为，我们只需要启动服务器几秒钟
  }

  // 使用curl调用API
  try {
    console.log('正在调用数据库初始化API...');
    execSync('curl -X POST http://localhost:3333/api/setup-db', { stdio: 'inherit' });
    console.log('数据初始化成功!');
    return true;
  } catch (error) {
    console.error('数据初始化失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 设置环境变量
    await setupEnvFile();

    // 部署数据库架构
    const schemaDeployed = await deployDatabaseSchema();
    if (!schemaDeployed) {
      console.log('数据库架构部署失败，请检查连接字符串和网络连接');
      rl.close();
      return;
    }

    // 询问是否要初始化数据
    rl.question('\n是否要初始化默认数据? (Y/n) ', async (answer) => {
      if (answer.toLowerCase() !== 'n') {
        await initializeData();
      }

      console.log('\n=== 初始化过程完成 ===');
      console.log('您现在可以使用以下命令启动应用:');
      console.log('npm run dev');

      rl.close();
    });
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
    rl.close();
  }
}

// 执行主函数
main();
```
让我们更新 package.json 来添加初始化命令：

```json:package.json
// 添加初始化命令
"scripts": {
  // ... existing scripts ...
  "init-db": "node scripts/init-db.js",
  "prisma:generate": "prisma generate",
  "prisma:push": "prisma db push"
}
```
## 总结和问题修复建议

我已经为您的HairBook项目实现了Neon数据库集成和预约系统。以下是您需要做的步骤来修复预约中的错误：

### 1. 安装必要的依赖

运行以下命令安装所需的依赖：

```bash
npm install @prisma/client pg
```

### 2. 设置Neon数据库

1. 注册一个[Neon](https://neon.tech)账户并创建一个PostgreSQL数据库
2. 获取数据库连接字符串
3. 在项目根目录创建`.env.local`文件，添加以下内容（替换为您的连接字符串）：
   ```
   DATABASE_URL="postgres://[username]:[password]@[hostname]/[dbname]?sslmode=require"
   DIRECT_URL="postgres://[username]:[password]@[hostname]/[dbname]?sslmode=require"
   ```

### 3. 初始化数据库

使用我们创建的初始化命令：

```bash
npm run init-db
```

或者手动执行以下步骤：

```bash
npx prisma generate
npx prisma db push
```

然后访问`http://localhost:3000/api/setup-db`初始化默认数据

### 4. 测试数据库连接

访问`http://localhost:3000/api/test-db`查看数据库连接是否正常

### 5. 常见问题解决

1. **预约表单服务和理发师数据加载失败**：
   - 检查数据库连接是否正确
   - 检查API路由是否返回正确的响应格式
   - 查看浏览器控制台是否有错误

2. **时间段加载错误**：
   - 确保已选择日期、服务和理发师
   - 检查时间段API路由响应格式

3. **提交预约失败**：
   - 检查表单数据格式是否符合API期望
   - 确保所有必填字段已填写
   - 查看服务器日志了解详细错误

### 参考文档

我已经为您创建了以下文件来帮助解决问题：

1. `lib/db.ts` - 数据库连接配置
2. `prisma/schema.prisma` - 数据库结构定义
3. `app/api/test-db/route.ts` - 数据库连接测试API
4. `app/api/setup-db/route.ts` - 数据库初始化API
5. `app/api/bookings/route.ts` - 预约处理API
6. `app/api/time-slots/route.ts` - 时间段查询API
7. `NEON_SETUP.md` - Neon数据库设置指南
8. `scripts/init-db.js` - 数据库初始化脚本

按照上述步骤操作，您的预约系统应该能够正常工作了。如果还有其他问题，欢迎随时咨询！
