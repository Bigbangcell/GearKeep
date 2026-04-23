import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Item, Relationship, Settings } from '../types';

interface GearKeepDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: { 'by-created': number; 'by-updated': number };
  };
  relationships: {
    key: string;
    value: Relationship;
    indexes: { 'by-parent': string; 'by-child': string };
  };
  settings: {
    key: string;
    value: Settings & { key: string };
  };
}

let db: IDBPDatabase<GearKeepDB> | null = null;

async function getDB(): Promise<IDBPDatabase<GearKeepDB>> {
  if (!db) {
    db = await openDB<GearKeepDB>('gearkeeper-web', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('items')) {
          const itemStore = database.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-created', 'createdAt');
          itemStore.createIndex('by-updated', 'updatedAt');
        }

        if (!database.objectStoreNames.contains('relationships')) {
          const relationshipStore = database.createObjectStore('relationships', { keyPath: 'id' });
          relationshipStore.createIndex('by-parent', 'parentId');
          relationshipStore.createIndex('by-child', 'childId');
        }

        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return db;
}

export async function addItem(item: Item): Promise<void> {
  const database = await getDB();
  await database.put('items', item);
}

export async function getItem(id: string): Promise<Item | undefined> {
  const database = await getDB();
  return await database.get('items', id);
}

export async function getAllItems(): Promise<Item[]> {
  const database = await getDB();
  return await database.getAll('items');
}

export async function updateItem(item: Item): Promise<void> {
  const database = await getDB();
  await database.put('items', item);
}

export async function deleteItem(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('items', id);
}

export async function addRelationship(relationship: Relationship): Promise<void> {
  const database = await getDB();
  await database.put('relationships', relationship);
}

export async function getRelationshipsByParent(parentId: string): Promise<Relationship[]> {
  const database = await getDB();
  return await database.getAllFromIndex('relationships', 'by-parent', parentId);
}

export async function deleteRelationship(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('relationships', id);
}

export async function getSettings(): Promise<Settings> {
  const database = await getDB();
  const settings = await database.get('settings', 'app-settings');
  if (settings) {
    const { key: _, ...rest } = settings;
    return rest;
  }
  return { theme: 'light', defaultView: 'card' };
}

export async function updateSettings(settings: Settings): Promise<void> {
  const database = await getDB();
  await database.put('settings', { ...settings, key: 'app-settings' });
}