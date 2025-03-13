'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否已登录
    const storedUser = localStorage.getItem('adminUser');

    if (!storedUser) {
      toast({
        title: "访问被拒绝",
        description: "请先登录管理员账号",
        variant: "destructive",
      });
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
    } catch (error) {
      console.error('解析用户数据出错:', error);
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    toast({
      title: "已退出登录",
      description: "您已成功退出管理员账号",
    });
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
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
  );
}
