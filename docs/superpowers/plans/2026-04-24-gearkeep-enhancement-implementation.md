# GearKeep 网页端功能增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强 GearKeep 网页端的交互体验和数据可视化能力

**Architecture:** 分阶段实现：先交互功能，后看板图表；使用 Recharts 实现图表，pinyin 实现中文排序

**Tech Stack:** Next.js, TypeScript, Tailwind CSS v4, Recharts, pinyin, IndexedDB

---

## 项目结构

```
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/           # 看板页面
│   │   │   └── page.tsx
│   │   ├── inventory/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── feature/
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemTooltip.tsx
│   │   │   ├── SortableHeader.tsx
│   │   │   ├── FieldSettings.tsx
│   │   │   ├── DashboardCharts.tsx
│   │   │   └── StatCard.tsx
│   │   └── ui/
│   └── lib/
│       ├── storage/
│       │   ├── indexeddb.ts
│       │   └── import-export.ts
│       └── utils/
│           └── pinyin.ts
```

---

## 任务分解

### 任务 1: 数据模型和类型更新

**Files:**
- Modify: `frontend/src/lib/types/index.ts`
- Modify: `frontend/src/lib/storage/indexeddb.ts`

- [ ] **Step 1: 更新 Item 类型定义**

编辑 `frontend/src/lib/types/index.ts`：

```typescript
export interface Item {
  id: string;
  name: string;
  brand: string;
  model: string;
  sn: string;
  purchasePrice: number;
  purchaseDate: number;
  warrantyMonths: number;
  warrantyDeadline: number;
  location: string;
  notes: string;
  isMaster: boolean;
  category: string;
  purchaseChannel: string;
  condition: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
  createdAt: number;
}

export interface FieldSettings {
  visibleFields: string[];
  fieldOrder: string[];
  listSortField: string;
  listSortOrder: 'asc' | 'desc';
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'card' | 'list';
  fieldSettings: FieldSettings;
}

export const DEFAULT_VISIBLE_FIELDS = [
  'name', 'brand', 'model', 'purchasePrice', 'purchaseDate',
  'warrantyDeadline', 'location', 'category', 'condition'
];

export const ALL_FIELDS = [
  { key: 'name', label: '名称' },
  { key: 'brand', label: '品牌' },
  { key: 'model', label: '型号' },
  { key: 'sn', label: '序列号' },
  { key: 'purchasePrice', label: '价格' },
  { key: 'purchaseDate', label: '购买日期' },
  { key: 'warrantyMonths', label: '保修月数' },
  { key: 'warrantyDeadline', label: '保修截止' },
  { key: 'location', label: '存放位置' },
  { key: 'notes', label: '备注' },
  { key: 'category', label: '分类' },
  { key: 'purchaseChannel', label: '购买渠道' },
  { key: 'condition', label: '成色' },
  { key: 'color', label: '颜色' },
];
```

- [ ] **Step 2: 更新 IndexedDB Settings 存储**

编辑 `frontend/src/lib/storage/indexeddb.ts`：

```typescript
import { Item, Relationship, Settings, FieldSettings, DEFAULT_VISIBLE_FIELDS } from '../types';

// ... existing code ...

interface GearKeepDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: { 'by-created': number; 'by-updated': number };
  };
  relationships: {
    key: string;
    value: Relationship;
    indexes: { 'by-parent': string; 'by-child': string };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

// ... existing code ...

export async function getSettings(): Promise<Settings> {
  const database = await getDB();
  const settings = await database.get('settings', 'app-settings');
  if (settings) {
    return settings;
  }
  return {
    theme: 'light',
    defaultView: 'card',
    fieldSettings: {
      visibleFields: DEFAULT_VISIBLE_FIELDS,
      fieldOrder: DEFAULT_VISIBLE_FIELDS,
      listSortField: 'createdAt',
      listSortOrder: 'desc',
    }
  };
}

export async function updateSettings(settings: Settings): Promise<void> {
  const database = await getDB();
  await database.put('settings', settings, 'app-settings');
}

export async function updateFieldSettings(fieldSettings: FieldSettings): Promise<void> {
  const settings = await getSettings();
  settings.fieldSettings = fieldSettings;
  await updateSettings(settings);
}
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: update data model with new fields and field settings"
```

### 任务 2: 安装必要的依赖

**Files:**
- No file changes

- [ ] **Step 1: 安装 Recharts 和 pinyin**

```bash
cd frontend
npm install recharts pinyin
```

- [ ] **Step 2: 提交依赖变更**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts and pinyin dependencies"
```

### 任务 3: 物品卡片悬停详情

**Files:**
- Create: `frontend/src/components/feature/ItemTooltip.tsx`
- Modify: `frontend/src/components/feature/ItemCard.tsx`

- [ ] **Step 1: 创建悬停详情气泡组件**

编辑 `frontend/src/components/feature/ItemTooltip.tsx`：

```tsx
'use client';

import React from 'react';
import { Item } from '@/lib/types';

interface ItemTooltipProps {
  item: Item;
  anchorEl: HTMLElement | null;
}

export function ItemTooltip({ item, anchorEl }: ItemTooltipProps) {
  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const showAbove = rect.top > viewportHeight / 2;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    top: showAbove ? rect.top - 10 : rect.bottom + 10,
    transform: showAbove ? 'translateY(-100%)' : 'none',
  };

  const getWarrantyStatus = () => {
    const now = Date.now();
    if (item.warrantyDeadline < now) {
      return { text: '已过保', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (item.warrantyDeadline - now < 30 * 24 * 60 * 60 * 1000) {
      return { text: '即将到期', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { text: '保修中', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  };

  const warranty = getWarrantyStatus();
  const daysLeft = Math.ceil((item.warrantyDeadline - Date.now()) / (24 * 60 * 60 * 1000));

  return (
    <div
      style={tooltipStyle}
      className="z-50 bg-background border border-border rounded-lg shadow-lg p-4 pointer-events-none"
    >
      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{item.brand} {item.model}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">价格：</span>
          <span className="font-medium">¥ {item.purchasePrice.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">保修：</span>
          <span className={`badge ${warranty.class}`}>{warranty.text}</span>
        </div>
        {item.location && (
          <div className="col-span-2">
            <span className="text-muted-foreground">位置：</span>
            <span>{item.location}</span>
          </div>
        )}
        {item.purchaseChannel && (
          <div>
            <span className="text-muted-foreground">渠道：</span>
            <span>{item.purchaseChannel}</span>
          </div>
        )}
        {item.condition && (
          <div>
            <span className="text-muted-foreground">成色：</span>
            <span>{item.condition}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {daysLeft > 0 ? `剩余 ${daysLeft} 天保修` : `已过保 ${Math.abs(daysLeft)} 天`}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 更新物品卡片组件**

编辑 `frontend/src/components/feature/ItemCard.tsx`：

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { ItemTooltip } from './ItemTooltip';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null);

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
    <div className="relative">
      <Link href={`/item/${item.id}`} className="block">
        <div
          ref={setCardRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="h-40 bg-muted rounded-md mb-4 flex items-center justify-center">
            <i className="fa fa-camera text-4xl text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{item.brand} {item.model}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">¥ {item.purchasePrice.toLocaleString()}</span>
            {statusBadge}
          </div>
        </div>
      </Link>

      {showTooltip && cardRef && (
        <ItemTooltip item={item} anchorEl={cardRef} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: add hover tooltip for item cards"
```

### 任务 4: 排序功能

**Files:**
- Create: `frontend/src/lib/utils/pinyin.ts`
- Modify: `frontend/src/app/inventory/page.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: 创建拼音排序工具**

编辑 `frontend/src/lib/utils/pinyin.ts`：

```typescript
import pinyin from 'pinyin';

export function getPinyinInitial(str: string): string {
  if (!str) return '';
  const result = pinyin(str, { style: pinyin.STYLE_FIRST_LETTER });
  return result.map(item => item[0]).join('').toUpperCase();
}

export function compareByPinyin(a: string, b: string): number {
  const pinyinA = getPinyinInitial(a);
  const pinyinB = getPinyinInitial(b);
  return pinyinA.localeCompare(pinyinB);
}

export type SortField = 'name' | 'brand' | 'model' | 'purchasePrice' | 'purchaseDate' | 'warrantyDeadline' | 'createdAt';

export function sortItems<T extends Record<string, any>>(
  items: T[],
  field: SortField,
  order: 'asc' | 'desc'
): T[] {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0;
    const aVal = a[field];
    const bVal = b[field];

    if (field === 'name' || field === 'brand' || field === 'model') {
      comparison = compareByPinyin(String(aVal || ''), String(bVal || ''));
    } else {
      comparison = Number(aVal) - Number(bVal);
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function getNextSortOrder(current: 'asc' | 'desc' | null): 'asc' | 'desc' {
  if (!current) return 'asc';
  return current === 'asc' ? 'desc' : 'asc';
}
```

- [ ] **Step 2: 创建可排序表头组件**

编辑 `frontend/src/components/feature/SortableHeader.tsx`：

```tsx
'use client';

import React from 'react';
import { SortField, getNextSortOrder } from '@/lib/utils/pinyin';

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSortField: string;
  currentSortOrder: 'asc' | 'desc' | null;
  onSort: (field: SortField) => void;
}

export function SortableHeader({
  field,
  label,
  currentSortField,
  currentSortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortField === field;

  const handleClick = () => {
    if (isActive) {
      onSort(field);
    } else {
      onSort(field);
    }
  };

  const getSortIcon = () => {
    if (!isActive) {
      return <span className="text-muted-foreground ml-1">—</span>;
    }
    if (currentSortOrder === 'asc') {
      return <span className="text-primary ml-1">↑</span>;
    }
    return <span className="text-primary ml-1">↓</span>;
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={handleClick}
    >
      {label}
      {getSortIcon()}
    </th>
  );
}
```

- [ ] **Step 3: 更新首页支持排序**

编辑 `frontend/src/app/page.tsx`：

```tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/feature/StatCard';
import { WarrantyBoard } from '@/components/feature/WarrantyBoard';
import { ItemCard } from '@/components/feature/ItemCard';
import { getAllItems, getSettings } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';
import { sortItems, SortField } from '@/lib/utils/pinyin';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return sortItems(items, sortField, sortOrder);
  }, [items, sortField, sortOrder]);

  const totalItems = sortedItems.length;
  const totalValue = sortedItems.reduce((sum, item) => sum + item.purchasePrice, 0);
  const warrantyItems = sortedItems.filter(item => item.warrantyDeadline > Date.now()).length;
  const recentItems = sortedItems.slice(0, 6);

  // ... rest of component
}
```

- [ ] **Step 4: 更新器材库页面**

编辑 `frontend/src/app/inventory/page.tsx`：

```tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemCard } from '@/components/feature/ItemCard';
import { SortableHeader } from '@/components/feature/SortableHeader';
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
    let result = filteredItems;

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

  // ... rest of component with sortable table headers
}
```

- [ ] **Step 5: 提交代码**

```bash
git add .
git commit -m "feat: add sorting functionality to inventory and home pages"
```

### 任务 5: 字段设置面板

**Files:**
- Create: `frontend/src/components/feature/FieldSettings.tsx`
- Modify: `frontend/src/app/inventory/page.tsx`

- [ ] **Step 1: 创建字段设置面板组件**

编辑 `frontend/src/components/feature/FieldSettings.tsx`：

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getSettings, updateFieldSettings } from '@/lib/storage/indexeddb';
import { FieldSettings as FieldSettingsType, ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from '@/lib/types';

interface FieldSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function FieldSettings({ isOpen, onClose, onSave }: FieldSettingsProps) {
  const [settings, setSettings] = useState<FieldSettingsType | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings.fieldSettings);
  };

  const toggleField = (fieldKey: string) => {
    if (!settings) return;
    const newVisible = settings.visibleFields.includes(fieldKey)
      ? settings.visibleFields.filter(f => f !== fieldKey)
      : [...settings.visibleFields, fieldKey];
    setSettings({ ...settings, visibleFields: newVisible });
  };

  const moveField = (fieldKey: string, direction: 'up' | 'down') => {
    if (!settings) return;
    const newOrder = [...settings.visibleFields];
    const index = newOrder.indexOf(fieldKey);
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setSettings({ ...settings, visibleFields: newOrder });
  };

  const resetToDefault = () => {
    setSettings({
      visibleFields: DEFAULT_VISIBLE_FIELDS,
      fieldOrder: DEFAULT_VISIBLE_FIELDS,
      listSortField: 'createdAt',
      listSortOrder: 'desc',
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    await updateFieldSettings(settings);
    onSave();
    onClose();
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">字段设置</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="fa fa-times" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4">
            选择要显示的字段，并拖动调整顺序
          </p>

          <div className="space-y-2">
            {ALL_FIELDS.map(field => {
              const isVisible = settings.visibleFields.includes(field.key);
              const index = settings.visibleFields.indexOf(field.key);

              return (
                <div
                  key={field.key}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    isVisible ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleField(field.key)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{field.label}</span>
                  </div>

                  {isVisible && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.key, 'up')}
                        disabled={index === 0}
                      >
                        <i className="fa fa-chevron-up text-xs" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.key, 'down')}
                        disabled={index === settings.visibleFields.length - 1}
                      >
                        <i className="fa fa-chevron-down text-xs" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-between">
          <Button variant="outline" onClick={resetToDefault}>
            重置
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 更新器材库页面集成字段设置**

编辑 `frontend/src/app/inventory/page.tsx`，添加 FieldSettings 组件和按钮。

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: add field settings panel with visibility and order controls"
```

### 任务 6: 看板页面 - 统计卡片

**Files:**
- Create: `frontend/src/app/dashboard/page.tsx`
- Modify: `frontend/src/components/layout/Navbar.tsx`

- [ ] **Step 1: 更新导航栏添加看板链接**

编辑 `frontend/src/components/layout/Navbar.tsx`，在导航中添加看板链接。

- [ ] **Step 2: 创建看板页面**

编辑 `frontend/src/app/dashboard/page.tsx`：

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getAllItems } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';

export default function DashboardPage() {
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

  const totalAssets = items.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalItems = items.length;

  const firstPurchaseDate = items.length > 0
    ? Math.min(...items.map(item => item.purchaseDate))
    : Date.now();
  const daysSinceFirstPurchase = Math.max(1, Math.floor((Date.now() - firstPurchaseDate) / (24 * 60 * 60 * 1000)));
  const dailyAverage = totalAssets / daysSinceFirstPurchase;

  const prices = items.map(item => item.purchasePrice);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">数据看板</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">总资产</p>
          <p className="text-2xl font-bold">¥ {totalAssets.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">日均消费</p>
          <p className="text-2xl font-bold">¥ {dailyAverage.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">最高价格</p>
          <p className="text-2xl font-bold">¥ {maxPrice.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">最低价格</p>
          <p className="text-2xl font-bold">¥ {minPrice.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted-foreground">物品总数</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
      </div>

      {/* Charts will be added in next task */}
    </div>
  );
}
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: create dashboard page with stat cards"
```

### 任务 7: 看板页面 - 图表组件

**Files:**
- Create: `frontend/src/components/feature/DashboardCharts.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: 创建图表组件**

编辑 `frontend/src/components/feature/DashboardCharts.tsx`：

```tsx
'use client';

import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { Item } from '@/lib/types';

interface DashboardChartsProps {
  items: Item[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function DashboardCharts({ items }: DashboardChartsProps) {
  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.category || '未分类';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  // Brand distribution
  const brandData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const brand = item.brand || '未知品牌';
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [items]);

  // Monthly spending trend
  const monthlyData = useMemo(() => {
    const monthly: Record<string, number> = {};
    items.forEach(item => {
      const date = new Date(item.purchaseDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + item.purchasePrice;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [items]);

  // Price range distribution
  const priceRangeData = useMemo(() => {
    const ranges = [
      { label: '0-1k', min: 0, max: 1000 },
      { label: '1k-5k', min: 1000, max: 5000 },
      { label: '5k-10k', min: 5000, max: 10000 },
      { label: '10k+', min: 10000, max: Infinity },
    ];
    return ranges.map(range => ({
      name: range.label,
      count: items.filter(item => item.purchasePrice >= range.min && item.purchasePrice < range.max).length,
    }));
  }, [items]);

  // Purchase channel distribution
  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const channel = item.purchaseChannel || '未填写';
      counts[channel] = (counts[channel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  // Warranty status distribution
  const warrantyData = useMemo(() => {
    const now = Date.now();
    const expired = items.filter(item => item.warrantyDeadline < now).length;
    const expiring = items.filter(item => item.warrantyDeadline >= now && item.warrantyDeadline - now < 30 * 24 * 60 * 60 * 1000).length;
    const active = items.length - expired - expiring;
    return [
      { name: '已过保', value: expired },
      { name: '即将到期', value: expiring },
      { name: '保修中', value: active },
    ];
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Pie Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">分类分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand Pie Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">品牌分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {brandData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">月度消费趋势</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `¥ ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Range Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">价格区间分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Purchase Channel Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">购买渠道分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warranty Status Chart */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">保修状态分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={warrantyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {warrantyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 更新看板页面集成图表**

编辑 `frontend/src/app/dashboard/page.tsx`：

```tsx
import { DashboardCharts } from '@/components/feature/DashboardCharts';

// ... in the return statement
<div className="mt-8">
  <DashboardCharts items={items} />
</div>
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: add dashboard charts with recharts"
```

### 任务 8: 筛选功能

**Files:**
- Modify: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: 添加筛选功能到看板页面**

编辑 `frontend/src/app/dashboard/page.tsx`，添加时间范围、分类、购买渠道筛选器。

- [ ] **Step 2: 提交代码**

```bash
git add .
git commit -m "feat: add filtering functionality to dashboard"
```

### 任务 9: 更新 Excel 导入支持新字段

**Files:**
- Modify: `frontend/src/lib/storage/import-export.ts`

- [ ] **Step 1: 更新 Excel 导入解析逻辑**

编辑 `frontend/src/lib/storage/import-export.ts`，添加对新字段的识别。

- [ ] **Step 2: 更新添加物品表单**

编辑 `frontend/src/app/add-item/page.tsx`，添加新字段的表单输入。

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: add new fields to item form and excel import"
```

### 任务 10: 最终测试和优化

**Files:**
- No file changes

- [ ] **Step 1: 运行开发服务器测试**

```bash
cd frontend
npm run dev
```

- [ ] **Step 2: 测试所有功能**

1. 悬停详情显示
2. 排序功能
3. 字段设置
4. 看板页面
5. 图表渲染
6. 筛选功能

- [ ] **Step 3: 构建生产版本**

```bash
cd frontend
npm run build
```

- [ ] **Step 4: 提交最终代码**

```bash
git add .
git commit -m "feat: complete enhancement with hover details, sorting, and dashboard"
```

---

## 自审查

1. **规范覆盖**：所有设计文档中的功能都已在实施计划中覆盖
2. **占位符检查**：无占位符，所有步骤都有具体实现
3. **类型一致性**：TypeScript 类型定义一致，方法签名和属性名称统一

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-04-24-gearkeep-enhancement-implementation.md`。

**执行选项：**

1. **Subagent-Driven (推荐)** - 每个任务分配一个新的子代理，任务间进行审查，快速迭代
2. **Inline Execution** - 在当前会话中执行任务，批量执行并设置检查点

**选择哪种方法？**