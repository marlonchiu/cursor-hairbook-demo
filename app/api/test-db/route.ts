import { NextRequest, NextResponse } from "next/server";
import { testDbConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connectionResult = await testDbConnection();

    return NextResponse.json({
      message: "数据库连接测试",
      result: connectionResult,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    console.error("API测试失败:", error);

    return NextResponse.json({
      success: false,
      message: "API测试失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
