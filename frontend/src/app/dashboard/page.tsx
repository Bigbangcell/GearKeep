'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAllItems } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';
import { DashboardCharts } from '@/components/feature/DashboardCharts';
import { Button } from '@/components/ui/button';

type TimeRange = 'all' | 'month' | 'quarter' | 'year';

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const allItems = await getAllItems();
        setItems(allItems);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    let result = [...items];

    if (timeRange === 'month') {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(item => item.purchaseDate >= oneMonthAgo);
    } else if (timeRange === 'quarter') {
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      result = result.filter(item => item.purchaseDate >= threeMonthsAgo);
    } else if (timeRange === 'year') {
      const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
      result = result.filter(item => item.purchaseDate >= oneYearAgo);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedChannel !== 'all') {
      result = result.filter(item => item.purchaseChannel === selectedChannel);
    }

    return result;
  }, [items, timeRange, selectedCategory, selectedChannel]);

  const stats = useMemo(() => {
    const totalAssets = filteredItems.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalItems = filteredItems.length;

    const firstPurchaseDate = filteredItems.length > 0
      ? Math.min(...filteredItems.map(item => item.purchaseDate))
      : Date.now();
    const daysSinceFirstPurchase = Math.max(1, Math.floor((Date.now() - firstPurchaseDate) / (24 * 60 * 60 * 1000)));
    const dailyAverage = totalAssets / daysSinceFirstPurchase;

    const prices = filteredItems.map(item => item.purchasePrice);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    return { totalAssets, totalItems, dailyAverage, maxPrice, minPrice };
  }, [filteredItems]);

  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [items]);

  const channels = useMemo(() => {
    const chans = new Set(items.map(item => item.purchaseChannel).filter(Boolean));
    return ['all', ...Array.from(chans)];
  }, [items]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">数据看板</h1>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">时间范围：</span>
            <div className="flex space-x-1">
              {(['all', 'month', 'quarter', 'year'] as TimeRange[]).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'all' ? '全部' : range === 'month' ? '近1月' : range === 'quarter' ? '近3月' : '近1年'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">分类：</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-border rounded-md px-3 py-1 text-sm bg-background"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '全部' : cat || '未分类'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">渠道：</span>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="border border-border rounded-md px-3 py-1 text-sm bg-background"
            >
              {channels.map(chan => (
                <option key={chan} value={chan}>
                  {chan === 'all' ? '全部' : chan || '未填写'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">总资产</p>
          <p className="text-2xl font-bold">¥ {stats.totalAssets.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">日均消费</p>
          <p className="text-2xl font-bold">¥ {stats.dailyAverage.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">最高价格</p>
          <p className="text-2xl font-bold">¥ {stats.maxPrice.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">最低价格</p>
          <p className="text-2xl font-bold">¥ {stats.minPrice.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">物品总数</p>
          <p className="text-2xl font-bold">{stats.totalItems}</p>
        </div>
      </div>

      <DashboardCharts items={filteredItems} />
    </div>
  );
}