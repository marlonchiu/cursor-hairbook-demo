'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2669&auto=format&fit=crop",
  salon: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2670&auto=format&fit=crop",
  services: {
    haircut: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2668&auto=format&fit=crop",
    coloring: "https://images.unsplash.com/photo-1560869713-da86a9ec0070?q=80&w=2670&auto=format&fit=crop",
    styling: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=2574&auto=format&fit=crop",
  }
};

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-green-50">
      <Navbar />

      {/* 英雄区域 */}
      <section className="relative overflow-hidden pt-12 md:pt-16 pb-24">
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-4/5 h-full -z-10">
          <div className="absolute right-0 top-0 w-full h-full bg-white rounded-bl-[40%] opacity-40"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute right-40 top-40 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-xl"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* 左侧文本内容 */}
            <motion.div
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={staggerChildren}
              className="md:col-span-6 z-10"
            >
              <motion.div
                variants={fadeIn}
                className="inline-block px-4 py-2 rounded-full bg-white shadow-sm text-green-700 font-medium text-sm mb-4"
              >
                专业美发沙龙
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
              >
                <span className="text-neutral-800">优雅造型</span><br />
                <span className="text-green-700">专属你的风格</span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-gray-600 text-lg mb-8 max-w-lg"
              >
                体验我们专业发型师的优质服务，轻松在线预约，无需注册账号，简单便捷。
              </motion.p>

              <motion.div variants={fadeIn} className="flex gap-4">
                <Button
                  onClick={() => router.push('/book')}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full text-md font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md"
                >
                  立即预约
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/services')}
                  className="bg-white text-green-700 border-green-700 hover:bg-green-50 px-6 py-3 rounded-full text-md font-medium"
                >
                  浏览服务
                </Button>
              </motion.div>
            </motion.div>

            {/* 右侧图片区域 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-6 relative z-10"
            >
              <div className="relative w-full aspect-square md:aspect-auto md:h-[550px] overflow-hidden rounded-[2rem] shadow-2xl">
                <Image
                  src={IMAGES.hero}
                  alt="专业美发师为客户服务"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* 浮动元素 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">客户满意度</p>
                    <p className="font-bold text-green-700">98%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -top-4 right-10 bg-white p-4 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">专业理发师</p>
                    <p className="font-bold text-pink-500">5+ 年经验</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 服务概览 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">我们的特色服务</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              从基础剪发到高级染烫，我们提供全方位的美发服务，让您展现最佳形象
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "精致剪发",
                desc: "由专业设计师根据您的脸型和需求，打造完美发型",
                icon: "scissors",
                color: "green",
                image: IMAGES.services.haircut
              },
              {
                title: "专业染发",
                desc: "使用高品质染料，呈现自然持久的色彩效果",
                icon: "palette",
                color: "pink",
                image: IMAGES.services.coloring
              },
              {
                title: "造型烫发",
                desc: "创新技术与专业产品，打造自然蓬松的烫发效果",
                icon: "wind",
                color: "purple",
                image: IMAGES.services.styling
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className={`bg-${service.color}-100 w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-${service.color}-500`}>
                      {service.icon === "scissors" && (
                        <>
                          <circle cx="6" cy="6" r="3"></circle>
                          <circle cx="18" cy="18" r="3"></circle>
                          <path d="M8.12 8.12 12 12"></path>
                          <path d="M12 12 15.88 15.88"></path>
                          <path d="M12 12 19.99 4.01"></path>
                          <path d="M12 12 4.01 19.99"></path>
                        </>
                      )}
                      {service.icon === "palette" && (
                        <>
                          <circle cx="13.5" cy="6.5" r="2.5"></circle>
                          <circle cx="17.5" cy="10.5" r="2.5"></circle>
                          <circle cx="8.5" cy="7.5" r="2.5"></circle>
                          <circle cx="6.5" cy="12.5" r="2.5"></circle>
                          <path d="M12 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                        </>
                      )}
                      {service.icon === "wind" && (
                        <>
                          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
                          <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
                          <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.desc}</p>
                  <Link href="/services" className="text-green-700 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    了解更多
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={IMAGES.salon}
                    alt="Halo美发沙龙环境"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-xl shadow-lg max-w-xs">
                  <p className="font-medium text-green-700 mb-1">5年+</p>
                  <p className="text-gray-600 text-sm">专注提供高品质美发服务</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">关于 Halo 美发沙龙</h2>
              <p className="text-gray-600 mb-6">
                Halo美发沙龙成立于2018年，我们拥有一支经验丰富、技术精湛的专业发型师团队。
                我们致力于为每位客户提供个性化的美发体验，根据您的脸型、发质和生活方式，
                打造最适合您的发型。
              </p>
              <p className="text-gray-600 mb-8">
                我们使用高品质的美发产品，确保您的发丝健康亮丽。无论是日常造型还是特殊场合，
                我们都能满足您的需求，让您自信展现最佳形象。
              </p>
              <Button
                onClick={() => router.push('/about')}
                className="bg-white text-green-700 border border-green-700 hover:bg-green-50 px-6 py-3 rounded-full"
              >
                了解更多
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 预约提示 */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">准备好展现全新形象了吗？</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              立即预约，体验我们专业的美发服务，无需注册，简单便捷。
            </p>
            <Button
              onClick={() => router.push('/book')}
              className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-full text-lg font-medium"
            >
              立即预约
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-4">Halo</h3>
              <p className="text-gray-600 mb-4">
                专业美发沙龙，为您提供优质的发型设计与护理服务。
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">服务项目</h4>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-gray-600 hover:text-green-700">精致剪发</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-green-700">专业染发</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-green-700">造型烫发</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-green-700">头皮护理</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">关于我们</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-green-700">品牌故事</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-green-700">团队介绍</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-green-700">环境展示</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">联系我们</h4>
              <ul className="space-y-2">
                <li className="text-gray-600">地址：北京市朝阳区建国路88号</li>
                <li className="text-gray-600">电话：010-12345678</li>
                <li className="text-gray-600">邮箱：info@halo-salon.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Halo美发沙龙. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
