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
      <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
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
  );
}