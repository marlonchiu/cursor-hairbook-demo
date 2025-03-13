'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BookingForm } from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-green-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4 flex items-center text-green-700 hover:text-green-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Button>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-green-700 text-white">
            <h1 className="text-2xl font-bold">在线预约</h1>
            <p className="text-green-100">填写以下信息预约您的理发服务</p>
          </div>

          <div className="p-6">
            <BookingForm />
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-50 py-8 border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Halo美发沙龙. 保留所有权利.
          </p>
        </div>
      </footer>
    </div>
  );
}
