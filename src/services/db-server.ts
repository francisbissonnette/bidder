import { Item } from '@/types/item';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'items.json');

class DatabaseService {
  private items: Item[] = [];

  async init(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }

      // Create or load the JSON file
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
      }

      const data = fs.readFileSync(DB_FILE, 'utf-8');
      this.items = JSON.parse(data);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      await fs.promises.writeFile(DB_FILE, JSON.stringify(this.items, null, 2));
    } catch (error) {
      console.error('Failed to save to file:', error);
      throw error;
    }
  }

  async getAllItems(): Promise<Item[]> {
    return this.items.filter(item => !item.archived);
  }

  async getArchivedItems(): Promise<Item[]> {
    return this.items.filter(item => item.archived);
  }

  async addItem(item: Omit<Item, 'id'>): Promise<number> {
    const newItem = {
      ...item,
      id: this.items.length > 0 ? Math.max(...this.items.map(i => i.id || 0)) + 1 : 1
    };
    this.items.push(newItem);
    await this.saveToFile();
    return newItem.id;
  }

  async updateItem(item: Item): Promise<void> {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    this.items[index] = item;
    await this.saveToFile();
  }

  async deleteItem(id: number): Promise<void> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    this.items.splice(index, 1);
    await this.saveToFile();
  }

  async archiveItem(id: number): Promise<void> {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    item.archived = true;
    await this.saveToFile();
  }

  async restoreItem(id: number): Promise<void> {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    item.archived = false;
    await this.saveToFile();
  }
}

export const dbServer = new DatabaseService(); 