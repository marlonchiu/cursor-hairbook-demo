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

    // 更新理发师图片
    const barberImages = {
      '张明': "https://images.unsplash.com/photo-1582893561942-d61adcb2e534?w=600&auto=format&fit=crop",
      '李婷': "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop",
      '王强': "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop",
      '刘佳': "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&auto=format&fit=crop"
    };

    const updatedBarbers = [];
    for (const [name, imageUrl] of Object.entries(barberImages)) {
      const barber = await prisma.barber.findFirst({
        where: { name }
      });

      if (barber) {
        const updated = await prisma.barber.update({
          where: { id: barber.id },
          data: { imageUrl }
        });
        updatedBarbers.push(updated);
      }
    }

    // 更新服务图片
    const serviceImages = {
      '精致剪发': "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=600&auto=format&fit=crop",
      '专业染发': "https://images.unsplash.com/photo-1601566431756-6f637ce4f165?w=600&auto=format&fit=crop",
      '造型烫发': "https://images.unsplash.com/photo-1583743498580-e6b2c8cf6c27?w=600&auto=format&fit=crop",
      '头皮护理': "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop",
      '修面刮胡': "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop"
    };

    const updatedServices = [];
    for (const [name, imageUrl] of Object.entries(serviceImages)) {
      const service = await prisma.service.findFirst({
        where: { name }
      });

      if (service) {
        const updated = await prisma.service.update({
          where: { id: service.id },
          data: { imageUrl }
        });
        updatedServices.push(updated);
      }
    }

    return NextResponse.json({
      success: true,
      message: "图片资源更新成功",
      data: {
        barbers: updatedBarbers,
        services: updatedServices
      }
    });
  } catch (error: any) {
    console.error("图片资源更新失败:", error);
    return NextResponse.json({
      success: false,
      message: "图片资源更新失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
