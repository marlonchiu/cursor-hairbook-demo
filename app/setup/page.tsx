'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const initializeDatabase = async () => {
    setIsLoading(true);
    setMessage('正在初始化数据库...');

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('数据库初始化成功！即将跳转到首页...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(`初始化失败: ${data.error}`);
      }
    } catch (error) {
      setMessage(`发生错误: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">理发沙龙网站设置</h1>
          <p className="text-gray-600">初始化您的应用程序数据</p>
        </div>

        <div className="space-y-4">
          <p>
            点击下面的按钮初始化数据库，这将创建：
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>管理员账号</li>
            <li>服务项目</li>
            <li>理发师信息</li>
            <li>可用时间段</li>
          </ul>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>管理员登录信息：</strong><br />
              邮箱: admin@hairsalon.com<br />
              密码: admin123
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('成功') ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            {message}
          </div>
        )}

        <Button
          onClick={initializeDatabase}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? '初始化中...' : '初始化数据库'}
        </Button>
      </div>
    </div>
  );
}
