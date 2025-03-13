import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

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

    // 创建默认管理员账户
    try {
      const adminExists = await prisma.user.findFirst({
        where: { role: "admin" }
      });

      if (!adminExists) {
        const hashedPassword = await bcryptjs.hash("admin123", 10);

        await prisma.user.create({
          data: {
            email: "admin@hairsalon.com",
            name: "管理员",
            password: hashedPassword,
            role: "admin"
          }
        });

        console.log("默认管理员账户已创建");
      }
    } catch (err) {
      console.warn("创建管理员账户时出错:", err);
    }

    // 初始化理发师数据
    const barbers = [
      {
        name: "张明",
        title: "首席造型师",
        description: "拥有15年理发造型经验，曾在多个国际发型大赛获奖，擅长各种复杂造型和个性设计。",
        imageUrl: "https://images.unsplash.com/photo-1582893561942-d61adcb2e534?w=600&auto=format&fit=crop",
      },
      {
        name: "李婷",
        title: "高级美发师",
        description: "专注于染发和烫发技术，为顾客打造自然且持久的发色，追求细节与品质。",
        imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop",
      },
      {
        name: "王强",
        title: "男士理发专家",
        description: "专注男士发型设计10年，擅长经典与现代风格相结合，为每位顾客打造最适合的形象。",
        imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop",
      },
      {
        name: "刘佳",
        title: "发型设计师",
        description: "毕业于国际美发学院，关注最新的发型潮流，擅长将国际流行趋势融入个人风格。",
        imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&auto=format&fit=crop",
      }
    ];

    // 初始化服务数据
    const services = [
      {
        name: "精致剪发",
        description: "专业造型师根据您的脸型和个人风格，打造完美发型",
        price: 188,
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=600&auto=format&fit=crop"
      },
      {
        name: "专业染发",
        description: "使用高品质染发产品，呈现自然色泽与持久效果",
        price: 288,
        duration: 120,
        imageUrl: "https://images.unsplash.com/photo-1601566431756-6f637ce4f165?w=600&auto=format&fit=crop"
      },
      {
        name: "造型烫发",
        description: "根据最新潮流和个人需求，塑造立体有型的发型",
        price: 388,
        duration: 150,
        imageUrl: "https://images.unsplash.com/photo-1583743498580-e6b2c8cf6c27?w=600&auto=format&fit=crop"
      },
      {
        name: "头皮护理",
        description: "深层清洁和滋养头皮，解决各种头皮问题",
        price: 258,
        duration: 60,
        imageUrl: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop"
      },
      {
        name: "修面刮胡",
        description: "专业修面和刮胡服务，让您的面部更加清爽",
        price: 98,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop"
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
