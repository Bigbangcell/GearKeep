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
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultView: 'card' | 'list';
}