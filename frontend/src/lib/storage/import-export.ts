import { getAllItems, addItem } from './indexeddb';
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

    for (const item of data.items) {
      await addItem(item);
    }

    return { success: true, message: `成功导入 ${data.items.length} 个物品` };
  } catch (error) {
    return { success: false, message: '导入失败：' + (error as Error).message };
  }
}