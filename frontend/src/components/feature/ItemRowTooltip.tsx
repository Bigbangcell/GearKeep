'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/types';

interface ItemRowTooltipProps {
  item: Item;
  anchorEl: HTMLElement | null;
}

export function ItemRowTooltip({ item, anchorEl }: ItemRowTooltipProps) {
  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const showAbove = rect.top > viewportHeight / 2;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: rect.left,
    width: 300,
    top: showAbove ? rect.top - 10 : rect.bottom + 10,
    transform: showAbove ? 'translateY(-100%)' : 'none',
    zIndex: 9999,
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-background border border-border rounded-lg shadow-xl p-4 pointer-events-none"
    >
      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{item.brand} {item.model}</p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">价格：</span>
          <span className="font-medium">¥ {item.purchasePrice.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">保修状态：</span>
          <span className={`badge ${warranty.class}`}>{warranty.text}</span>
        </div>

        {item.location && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">位置：</span>
            <span>{item.location}</span>
          </div>
        )}

        {item.category && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">分类：</span>
            <span>{item.category}</span>
          </div>
        )}

        {item.purchaseChannel && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">渠道：</span>
            <span>{item.purchaseChannel}</span>
          </div>
        )}

        {item.condition && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">成色：</span>
            <span>{item.condition}</span>
          </div>
        )}

        {item.color && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">颜色：</span>
            <span>{item.color}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">购买日期：</span>
          <span>{formatDate(item.purchaseDate)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">保修截止：</span>
          <span>{formatDate(item.warrantyDeadline)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {daysLeft > 0 ? `剩余 ${daysLeft} 天保修` : `已过保 ${Math.abs(daysLeft)} 天`}
        </p>
      </div>
    </div>
  );
}