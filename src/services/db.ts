import { Item } from '@/types/item';
import { supabase } from '@/lib/supabase';

class DatabaseService {
  private items: Item[] = [];

  async init(): Promise<void> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('archived', false);

    if (error) {
      console.error('Error initializing database:', error);
      throw error;
    }

    this.items = data?.map(item => ({
      id: item.id,
      name: item.name,
      url: item.url,
      imageUrl: item.image_url,
      sellerUrl: item.seller_url,
      bid: item.bid,
      currentBid: item.current_bid,
      market: item.market,
      date: item.date,
      seller: item.seller,
      archived: item.archived
    })) || [];
  }

  async getAllItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('archived', false);

    if (error) {
      console.error('Error getting items:', error);
      throw error;
    }

    this.items = data?.map(item => ({
      id: item.id,
      name: item.name,
      url: item.url,
      imageUrl: item.image_url,
      sellerUrl: item.seller_url,
      bid: item.bid,
      currentBid: item.current_bid,
      market: item.market,
      date: item.date,
      seller: item.seller,
      archived: item.archived
    })) || [];
    return this.items;
  }

  async getArchivedItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('archived', true);

    if (error) {
      console.error('Error getting archived items:', error);
      throw error;
    }

    return data || [];
  }

  async addItem(item: Omit<Item, 'id'>): Promise<number> {
    const { data, error } = await supabase
      .from('items')
      .insert([{
        name: item.name,
        url: item.url,
        image_url: item.imageUrl,
        seller_url: item.sellerUrl,
        bid: item.bid,
        current_bid: item.currentBid,
        market: item.market,
        date: item.date,
        seller: item.seller,
        archived: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    const newItem = {
      id: data.id,
      name: data.name,
      url: data.url,
      imageUrl: data.image_url,
      sellerUrl: data.seller_url,
      bid: data.bid,
      currentBid: data.current_bid,
      market: data.market,
      date: data.date,
      seller: data.seller,
      archived: data.archived
    };

    this.items = [...this.items, newItem];
    return data.id;
  }

  async updateItem(item: Item): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({
        name: item.name,
        url: item.url,
        image_url: item.imageUrl,
        seller_url: item.sellerUrl,
        bid: item.bid,
        current_bid: item.currentBid,
        market: item.market,
        date: item.date,
        seller: item.seller,
        archived: item.archived
      })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }

    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
  }

  async deleteItem(id: number): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }

    this.items = this.items.filter(item => item.id !== id);
  }

  async archiveItem(id: number): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error archiving item:', error);
      throw error;
    }

    this.items = this.items.filter(item => item.id !== id);
  }

  async restoreItem(id: number): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ archived: false })
      .eq('id', id);

    if (error) {
      console.error('Error restoring item:', error);
      throw error;
    }

    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      const restoredItem = {
        id: data.id,
        name: data.name,
        url: data.url,
        imageUrl: data.image_url,
        sellerUrl: data.seller_url,
        bid: data.bid,
        currentBid: data.current_bid,
        market: data.market,
        date: data.date,
        seller: data.seller,
        archived: data.archived
      };
      this.items = [...this.items, restoredItem];
    }
  }
}

export const db = new DatabaseService(); 