'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: '首页', href: '/' },
    { name: '服务', href: '/services' },
    { name: '团队', href: '/team' },
    { name: '关于我们', href: '/about' },
  ];

  // 监听滚动事件，当页面滚动时添加背景
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-700">Halo</span>
            </Link>

            {/* 桌面端导航链接 */}
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-green-700"
              >
                首页
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-green-700"
              >
                服务项目
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-green-700"
              >
                关于我们
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-green-700"
              >
                联系方式
              </Link>
            </div>
          </div>

          {/* 右侧按钮 */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button
              onClick={() => router.push('/book')}
              className="bg-green-700 hover:bg-green-800"
            >
              立即预约
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/login')}
              className="text-green-700 border-green-700 hover:bg-green-50"
            >
              管理员
            </Button>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50"
            >
              首页
            </Link>
            <Link
              href="/services"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50"
            >
              服务项目
            </Link>
            <Link
              href="/about"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50"
            >
              关于我们
            </Link>
            <Link
              href="/contact"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50"
            >
              联系方式
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Button
                onClick={() => router.push('/book')}
                className="w-full text-left pl-3 pr-4 py-2 text-base font-medium text-green-700 hover:bg-gray-50"
              >
                立即预约
              </Button>
              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              >
                管理员登录
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
