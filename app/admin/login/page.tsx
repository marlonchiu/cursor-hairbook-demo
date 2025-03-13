'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "登录失败",
        description: "请输入邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "登录成功",
          description: "欢迎回来，" + data.user.name,
        });

        // 存储用户信息到localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // 延迟导航以显示成功消息
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        throw new Error(data.message || "登录失败");
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "账号或密码错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>默认管理员账号: admin@hairsalon.com</p>
            <p>默认密码: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
