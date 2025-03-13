'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  price,
  duration,
  image
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 z-10" />
        <div className="relative w-full h-full bg-gray-200">
          {image && (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <div className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-semibold">
            {price}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
          <Link href="/book" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
            立即预约 →
          </Link>
        </div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const services = [
    {
      title: "精致剪发",
      description: "专业造型师根据您的脸型和个人风格，打造完美发型",
      price: "¥188起",
      duration: "45分钟",
      image: "/images/services/haircut.jpg"
    },
    {
      title: "专业染发",
      description: "使用高品质染发产品，呈现自然色泽与持久效果",
      price: "¥288起",
      duration: "120分钟",
      image: "/images/services/coloring.jpg"
    },
    {
      title: "造型烫发",
      description: "根据最新潮流和个人需求，塑造立体有型的发型",
      price: "¥388起",
      duration: "150分钟",
      image: "/images/services/perm.jpg"
    },
    {
      title: "头皮护理",
      description: "深层清洁和滋养头皮，解决各种头皮问题",
      price: "¥258起",
      duration: "60分钟",
      image: "/images/services/scalp.jpg"
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">我们的服务</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们提供各种专业理发和造型服务，每一项服务都由经验丰富的造型师完成，确保您获得最佳体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              price={service.price}
              duration={service.duration}
              image={service.image}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services"
            className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-600 bg-white rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-300"
          >
            查看全部服务
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
