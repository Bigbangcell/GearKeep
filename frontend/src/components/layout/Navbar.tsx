'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getSettings, updateSettings } from '@/lib/storage/indexeddb';

export function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setIsDark(settings.theme === 'dark');
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    try {
      const settings = await getSettings();
      await updateSettings({ ...settings, theme: newTheme });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getNavLinkClass = (path: string) => {
    if (isActive(path)) {
      return 'border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
    }
    return 'border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fa fa-camera-retro text-primary text-2xl mr-2" />
              <span className="font-bold text-xl">GearKeep</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/" className={getNavLinkClass('/')}>
                首页
              </Link>
              <Link href="/inventory" className={getNavLinkClass('/inventory')}>
                器材库
              </Link>
              <Link href="/settings" className={getNavLinkClass('/settings')}>
                设置
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="flex items-center"
            >
              <i className={`fa ${isDark ? 'fa-sun-o' : 'fa-moon-o'} mr-2`} />
              {isDark ? '亮色模式' : '暗色模式'}
            </Button>
            <Link href="/add-item">
              <Button className="flex items-center">
                <i className="fa fa-plus mr-2" />
                添加物品
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}