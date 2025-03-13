'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const businessHours = [
    { day: '周一至周五', hours: '10:00 - 20:00' },
    { day: '周六', hours: '10:00 - 22:00' },
    { day: '周日', hours: '12:00 - 18:00' }
  ];

  const contactInfo = {
    address: '北京市朝阳区建国路88号时尚中心3层301室',
    phone: '010-12345678',
    email: 'contact@hairbook.com'
  };

  const mainLinks = [
    { name: '首页', href: '/' },
    { name: '服务', href: '/services' },
    { name: '团队', href: '/team' },
    { name: '预约', href: '/book' },
    { name: '关于我们', href: '/about' }
  ];

  const socialLinks = [
    { name: '微博', icon: 'weibo', href: 'https://weibo.com' },
    { name: '微信', icon: 'wechat', href: '#' },
    { name: '抖音', icon: 'tiktok', href: 'https://douyin.com' },
    { name: '小红书', icon: 'redbook', href: 'https://xiaohongshu.com' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">HairBook</h3>
            <p className="text-gray-400 mb-4">
              专业美发沙龙，为您提供高品质的美发服务
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  {link.icon === 'weibo' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  )}
                  {link.icon === 'wechat' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {link.icon === 'tiktok' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                    </svg>
                  )}
                  {link.icon === 'redbook' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 导航链接 */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">导航</h3>
            <ul className="space-y-2">
              {mainLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={`hover:text-white transition-colors ${
                      pathname === link.href ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 营业时间 */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">营业时间</h3>
            <ul className="space-y-2">
              {businessHours.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-400">{item.day}</span>
                  <span className="text-white">{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">联系我们</h3>
            <address className="not-italic">
              <div className="flex items-start mb-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">{contactInfo.address}</span>
              </div>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400">{contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">{contactInfo.email}</span>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-sm text-gray-500 text-center">
          <p>&copy; {new Date().getFullYear()} HairBook. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
