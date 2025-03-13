'use client';

import React, { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import { useToast } from '@/components/ui/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  imageUrl?: string;
}

interface Barber {
  id: string;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export default function BookingPageClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 调用初始化API以确保数据存在
        const initResponse = await fetch('/api/setup-db', { method: 'POST' });
        if (!initResponse.ok) {
          console.warn('数据库初始化失败，尝试使用现有数据');
        }

        // 加载服务数据
        const servicesResponse = await fetch('/api/services');
        const barbersResponse = await fetch('/api/barbers');

        if (!servicesResponse.ok || !barbersResponse.ok) {
          throw new Error('获取数据失败');
        }

        const servicesData = await servicesResponse.json();
        const barbersData = await barbersResponse.json();

        console.log('服务数据:', servicesData);
        console.log('理发师数据:', barbersData);

        if (servicesData.success && barbersData.success) {
          setServices(servicesData.services || []);
          setBarbers(barbersData.barbers || []);
        } else {
          throw new Error('数据格式错误');
        }
      } catch (err) {
        console.error('加载数据出错:', err);
        setError('无法加载预约所需数据，请稍后再试');

        // 如果API未实现，使用模拟数据作为后备方案
        setServices(mockServices);
        setBarbers(mockBarbers);

        toast({
          title: "数据加载警告",
          description: "使用模拟数据替代实际数据，这可能导致预约失败",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  // 模拟服务数据（仅作为API失败时的后备）
  const mockServices = [
    { id: '80378cc6-ebb0-4250-b4c7-5ff8d9821b74', name: '精致剪发', price: 188, duration: 45 },
    { id: 'f5783859-87b3-4a37-ba9e-33021b5cbd4c', name: '专业染发', price: 288, duration: 120 },
    { id: 'bec8c0b6-e47a-4d3d-a987-c5a0c0acbdb8', name: '造型烫发', price: 388, duration: 150 },
    { id: '19caaca9-4d52-4ff9-ba9c-8ab4dddb3af2', name: '头皮护理', price: 258, duration: 60 },
    { id: 'b9671ae3-da43-4230-880e-a81cc58a53db', name: '修面刮胡', price: 98, duration: 30 },
  ];

  // 模拟理发师数据（仅作为API失败时的后备）
  const mockBarbers = [
    { id: '77b8b5d4-9957-4f6a-88b9-ddc44020f10f', name: '张明' },
    { id: '50db0b98-b2a7-4aef-adf3-fec3d60a396d', name: '李婷' },
    { id: 'bd1c7a43-2a3f-4e10-96d5-0e865e201041', name: '王强' },
    { id: 'ed8f9fe6-336b-4e1c-adc2-973adfda1b6c', name: '刘佳' },
  ];

  return (
    <main className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">在线预约</h1>
          <p className="text-gray-600 md:text-lg">
            填写以下表单，轻松预约您的理发服务。我们的专业造型师期待为您服务！
          </p>
        </div>

        {/* 预约表单 */}
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">正在加载数据...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                重试
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 px-8">
                <h2 className="text-2xl font-bold text-white">预约信息</h2>
                <p className="text-indigo-100 mt-1">请填写您的个人信息和预约详情</p>
              </div>

              <div className="p-6 md:p-8">
                <BookingForm services={services} barbers={barbers} />
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">预约须知</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                请至少提前24小时预约，以确保您能获得理想的时间段
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                如需取消或更改预约，请至少提前4小时通知我们
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                请您准时到达，以免影响后续顾客的预约
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                若您有特殊要求，请在备注中说明，我们会尽力满足
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
