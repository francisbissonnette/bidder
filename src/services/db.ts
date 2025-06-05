import { Item } from '@/types/item';

class DatabaseService {
  private items: Item[] = [];

  async init(): Promise<void> {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      this.items = await response.json();
    } catch (error) {
      console.error('Failed to initialize database:', error);
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
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error('Failed to add item');
    }

    const { id } = await response.json();
    const newItem = { ...item, id };
    this.items = [...this.items, newItem];
    return id;
  }

  async updateItem(item: Item): Promise<void> {
    const response = await fetch('/api/items', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error('Failed to update item');
    }

    const index = this.items.findIndex(i => i.id === item.id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    this.items[index] = item;
  }

  async deleteItem(id: number): Promise<void> {
    const response = await fetch('/api/items', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete item');
    }

    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    this.items.splice(index, 1);
  }

  async archiveItem(id: number): Promise<void> {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    item.archived = true;
    await this.updateItem(item);
  }

  async restoreItem(id: number): Promise<void> {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('Item not found');
    }
    item.archived = false;
    await this.updateItem(item);
  }
}

export const db = new DatabaseService(); 