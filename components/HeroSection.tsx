'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 right-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="block">专业理发</span>
              <span className="block text-yellow-300">尽在掌握</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-indigo-100 max-w-lg">
              我们提供专业的理发和造型服务，让您焕然一新，展现自信魅力
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all inline-flex items-center justify-center"
                >
                  立即预约
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.div>
              </Link>

              <Link href="/services" className="group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-all inline-flex items-center justify-center"
                >
                  查看服务
                </motion.div>
              </Link>
            </div>

            <div className="mt-8 flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-indigo-300 border-2 border-white flex items-center justify-center text-indigo-800 font-bold">满</div>
                <div className="w-10 h-10 rounded-full bg-purple-300 border-2 border-white flex items-center justify-center text-purple-800 font-bold">意</div>
                <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-white flex items-center justify-center text-blue-800 font-bold">好</div>
              </div>
              <p className="text-indigo-100">
                <span className="font-bold">1000+</span> 顾客好评
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/20 z-10 rounded-xl"></div>
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">精致造型，展现个性魅力</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
