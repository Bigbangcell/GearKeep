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
            {expiringItems.length === 0 && warrantyItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  暂无保修信息
                </td>
              </tr>
            )}
            {expiringItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
                      <i className="fa fa-camera text-muted-foreground" />
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
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-3">
                        <i className="fa fa-camera text-muted-foreground" />
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