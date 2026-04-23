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
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
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

    try {
      await addItem(newItem);
      router.push('/');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
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