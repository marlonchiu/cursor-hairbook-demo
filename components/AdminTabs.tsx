'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode } from 'react';

interface AdminTabsProps {
  children: ReactNode;
}

export default function AdminTabs({ children }: AdminTabsProps) {
  return (
    <Tabs defaultValue="bookings" className="space-y-4">
      <TabsList>
        <TabsTrigger value="bookings">预约管理</TabsTrigger>
        <TabsTrigger value="services">服务管理</TabsTrigger>
        <TabsTrigger value="barbers">理发师管理</TabsTrigger>
        <TabsTrigger value="timeslots">时间段管理</TabsTrigger>
      </TabsList>
      <TabsContent value="bookings" className="space-y-4">
        {children}
      </TabsContent>
      <TabsContent value="services">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">服务管理</h2>
          <p className="text-gray-500">这里将展示服务管理功能。</p>
        </div>
      </TabsContent>
      <TabsContent value="barbers">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">理发师管理</h2>
          <p className="text-gray-500">这里将展示理发师管理功能。</p>
        </div>
      </TabsContent>
      <TabsContent value="timeslots">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">时间段管理</h2>
          <p className="text-gray-500">这里将展示时间段管理功能。</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
