export interface Item {
  id: string;
  name: string;
  brand: string;
  model: string;
  sn: string;
  purchasePrice: number;
  purchaseDate: number;
  warrantyMonths: number;
  warrantyDeadline: number;
  location: string;
  notes: string;
  isMaster: boolean;
  category: string;
  purchaseChannel: string;
  condition: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
  createdAt: number;
}

export interface FieldSettings {
  visibleFields: string[];
  fieldOrder: string[];
  listSortField: string;
  listSortOrder: 'asc' | 'desc';
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'card' | 'list';
  fieldSettings: FieldSettings;
}

export const DEFAULT_VISIBLE_FIELDS = [
  'name', 'brand', 'model', 'purchasePrice', 'purchaseDate',
  'warrantyDeadline', 'location', 'category', 'condition'
];

export const ALL_FIELDS = [
  { key: 'name', label: '名称' },
  { key: 'brand', label: '品牌' },
  { key: 'model', label: '型号' },
  { key: 'sn', label: '序列号' },
  { key: 'purchasePrice', label: '价格' },
  { key: 'purchaseDate', label: '购买日期' },
  { key: 'warrantyMonths', label: '保修月数' },
  { key: 'warrantyDeadline', label: '保修截止' },
  { key: 'location', label: '存放位置' },
  { key: 'notes', label: '备注' },
  { key: 'category', label: '分类' },
  { key: 'purchaseChannel', label: '购买渠道' },
  { key: 'condition', label: '成色' },
  { key: 'color', label: '颜色' },
];