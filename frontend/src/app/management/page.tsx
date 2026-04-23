'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getAllItems, deleteItem, getSettings } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';
import { sortItems, SortField, getNextSortOrder } from '@/lib/utils/pinyin';

export default function ManagementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [swipedItem, setSwipedItem] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const swipeStartX = useRef<Record<string, number>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getAllItems();
      const settings = await getSettings();
      setItems(allItems);
      setSortField(settings.fieldSettings.listSortField as SortField);
      setSortOrder(settings.fieldSettings.listSortOrder);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(getNextSortOrder(sortOrder));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchTerm) {
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }

    if (filterChannel !== 'all') {
      result = result.filter(item => item.purchaseChannel === filterChannel);
    }

    if (filterCondition !== 'all') {
      result = result.filter(item => item.condition === filterCondition);
    }

    return sortItems(result, sortField, sortOrder);
  }, [items, searchTerm, sortField, sortOrder, filterCategory, filterChannel, filterCondition]);

  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [items]);

  const channels = useMemo(() => {
    const chans = new Set(items.map(item => item.purchaseChannel).filter(Boolean));
    return ['all', ...Array.from(chans)];
  }, [items]);

  const conditions = useMemo(() => {
    const conds = new Set(items.map(item => item.condition).filter(Boolean));
    return ['all', ...Array.from(conds)];
  }, [items]);

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(`确定要删除选中的 ${selectedItems.size} 个物品吗？此操作不可撤销。`);
    if (!confirmed) return;

    try {
      for (const id of selectedItems) {
        await deleteItem(id);
      }
      setSelectedItems(new Set());
      await loadItems();
    } catch (error) {
      console.error('Failed to delete items:', error);
      alert('删除失败');
    }
  };

  const handleSwipeDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setSwipedItem(null);
      await loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    const touch = e.touches[0];
    swipeStartX.current[itemId] = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: string) => {
    if (!swipeStartX.current[itemId]) return;
    const touch = e.touches[0];
    const diff = touch.clientX - swipeStartX.current[itemId];

    if (diff < -50) {
      setSwipedItem(itemId);
    } else if (diff > 50) {
      setSwipedItem(null);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

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
        <h1 className="text-2xl font-bold">数据管理</h1>
        {selectedItems.size > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            删除选中 ({selectedItems.size})
          </Button>
        )}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="搜索物品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="all">全部分类</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat || '未分类'}</option>
              ))}
            </select>

            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="all">全部渠道</option>
              {channels.filter(c => c !== 'all').map(chan => (
                <option key={chan} value={chan}>{chan || '未填写'}</option>
              ))}
            </select>

            <select
              value={filterCondition}
              onChange={e => setFilterCondition(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="all">全部成色</option>
              {conditions.filter(c => c !== 'all').map(cond => (
                <option key={cond} value={cond}>{cond || '未填写'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          共 {filteredAndSortedItems.length} 个物品
          {selectedItems.size > 0 && `，已选中 ${selectedItems.size} 个`}
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-border">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden ${swipedItem === item.id ? 'translate-x-[-100px]' : ''} transition-transform duration-200`}
              onTouchStart={(e) => handleTouchStart(e, item.id)}
              onTouchMove={(e) => handleTouchMove(e, item.id)}
            >
              <div
                className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-red-600 active:bg-red-700"
                onClick={() => handleSwipeDelete(item.id)}
              >
                删除
              </div>

              <div className="p-4 bg-background flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="rounded border-border text-primary focus:ring-primary w-5 h-5 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.category && (
                      <span className="badge bg-secondary text-secondary-foreground text-xs">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {item.brand} {item.model}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-medium">¥ {item.purchasePrice.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const confirmed = window.confirm(`确定要删除 "${item.name}" 吗？`);
                      if (confirmed) handleSwipeDelete(item.id);
                    }}
                  >
                    <i className="fa fa-trash text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredAndSortedItems.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <i className="fa fa-inbox text-4xl mb-4" />
              <p>没有找到匹配的物品</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}