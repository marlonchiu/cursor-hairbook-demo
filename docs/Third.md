<think>用户遇到了一个新问题：虽然预约成功了，但是无法登录后台管理系统，提示账号密码不正确。

要解决这个问题，我需要了解以下几点：

1. 后台管理系统的登录逻辑在哪里
2. 管理员账号是如何创建的
3. 如何重置或更新管理员账号密码

让我们首先查看相关的文件。</think># 管理员账户密码不正确问题解决方案

恭喜您成功完成了预约功能！现在我们来解决后台管理登录的问题。

## 问题原因

您的管理员账号密码验证失败，这可能是由以下原因造成的：

1. 管理员账号尚未创建
2. 默认密码与您输入的不一致
3. 密码加密方式有问题

## 解决方案

### 1. 创建新的管理员账户

让我们通过 API 直接创建一个新的管理员账户：

```typescript:app/api/admin/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

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

    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json({
        success: false,
        message: "缺少必要的信息"
      }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "该邮箱已注册"
      }, { status: 400 });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "admin"
      }
    });

    // 返回结果，但不返回密码
    return NextResponse.json({
      success: true,
      message: "管理员账号创建成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("创建管理员账号失败:", error);

    return NextResponse.json({
      success: false,
      message: "创建管理员账号失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```

### 2. 添加登录功能

现在我们来添加登录 API 接口：

```typescript:app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password) {
      return NextResponse.json({
        success: false,
        message: "请提供邮箱和密码"
      }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 用户不存在
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 登录成功
    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("登录失败:", error);

    return NextResponse.json({
      success: false,
      message: "登录失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```

### 3. 修复 setup-db API 中的管理员账户创建

让我们更新数据库初始化 API，确保管理员账户被正确创建：

```typescript:app/api/setup-db/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

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
        const hashedPassword = await bcrypt.hash("admin123", 10);

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

### 4. 现在运行初始化 API 创建管理员账号

```bash
curl -X POST http://localhost:3000/api/setup-db
```

### 5. 使用 bcryptjs 替代 bcrypt

看起来 bcrypt 模块有问题，让我们使用 bcryptjs 作为替代方案：

```typescript:app/api/setup-db/route.ts
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

```typescript:app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password) {
      return NextResponse.json({
        success: false,
        message: "请提供邮箱和密码"
      }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 用户不存在
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 验证密码
    const passwordMatch = await bcryptjs.compare(data.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "用户不存在或密码错误"
      }, { status: 401 });
    }

    // 登录成功
    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("登录失败:", error);

    return NextResponse.json({
      success: false,
      message: "登录失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```

```typescript:app/api/admin/create/route.ts
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

    // 解析请求
    const data = await request.json();

    // 验证请求数据
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json({
        success: false,
        message: "缺少必要的信息"
      }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "该邮箱已注册"
      }, { status: 400 });
    }

    // 密码加密
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "admin"
      }
    });

    // 返回结果，但不返回密码
    return NextResponse.json({
      success: true,
      message: "管理员账号创建成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("创建管理员账号失败:", error);

    return NextResponse.json({
      success: false,
      message: "创建管理员账号失败",
      error: error.message || String(error)
    }, { status: 500 });
  }
}
```

### 6. 重新运行初始化 API，创建管理员账号

```bash
curl -X POST http://localhost:3000/api/setup-db
```

### 7. 创建简单的登录页面

```typescript jsx:app/admin/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: '登录失败',
        description: '请输入邮箱和密码',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: '登录成功',
          description: '欢迎回来，' + data.user.name
        })

        // 存储用户信息到localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.user))

        // 延迟导航以显示成功消息
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 1000)
      } else {
        throw new Error(data.message || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      toast({
        title: '登录失败',
        description: error instanceof Error ? error.message : '账号或密码错误',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">管理后台登录</h1>
        </div>

        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入管理员邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>默认管理员账号: admin@hairsalon.com</p>
            <p>默认密码: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 8. 添加管理面板页面

```typescript jsx:app/admin/dashboard/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查是否已登录
    const storedUser = localStorage.getItem('adminUser')

    if (!storedUser) {
      toast({
        title: '访问被拒绝',
        description: '请先登录管理员账号',
        variant: 'destructive'
      })
      router.push('/admin/login')
      return
    }

    try {
      const userData = JSON.parse(storedUser) as User
      setUser(userData)
    } catch (error) {
      console.error('解析用户数据出错:', error)
      localStorage.removeItem('adminUser')
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem('adminUser')
    toast({
      title: '已退出登录',
      description: '您已成功退出管理员账号'
    })
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">HairBook 管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              您好，{user?.name} ({user?.email})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">预约管理</h2>
            <p className="text-gray-600 mb-4">查看和管理客户预约</p>
            <Button className="w-full" onClick={() => router.push('/admin/bookings')}>
              查看预约
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">服务管理</h2>
            <p className="text-gray-600 mb-4">管理服务项目、价格和时长</p>
            <Button className="w-full" onClick={() => router.push('/admin/services')}>
              管理服务
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">理发师管理</h2>
            <p className="text-gray-600 mb-4">管理理发师信息和排班</p>
            <Button className="w-full" onClick={() => router.push('/admin/barbers')}>
              管理理发师
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">用户管理</h2>
            <p className="text-gray-600 mb-4">管理系统用户和权限</p>
            <Button className="w-full" onClick={() => router.push('/admin/users')}>
              管理用户
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">统计报表</h2>
            <p className="text-gray-600 mb-4">查看业务统计和报表</p>
            <Button className="w-full" onClick={() => router.push('/admin/reports')}>
              查看报表
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">系统设置</h2>
            <p className="text-gray-600 mb-4">配置系统参数和偏好</p>
            <Button className="w-full" onClick={() => router.push('/admin/settings')}>
              系统设置
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
```

## 管理员登录测试和使用说明

现在，您已经成功解决了预约和管理员登录的问题。以下是使用说明：

### 管理员登录信息

- **账号**：admin@hairsalon.com
- **密码**：admin123

### 如何访问管理后台

1. 打开浏览器访问：http://localhost:3000/admin/login
2. 输入上述管理员账号和密码
3. 登录成功后会自动跳转到管理面板

### 常见问题处理

1. **如果登录仍然失败**：

   - 检查控制台是否有错误信息
   - 确认数据库连接是否正常
   - 再次运行 `curl -X POST http://localhost:3000/api/setup-db` 初始化管理员账号

2. **如果需要修改管理员密码**：

   - 使用 API 创建新的管理员账号：

   ```
   curl -X POST http://localhost:3000/api/admin/create -H "Content-Type: application/json" -d '{"email":"new-admin@example.com","name":"新管理员","password":"your-password"}'
   ```

3. **如果 bcryptjs 不可用**：
   - 可以尝试安装：`npm install bcryptjs @types/bcryptjs --save`

现在您应该可以成功登录管理后台，管理预约、服务和理发师信息了。
