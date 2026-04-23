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
      const newOrder = getNextSortOrder(currentSortOrder);
      onSort(field);
    } else {
      onSort(field);
    }
  };

  const getSortIcon = () => {
    if (!isActive) {
      return <span className="text-muted-foreground ml-1 opacity-50">—</span>;
    }
    if (currentSortOrder === 'asc') {
      return <span className="text-primary ml-1 font-bold">↑</span>;
    }
    return <span className="text-primary ml-1 font-bold">↓</span>;
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={handleClick}
    >
      <span className="flex items-center">
        {label}
        {getSortIcon()}
      </span>
    </th>
  );
}