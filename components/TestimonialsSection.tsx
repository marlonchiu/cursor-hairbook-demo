'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
}

interface TestimonialData {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  avatar,
  rating
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-indigo-100 mr-4 flex-shrink-0">
            {avatar ? (
              <Image
                src={avatar}
                alt={author}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {author.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{author}</h4>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials: TestimonialData[] = [
    {
      quote: "每次来这里都能获得满意的发型，张明老师特别了解我想要的风格，很推荐！",
      author: "陈小姐",
      role: "顾客",
      rating: 5
    },
    {
      quote: "服务非常周到，从洗发到造型每一步都很专业，价格也合理，是我的长期理发选择。",
      author: "王先生",
      role: "顾客",
      rating: 5
    },
    {
      quote: "刘佳老师的创意剪裁太棒了，给我设计的发型让我收到了很多赞美，非常感谢！",
      author: "张女士",
      role: "顾客",
      rating: 5
    },
    {
      quote: "理发后的效果比预想的还要好，而且店内环境很好，很干净，服务人员态度也很友好。",
      author: "林先生",
      role: "顾客",
      rating: 4
    },
    {
      quote: "李婷老师对染发特别专业，颜色很自然，而且持久度很好，很满意！",
      author: "赵小姐",
      role: "顾客",
      rating: 5
    },
    {
      quote: "这是我第一次尝试短发造型，王强老师给了很专业的建议，结果非常满意！",
      author: "孙先生",
      role: "顾客",
      rating: 5
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex + testimonialsPerPage >= testimonials.length
        ? 0
        : prevIndex + testimonialsPerPage
    );
  }, [testimonials.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex - testimonialsPerPage < 0
        ? Math.max(0, testimonials.length - testimonialsPerPage)
        : prevIndex - testimonialsPerPage
    );
  }, [testimonials.length]);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [goToNext]);

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialsPerPage
  );

  return (
    <section className="py-16 bg-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">顾客评价</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            听听我们的顾客怎么说，他们的满意是我们不断进步的动力
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <Testimonial
                key={index + currentIndex}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
              />
            ))}
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={goToPrev}
              className="mx-2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300"
              aria-label="上一页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex space-x-2 items-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * testimonialsPerPage)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    Math.floor(currentIndex / testimonialsPerPage) === i
                      ? 'bg-indigo-600'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`转到第${i + 1}页`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="mx-2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-300"
              aria-label="下一页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
