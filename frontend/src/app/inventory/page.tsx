'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemCard } from '@/components/feature/ItemCard';
import { SortableHeader } from '@/components/feature/SortableHeader';
import { FieldSettings } from '@/components/feature/FieldSettings';
import { getAllItems, getSettings } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';
import { sortItems, SortField, getNextSortOrder } from '@/lib/utils/pinyin';

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFieldSettings, setShowFieldSettings] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const allItems = await getAllItems();
        const settings = await getSettings();
        setItems(allItems);
        setFilteredItems(allItems);
        setViewMode(settings.defaultView);
        setSortField(settings.fieldSettings.listSortField as SortField);
        setSortOrder(settings.fieldSettings.listSortOrder);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(getNextSortOrder(sortOrder));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredItems = useMemo(() => {
    let result = [...filteredItems];

    if (searchTerm) {
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sortItems(result, sortField, sortOrder);
  }, [filteredItems, searchTerm, sortField, sortOrder]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">器材库</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="搜索物品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFieldSettings(true)}
            className="rounded-md"
          >
            <i className="fa fa-cog mr-2" />
            字段
          </Button>
          <div className="flex items-center space-x-1 border border-border rounded-md p-1 bg-secondary">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-md"
            >
              <i className="fa fa-th" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-md"
            >
              <i className="fa fa-list" />
            </Button>
          </div>
        </div>
      </div>

      <FieldSettings
        isOpen={showFieldSettings}
        onClose={() => setShowFieldSettings(false)}
        onSave={() => {}}
      />

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAndFilteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {sortedAndFilteredItems.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <i className="fa fa-search text-4xl mb-4" />
              <p>没有找到匹配的物品</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <SortableHeader
                    field="name"
                    label="物品"
                    currentSortField={sortField}
                    currentSortOrder={sortField === 'name' ? sortOrder : null}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="brand"
                    label="品牌型号"
                    currentSortField={sortField}
                    currentSortOrder={sortField === 'brand' ? sortOrder : null}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="purchasePrice"
                    label="价格"
                    currentSortField={sortField}
                    currentSortOrder={sortField === 'purchasePrice' ? sortOrder : null}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="purchaseDate"
                    label="购买日期"
                    currentSortField={sortField}
                    currentSortOrder={sortField === 'purchaseDate' ? sortOrder : null}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="warrantyDeadline"
                    label="保修截止"
                    currentSortField={sortField}
                    currentSortOrder={sortField === 'warrantyDeadline' ? sortOrder : null}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {sortedAndFilteredItems.map((item) => {
                  const now = Date.now();
                  const isExpiring = item.warrantyDeadline - now < 30 * 24 * 60 * 60 * 1000;
                  const isExpired = item.warrantyDeadline < now;

                  let statusBadge = (
                    <span className="badge bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      保修中
                    </span>
                  );

                  if (isExpiring) {
                    statusBadge = (
                      <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        即将到期
                      </span>
                    );
                  } else if (isExpired) {
                    statusBadge = (
                      <span className="badge bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        已过保
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center mr-3">
                            <i className="fa fa-camera text-muted-foreground" />
                          </div>
                          <div className="font-medium">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.brand} {item.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ¥ {item.purchasePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })}
                {sortedAndFilteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <i className="fa fa-search text-4xl mb-4" />
                      <p>没有找到匹配的物品</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}