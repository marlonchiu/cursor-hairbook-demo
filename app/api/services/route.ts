import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 获取所有激活的服务
    const services = await prisma.service.findMany({
      where: {
        active: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      services
    });
  } catch (error: any) {
    console.error("获取服务列表失败:", error);

    return NextResponse.json({
      success: false,
      message: "获取服务列表失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
