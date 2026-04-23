'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { ItemTooltip } from './ItemTooltip';

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

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
    <>
      <tr
        ref={rowRef}
        className="hover:bg-muted/50 transition-colors cursor-pointer border-b border-border"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <td className="px-3 py-3">
          <Link href={`/item/${item.id}`} className="flex items-center hover:text-primary">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-2 flex-shrink-0">
              <i className="fa fa-camera text-muted-foreground text-xs" />
            </div>
            <span className="font-medium truncate max-w-[120px]">{item.name}</span>
          </Link>
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground truncate max-w-[100px]">
          {item.brand}
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground truncate max-w-[80px]">
          {item.model}
        </td>
        <td className="px-3 py-3 text-sm font-medium whitespace-nowrap">
          ¥ {item.purchasePrice.toLocaleString()}
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {new Date(item.purchaseDate).toLocaleDateString()}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {statusBadge}
        </td>
      </tr>
      {showTooltip && rowRef.current && (
        <ItemTooltip
          item={item}
          anchorRect={rowRef.current.getBoundingClientRect()}
        />
      )}
    </>
  );
}