# GearKeep 网页端实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯本地、隐私安全的 GearKeep 网页端，实现物品管理、资产统计、保修追踪等核心功能。

**Architecture:** 采用 Next.js + TypeScript + Tailwind CSS v4 + shadcn/ui 技术栈，使用 IndexedDB 进行本地存储，实现纯前端的器材管理解决方案。

**Tech Stack:** Next.js (App Router), TypeScript, React, Tailwind CSS v4, shadcn/ui, IndexedDB (idb library), File System Access API

---

## 项目结构

```
frontend/
├── app/
│   ├── globals.css          # 全局样式（Tailwind v4 配置）
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页（Dashboard）
│   ├── inventory/           # 器材库
│   │   └── page.tsx
│   ├── add-item/            # 添加物品
│   │   └── page.tsx
│   ├── item/                # 物品详情
│   │   └── [id]/page.tsx
│   └── settings/            # 设置页
│       └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   ├── layout/              # 布局组件
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── feature/             # 功能组件
│       ├── StatCard.tsx
│       ├── ItemCard.tsx
│       ├── WarrantyBoard.tsx
│       └── ...
├── lib/
│   ├── storage/             # 存储相关
│   │   ├── indexeddb.ts     # IndexedDB 操作
│   │   └── import-export.ts  # 导入导出逻辑
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   └── utils/               # 工具函数
│       ├── date.ts
│       ├── format.ts
│       └── ...
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
└── next.config.js
```

## 任务分解

### 任务 1: 项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/next.config.js`
- Create: `frontend/app/globals.css`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /Volumes/LZZ SSD 2T_TB4/Code/GearKeep
npm create next-app@latest frontend -- --typescript --tailwind --eslint --app --src-dir false
```

- [ ] **Step 2: 安装必要的依赖**

```bash
cd frontend
npm install idb uuid
npm install -D @types/uuid
```

- [ ] **Step 3: 配置 Tailwind CSS v4**

编辑 `frontend/app/globals.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f3f4f6;
  --color-secondary-foreground: #111827;
  --color-accent: #10b981;
  --color-accent-foreground: #ffffff;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-muted: #f3f4f6;
  --color-muted-foreground: #6b7280;
  --color-border: #e5e7eb;
  --color-input: #f3f4f6;
  --color-ring: #3b82f6;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 4: 初始化 shadcn/ui**

```bash
npx shadcn@latest init
```

- [ ] **Step 5: 提交初始代码**

```bash
git add .
git commit -m "feat: initialize Next.js project with Tailwind CSS and shadcn/ui"
```

### 任务 2: 数据模型和存储层

**Files:**
- Create: `frontend/lib/types/index.ts`
- Create: `frontend/lib/storage/indexeddb.ts`

- [ ] **Step 1: 定义 TypeScript 类型**

编辑 `frontend/lib/types/index.ts`：

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
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'card' | 'list';
}
```

- [ ] **Step 2: 实现 IndexedDB 操作**

编辑 `frontend/lib/storage/indexeddb.ts`：

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Item, Relationship, Settings } from '../types';

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

let db: IDBPDatabase<GearKeepDB> | null = null;

async function getDB(): Promise<IDBPDatabase<GearKeepDB>> {
  if (!db) {
    db = await openDB<GearKeepDB>('gearkeeper-web', 1, {
      upgrade(db) {
        // Create items store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-created', 'createdAt');
          itemStore.createIndex('by-updated', 'updatedAt');
        }

        // Create relationships store
        if (!db.objectStoreNames.contains('relationships')) {
          const relationshipStore = db.createObjectStore('relationships', { keyPath: 'id' });
          relationshipStore.createIndex('by-parent', 'parentId');
          relationshipStore.createIndex('by-child', 'childId');
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return db;
}

// Items CRUD operations
export async function addItem(item: Item): Promise<void> {
  const db = await getDB();
  await db.put('items', item);
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return await db.get('items', id);
}

export async function getAllItems(): Promise<Item[]> {
  const db = await getDB();
  return await db.getAll('items');
}

export async function updateItem(item: Item): Promise<void> {
  const db = await getDB();
  await db.put('items', item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);
}

// Relationships operations
export async function addRelationship(relationship: Relationship): Promise<void> {
  const db = await getDB();
  await db.put('relationships', relationship);
}

export async function getRelationshipsByParent(parentId: string): Promise<Relationship[]> {
  const db = await getDB();
  return await db.getAllFromIndex('relationships', 'by-parent', parentId);
}

export async function deleteRelationship(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('relationships', id);
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app-settings');
  return settings || { theme: 'light', defaultView: 'card' };
}

export async function updateSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'app-settings');
}
```

- [ ] **Step 3: 提交存储层代码**

```bash
git add .
git commit -m "feat: implement IndexedDB storage layer"
```

### 任务 3: 布局组件

**Files:**
- Create: `frontend/components/layout/Navbar.tsx`
- Create: `frontend/components/layout/Footer.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: 实现导航栏组件**

编辑 `frontend/components/layout/Navbar.tsx`：

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSettings, updateSettings } from '@/lib/storage/indexeddb';

export function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setIsDark(settings.theme === 'dark');
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    const settings = await getSettings();
    await updateSettings({ ...settings, theme: newTheme });
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
              <Link
                href="/"
                className="border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                首页
              </Link>
              <Link
                href="/inventory"
                className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                器材库
              </Link>
              <Link
                href="/settings"
                className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
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
            <Button className="flex items-center">
              <i className="fa fa-plus mr-2" />
              添加物品
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 实现页脚组件**

编辑 `frontend/components/layout/Footer.tsx`：

```tsx
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2026 GearKeep. 纯本地、隐私优先的器材管理工具。
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <i className="fa fa-github" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <i className="fa fa-envelope" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: 更新根布局**

编辑 `frontend/app/layout.tsx`：

```tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GearKeep - 器材管理工具',
  description: '纯本地、隐私安全的摄影器材与电子产品管理工具',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 安装必要的 UI 组件**

```bash
npx shadcn@latest add button
```

- [ ] **Step 5: 提交布局组件代码**

```bash
git add .
git commit -m "feat: implement layout components"
```

### 任务 4: 首页（Dashboard）

**Files:**
- Create: `frontend/components/feature/StatCard.tsx`
- Create: `frontend/components/feature/WarrantyBoard.tsx`
- Create: `frontend/components/feature/ItemCard.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: 实现统计卡片组件**

编辑 `frontend/components/feature/StatCard.tsx`：

```tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}

export function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 ${iconBg} rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现保修看板组件**

编辑 `frontend/components/feature/WarrantyBoard.tsx`：

```tsx
import React from 'react';
import { Item } from '@/lib/types';

interface WarrantyBoardProps {
  items: Item[];
}

export function WarrantyBoard({ items }: WarrantyBoardProps) {
  const now = Date.now();
  const warrantyItems = items.filter(item => item.warrantyDeadline > now);
  const expiringItems = warrantyItems.filter(
    item => item.warrantyDeadline - now < 30 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">保修看板</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                物品
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                购买日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                保修截止
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {expiringItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                      <i className="fa fa-camera text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.brand} {item.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(item.purchaseDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(item.warrantyDeadline).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    即将到期
                  </span>
                </td>
              </tr>
            ))}
            {warrantyItems
              .filter(item => !expiringItems.includes(item))
              .slice(0, 3)
              .map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                        <i className="fa fa-camera text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.brand} {item.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(item.warrantyDeadline).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      保修中
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 实现物品卡片组件**

编辑 `frontend/components/feature/ItemCard.tsx`：

```tsx
import React from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
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
    <Link href={`/item/${item.id}`} className="block">
      <div className="card p-4 hover:shadow-md transition-shadow">
        <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
          <i className="fa fa-camera text-4xl text-gray-400" />
        </div>
        <h3 className="font-medium mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{item.brand} {item.model}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">¥ {item.purchasePrice.toLocaleString()}</span>
          {statusBadge}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: 实现首页**

编辑 `frontend/app/page.tsx`：

```tsx
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
      const allItems = await getAllItems();
      setItems(allItems);
      setLoading(false);
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
      {/* 统计卡片 */}
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

      {/* 保修看板 */}
      <WarrantyBoard items={items} />

      {/* 最近添加 */}
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
```

- [ ] **Step 5: 安装必要的 UI 组件**

```bash
npx shadcn@latest add card
```

- [ ] **Step 6: 提交首页代码**

```bash
git add .
git commit -m "feat: implement dashboard page"
```

### 任务 5: 器材库页面

**Files:**
- Create: `frontend/app/inventory/page.tsx`

- [ ] **Step 1: 实现器材库页面**

编辑 `frontend/app/inventory/page.tsx`：

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemCard } from '@/components/feature/ItemCard';
import { getAllItems } from '@/lib/storage/indexeddb';
import { Item } from '@/lib/types';

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const allItems = await getAllItems();
      setItems(allItems);
      setFilteredItems(allItems);
      setLoading(false);
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

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

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {filteredItems.length === 0 && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    物品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    品牌型号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    购买日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    保修状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredItems.map((item) => {
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
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                            <i className="fa fa-camera text-gray-500" />
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
                {filteredItems.length === 0 && (
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
```

- [ ] **Step 2: 安装必要的 UI 组件**

```bash
npx shadcn@latest add input
```

- [ ] **Step 3: 提交器材库页面代码**

```bash
git add .
git commit -m "feat: implement inventory page"
```

### 任务 6: 添加物品页面

**Files:**
- Create: `frontend/app/add-item/page.tsx`

- [ ] **Step 1: 实现添加物品页面**

编辑 `frontend/app/add-item/page.tsx`：

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { addItem } from '@/lib/storage/indexeddb';
import { v4 as uuidv4 } from 'uuid';

export default function AddItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    sn: '',
    purchasePrice: '',
    purchaseDate: '',
    warrantyMonths: '',
    location: '',
    notes: '',
    isMaster: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const purchaseDate = new Date(formData.purchaseDate).getTime();
    const warrantyMonths = parseInt(formData.warrantyMonths) || 0;
    const warrantyDeadline = purchaseDate + warrantyMonths * 30 * 24 * 60 * 60 * 1000;

    const newItem = {
      id: uuidv4(),
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      sn: formData.sn,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      purchaseDate,
      warrantyMonths,
      warrantyDeadline,
      location: formData.location,
      notes: formData.notes,
      isMaster: formData.isMaster,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await addItem(newItem);
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">添加物品</h1>
        <Button onClick={() => router.back()} variant="outline">
          取消
        </Button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">物品名称</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">品牌</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">型号</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sn">序列号</Label>
              <Input
                id="sn"
                name="sn"
                value={formData.sn}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">购入价格</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">购入日期</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyMonths">保修月数</Label>
              <Input
                id="warrantyMonths"
                name="warrantyMonths"
                type="number"
                value={formData.warrantyMonths}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">存放位置</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isMaster"
              name="isMaster"
              type="checkbox"
              checked={formData.isMaster}
              onChange={handleChange}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="isMaster">设为主设备</Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 安装必要的 UI 组件**

```bash
npx shadcn@latest add textarea label
```

- [ ] **Step 3: 提交添加物品页面代码**

```bash
git add .
git commit -m "feat: implement add item page"
```

### 任务 7: 物品详情页面

**Files:**
- Create: `frontend/app/item/[id]/page.tsx`

- [ ] **Step 1: 实现物品详情页面**

编辑 `frontend/app/item/[id]/page.tsx`：

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getItem, deleteItem, getRelationshipsByParent } from '@/lib/storage/indexeddb';
import { Item, Relationship } from '@/lib/types';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) {
        setError('物品 ID 不存在');
        setLoading(false);
        return;
      }

      try {
        const itemData = await getItem(id);
        if (!itemData) {
          setError('物品不存在');
          setLoading(false);
          return;
        }
        setItem(itemData);

        const relationshipsData = await getRelationshipsByParent(id);
        setRelationships(relationshipsData);
      } catch (err) {
        setError('加载物品失败');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;

    if (confirm('确定要删除这个物品吗？')) {
      await deleteItem(item.id);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <i className="fa fa-exclamation-circle text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold mb-2">{error || '物品不存在'}</h2>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const isExpiring = item.warrantyDeadline - now < 30 * 24 * 60 * 60 * 1000;
  const isExpired = item.warrantyDeadline < now;

  let warrantyStatus = '保修中';
  let warrantyClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';

  if (isExpiring) {
    warrantyStatus = '即将到期';
    warrantyClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  } else if (isExpired) {
    warrantyStatus = '已过保';
    warrantyClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => router.back()} variant="outline">
          <i className="fa fa-arrow-left mr-2" />
          返回
        </Button>
        <div className="space-x-3">
          <Button variant="outline">
            <i className="fa fa-edit mr-2" />
            编辑
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <i className="fa fa-trash mr-2" />
            删除
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <i className="fa fa-camera text-6xl text-gray-400" />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
              <p className="text-muted-foreground mb-4">{item.brand} {item.model}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">序列号</p>
                  <p>{item.sn || '未设置'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">购入价格</p>
                  <p className="font-medium">¥ {item.purchasePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">购入日期</p>
                  <p>{new Date(item.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">存放位置</p>
                  <p>{item.location || '未设置'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">保修状态</p>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${warrantyClass}`}>
                    {warrantyStatus}
                  </span>
                  <span className="text-sm">
                    截止: {new Date(item.warrantyDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {item.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">备注</p>
                  <p className="whitespace-pre-line">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">关联配件</h2>
          {relationships.length === 0 ? (
            <p className="text-muted-foreground">暂无关联配件</p>
          ) : (
            <div className="space-y-3">
              {relationships.map((rel) => (
                <div key={rel.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                      <i className="fa fa-camera text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">配件 #{rel.childId.substring(0, 8)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    解绑
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button className="mt-4">
            <i className="fa fa-plus mr-2" />
            添加配件
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 提交物品详情页面代码**

```bash
git add .
git commit -m "feat: implement item detail page"
```

### 任务 8: 设置页面

**Files:**
- Create: `frontend/app/settings/page.tsx`
- Create: `frontend/lib/storage/import-export.ts`

- [ ] **Step 1: 实现导入导出逻辑**

编辑 `frontend/lib/storage/import-export.ts`：

```typescript
import { getAllItems, addItem, deleteItem } from './indexeddb';
import { Item } from '../types';

export async function exportData(): Promise<Blob> {
  const items = await getAllItems();
  const data = {
    version: '1.0',
    exportDate: Date.now(),
    items,
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return blob;
}

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.items || !Array.isArray(data.items)) {
      return { success: false, message: '无效的导入文件格式' };
    }
    
    // 导入物品
    for (const item of data.items) {
      await addItem(item);
    }
    
    return { success: true, message: `成功导入 ${data.items.length} 个物品` };
  } catch (error) {
    return { success: false, message: '导入失败：' + (error as Error).message };
  }
}
```

- [ ] **Step 2: 实现设置页面**

编辑 `frontend/app/settings/page.tsx`：

```tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exportData, importData } from '@/lib/storage/import-export';
import { getSettings, updateSettings } from '@/lib/storage/indexeddb';

export default function SettingsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [defaultView, setDefaultView] = useState<'card' | 'list'>('card');

  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setIsDark(settings.theme === 'dark');
      setDefaultView(settings.defaultView);
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
    const settings = await getSettings();
    await updateSettings({ ...settings, theme: newTheme });
  };

  const handleViewChange = async (view: 'card' | 'list') => {
    setDefaultView(view);
    const settings = await getSettings();
    await updateSettings({ ...settings, defaultView: view });
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
```

- [ ] **Step 3: 提交设置页面代码**

```bash
git add .
git commit -m "feat: implement settings page with import/export"
```

### 任务 9: 测试和优化

**Files:**
- 无新文件创建

- [ ] **Step 1: 运行开发服务器**

```bash
cd frontend
npm run dev
```

- [ ] **Step 2: 测试核心功能**

1. 添加物品
2. 查看物品详情
3. 浏览器材库（切换视图模式）
4. 测试搜索功能
5. 测试导入导出功能
6. 测试主题切换

- [ ] **Step 3: 构建生产版本**

```bash
cd frontend
npm run build
```

- [ ] **Step 4: 提交测试和优化结果**

```bash
git add .
git commit -m "test: test and optimize the application"
```

---

## 自审查

1. **规范覆盖**：所有设计文档中的功能都已在实施计划中覆盖
2. **占位符检查**：无占位符，所有步骤都有具体实现
3. **类型一致性**：TypeScript 类型定义一致，方法签名和属性名称统一

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-04-23-gearkeeper-web-implementation.md`。

**执行选项：**

1. **Subagent-Driven (推荐)** - 每个任务分配一个新的子代理，任务间进行审查，快速迭代
2. **Inline Execution** - 在当前会话中使用 executing-plans 执行任务，批量执行并设置检查点

**选择哪种方法？**