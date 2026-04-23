'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getItem, deleteItem, getRelationshipsByParent } from '@/lib/storage/indexeddb';
import { Item, Relationship } from '@/lib/types';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

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
      try {
        await deleteItem(item.id);
        router.push('/');
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
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
          <i className="fa fa-exclamation-circle text-destructive text-4xl mb-4" />
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
              <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                <i className="fa fa-camera text-6xl text-muted-foreground" />
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
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center mr-3">
                      <i className="fa fa-camera text-muted-foreground" />
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