import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '../../components/Footer';
import { Metadata } from 'next';
import BookingPageClient from './BookingPageClient';

export const metadata: Metadata = {
  title: '在线预约 | HairBook',
  description: '通过我们简单易用的在线预约系统，轻松预约您的理发服务',
};

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <BookingPageClient />
      <Footer />
    </div>
  );
}
