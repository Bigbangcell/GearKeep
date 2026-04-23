'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/feature/StatCard';
import { WarrantyBoard } from '@/components/feature/WarrantyBoard';
import { ItemCard } from '@/components/feature/ItemCard';
import { getAllItems } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.purchasePrice, 0);
  const warrantyItems = items.filter(item => item.warrantyDeadline > Date.now()).length;
  const recentItems = items
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="总物品数"
          value={totalItems}
          icon={<i className="fa fa-cubes text-primary text-xl" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="总资产价值"
          value={`¥ ${totalValue.toLocaleString()}`}
          icon={<i className="fa fa-money text-green-600 text-xl" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="保修中物品"
          value={warrantyItems}
          icon={<i className="fa fa-shield text-purple-600 text-xl" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      <WarrantyBoard items={items} />

      <div className="card mt-8">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold">最近添加</h2>
          <Link href="/inventory" className="text-primary text-sm hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {recentItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <i className="fa fa-inbox text-4xl mb-4" />
              <p>还没有添加任何物品</p>
              <Link href="/add-item" className="text-primary hover:underline mt-2 inline-block">
                添加第一个物品
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}