import { getAllItems, addItem, getItem, updateItem } from './indexeddb';
import { Item } from '../types';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  success: boolean;
  message: string;
  itemsImported: number;
  itemsSkipped: number;
  itemsReplaced: number;
  duplicates: Item[];
}

export interface ImportConflictInfo {
  totalItems: number;
  duplicates: Array<{
    imported: Item;
    existing: Item;
  }>;
}

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

export async function checkExcelImportDuplicates(file: File): Promise<ImportConflictInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, unknown>[];

  const now = Date.now();
  const existingItems = await getAllItems();
  const conflicts: Array<{ imported: Item; existing: Item }> = [];

  for (const row of jsonData) {
    const item = parseRowToItem(row, now);
    if (!item) continue;

    const existing = existingItems.find(e =>
      (e.sn && item.sn && e.sn === item.sn) ||
      (e.name === item.name && e.brand === item.brand && e.model === item.model)
    );

    if (existing) {
      conflicts.push({ imported: item, existing });
    }
  }

  return {
    totalItems: jsonData.length,
    duplicates: conflicts,
  };
}

export async function importExcelData(
  file: File,
  mode: 'skip' | 'replace' | 'import-all' = 'skip'
): Promise<ImportResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, unknown>[];

    const items: Item[] = [];
    const now = Date.now();
    const existingItems = await getAllItems();

    for (const row of jsonData) {
      const item = parseRowToItem(row, now);
      if (item) {
        items.push(item);
      }
    }

    if (items.length === 0) {
      return {
        success: false,
        message: '未能从文件中识别出有效的物品数据',
        itemsImported: 0,
        itemsSkipped: 0,
        itemsReplaced: 0,
        duplicates: [],
      };
    }

    let itemsImported = 0;
    let itemsSkipped = 0;
    let itemsReplaced = 0;
    const duplicates: Item[] = [];

    for (const item of items) {
      const existing = existingItems.find(e =>
        (e.sn && item.sn && e.sn === item.sn) ||
        (e.name === item.name && e.brand === item.brand && e.model === item.model)
      );

      if (existing) {
        if (mode === 'skip') {
          itemsSkipped++;
          duplicates.push(existing);
        } else if (mode === 'replace') {
          await updateItem({ ...item, id: existing.id, createdAt: existing.createdAt, updatedAt: now });
          itemsReplaced++;
        } else {
          await addItem(item);
          itemsImported++;
        }
      } else {
        await addItem(item);
        itemsImported++;
      }
    }

    const messages: string[] = [];
    if (itemsImported > 0) messages.push(`新增 ${itemsImported} 个`);
    if (itemsReplaced > 0) messages.push(`替换 ${itemsReplaced} 个`);
    if (itemsSkipped > 0) messages.push(`跳过 ${itemsSkipped} 个重复`);

    return {
      success: true,
      message: messages.join('，') || '导入完成',
      itemsImported,
      itemsSkipped,
      itemsReplaced,
      duplicates,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Excel 导入失败：' + (error as Error).message,
      itemsImported: 0,
      itemsSkipped: 0,
      itemsReplaced: 0,
      duplicates: [],
    };
  }
}

function parseRowToItem(row: Record<string, unknown>, now: number): Item | null {
  const name = findValue(row, ['名称', 'name', '品名', '物品名称', '设备名称', '器材名称']);
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return null;
  }

  const brand = findValue(row, ['品牌', 'brand', '厂商', '生产厂家']) || '';
  const model = findValue(row, ['型号', 'model', '规格', '产品型号']) || '';
  const sn = findValue(row, ['序列号', 'sn', 'serialNumber', 'S/N', '编号', '条码']) || '';

  let purchasePrice = 0;
  const priceValue = findValue(row, ['价格', 'price', '购入价格', 'purchasePrice', '单价', '金额', '价值']);
  if (priceValue) {
    const parsed = parseFloat(String(priceValue).replace(/[^\d.]/g, ''));
    if (!isNaN(parsed)) {
      purchasePrice = parsed;
    }
  }

  let purchaseDate = now;
  const dateValue = findValue(row, ['购买日期', 'purchaseDate', '购入日期', '购置日期', '入手日期', '日期']);
  if (dateValue) {
    const parsed = parseDate(dateValue);
    if (parsed) {
      purchaseDate = parsed;
    }
  }

  let warrantyMonths = 12;
  const warrantyValue = findValue(row, ['保修', 'warranty', '保修期', '保修月数', '质保']);
  if (warrantyValue) {
    const parsed = parseWarranty(warrantyValue);
    if (parsed > 0) {
      warrantyMonths = parsed;
    }
  }

  const warrantyDeadline = purchaseDate + warrantyMonths * 30 * 24 * 60 * 60 * 1000;

  const location = findValue(row, ['位置', 'location', '存放位置', '放置地点', '存储位置']) || '';
  const notes = findValue(row, ['备注', 'notes', '说明', '描述', '备注信息']) || '';
  const category = findValue(row, ['分类', 'category', '类别', '类型']) || '';
  const purchaseChannel = findValue(row, ['购买渠道', 'purchaseChannel', '渠道', '来源', '购买来源']) || '';
  const condition = findValue(row, ['成色', 'condition', '新旧程度', '使用程度']) || '';
  const color = findValue(row, ['颜色', 'color', '色']) || '';

  const isMaster = String(findValue(row, ['主设备', 'master', '主机', '主件']) || '').toLowerCase() === '是' ||
    String(findValue(row, ['主设备', 'master', '主机', '主件']) || '').toLowerCase() === 'y' ||
    String(findValue(row, ['主设备', 'master', '主机', '主件']) || '').toLowerCase() === 'yes';

  return {
    id: uuidv4(),
    name: String(name).trim(),
    brand: String(brand).trim(),
    model: String(model).trim(),
    sn: String(sn).trim(),
    purchasePrice,
    purchaseDate,
    warrantyMonths,
    warrantyDeadline,
    location: String(location).trim(),
    notes: String(notes).trim(),
    isMaster,
    category: String(category).trim(),
    purchaseChannel: String(purchaseChannel).trim(),
    condition: String(condition).trim(),
    color: String(color).trim(),
    createdAt: now,
    updatedAt: now,
  };
}

function findValue(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase() === normalizedKey) {
        return row[rowKey];
      }
    }
    const fuzzyKey = Object.keys(row).find(rk =>
      rk.toLowerCase().includes(normalizedKey) || normalizedKey.includes(rk.toLowerCase())
    );
    if (fuzzyKey) {
      return row[fuzzyKey];
    }
  }
  return null;
}

function parseDate(value: unknown): number | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.getTime();
  }

  const str = String(value).trim();

  const datePatterns = [
    /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?$/,
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
  ];

  for (const pattern of datePatterns) {
    const match = str.match(pattern);
    if (match) {
      let year: number, month: number, day: number;
      if (str.includes('年') || str.includes('-')) {
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else if (str.includes('/')) {
        month = parseInt(match[1]);
        day = parseInt(match[2]);
        year = parseInt(match[3]);
      } else {
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      }
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date.getTime();
      }
    }
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return null;
}

function parseWarranty(value: unknown): number {
  if (!value) return 0;

  const str = String(value).trim();

  const monthMatch = str.match(/(\d+)\s*个月?/);
  if (monthMatch) {
    return parseInt(monthMatch[1]);
  }

  const yearMatch = str.match(/(\d+)\s*年/);
  if (yearMatch) {
    return parseInt(yearMatch[1]) * 12;
  }

  const numMatch = str.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    if (num > 30) {
      return num;
    }
    return num;
  }

  if (str.includes('无') || str.includes('否')) {
    return 0;
  }

  return 12;
}