'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exportData, importData } from '@/lib/storage/import-export';
import { getSettings, updateSettings } from '@/lib/storage/indexeddb';

export default function SettingsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [defaultView, setDefaultView] = useState<'card' | 'list'>('card');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setIsDark(settings.theme === 'dark');
        setDefaultView(settings.defaultView);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleExport = async () => {
    try {
      const blob = await exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gearbak-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('导出成功');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('导出失败：' + (error as Error).message);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file);
      setMessage(result.message);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('导入失败：' + (error as Error).message);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleThemeChange = async () => {
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

  const handleViewChange = async (view: 'card' | 'list') => {
    setDefaultView(view);
    try {
      const settings = await getSettings();
      await updateSettings({ ...settings, defaultView: view });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      {message && (
        <div className="mb-6 p-4 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {message}
        </div>
      )}

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">数据管理</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">导出数据</h3>
              <p className="text-sm text-muted-foreground mb-3">
                将所有物品数据导出为 JSON 文件
              </p>
              <Button onClick={handleExport}>
                <i className="fa fa-download mr-2" />
                导出数据
              </Button>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">导入数据</h3>
              <p className="text-sm text-muted-foreground mb-3">
                从 JSON 文件导入物品数据
              </p>
              <div className="flex space-x-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">应用设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">暗色模式</h3>
                <p className="text-sm text-muted-foreground">
                  启用或禁用暗色模式
                </p>
              </div>
              <Button
                variant={isDark ? 'default' : 'outline'}
                onClick={handleThemeChange}
              >
                {isDark ? '已启用' : '已禁用'}
              </Button>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">默认视图</h3>
              <p className="text-sm text-muted-foreground mb-3">
                设置器材库的默认视图模式
              </p>
              <div className="flex space-x-3">
                <Button
                  variant={defaultView === 'card' ? 'default' : 'outline'}
                  onClick={() => handleViewChange('card')}
                >
                  <i className="fa fa-th mr-2" />
                  卡片视图
                </Button>
                <Button
                  variant={defaultView === 'list' ? 'default' : 'outline'}
                  onClick={() => handleViewChange('list')}
                >
                  <i className="fa fa-list mr-2" />
                  列表视图
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}