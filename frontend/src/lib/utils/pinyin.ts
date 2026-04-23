import pinyin from 'pinyin';
import { Item } from '../types';

export function getPinyinInitial(str: string): string {
  if (!str) return '';
  try {
    const result = pinyin(str, { style: pinyin.STYLE_FIRST_LETTER });
    return result.map(item => item[0]).join('').toUpperCase();
  } catch {
    return str.toUpperCase();
  }
}

export function compareByPinyin(a: string, b: string): number {
  const pinyinA = getPinyinInitial(a);
  const pinyinB = getPinyinInitial(b);
  return pinyinA.localeCompare(pinyinB);
}

export type SortField = 'name' | 'brand' | 'model' | 'purchasePrice' | 'purchaseDate' | 'warrantyDeadline' | 'createdAt';

export function sortItems(
  items: Item[],
  field: SortField,
  order: 'asc' | 'desc'
): Item[] {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (field === 'name' || field === 'brand' || field === 'model') {
      const comparison = compareByPinyin(String(aVal || ''), String(bVal || ''));
      return order === 'asc' ? comparison : -comparison;
    }

    const comparison = Number(aVal) - Number(bVal);
    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function getNextSortOrder(current: 'asc' | 'desc' | null): 'asc' | 'desc' {
  if (!current) return 'asc';
  return current === 'asc' ? 'desc' : 'asc';
}