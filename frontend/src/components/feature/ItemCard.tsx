'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { ItemTooltip } from './ItemTooltip';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <Link href={`/item/${item.id}`} className="block">
        <div
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-border hover:border-primary/50"
        >
          <div className="h-24 bg-muted rounded-md mb-4 flex items-center justify-center">
            <i className="fa fa-camera text-2xl text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{item.brand} {item.model}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">¥ {item.purchasePrice.toLocaleString()}</span>
            {statusBadge}
          </div>
        </div>
      </Link>

      {showTooltip && cardRef.current && (
        <ItemTooltip
          item={item}
          anchorRect={cardRef.current.getBoundingClientRect()}
        />
      )}
    </div>
  );
}