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
    category: '',
    purchaseChannel: '',
    condition: '',
    color: '',
    isMaster: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
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
      category: formData.category,
      purchaseChannel: formData.purchaseChannel,
      condition: formData.condition,
      color: formData.color,
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
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">请选择分类</option>
                <option value="相机">相机</option>
                <option value="镜头">镜头</option>
                <option value="配件">配件</option>
                <option value="存储设备">存储设备</option>
                <option value="灯光设备">灯光设备</option>
                <option value="三脚架">三脚架</option>
                <option value="包/箱">包/箱</option>
                <option value="电池/充电器">电池/充电器</option>
                <option value="滤镜">滤镜</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseChannel">购买渠道</Label>
              <select
                id="purchaseChannel"
                name="purchaseChannel"
                value={formData.purchaseChannel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">请选择渠道</option>
                <option value="京东">京东</option>
                <option value="天猫">天猫</option>
                <option value="官网">官网</option>
                <option value="拼多多">拼多多</option>
                <option value="二手平台">二手平台</option>
                <option value="线下门店">线下门店</option>
                <option value="朋友转让">朋友转让</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">成色</Label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">请选择成色</option>
                <option value="全新">全新</option>
                <option value="几乎全新">几乎全新</option>
                <option value="轻微使用痕迹">轻微使用痕迹</option>
                <option value="明显使用痕迹">明显使用痕迹</option>
                <option value="翻新">翻新</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">颜色</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
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