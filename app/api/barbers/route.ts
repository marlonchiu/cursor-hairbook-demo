import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 获取所有激活的理发师
    const barbers = await prisma.barber.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      barbers
    });
  } catch (error: any) {
    console.error("获取理发师列表失败:", error);

    return NextResponse.json({
      success: false,
      message: "获取理发师列表失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
