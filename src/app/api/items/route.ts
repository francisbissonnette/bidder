import { NextResponse } from 'next/server';
import { dbServer } from '@/services/db-server';

// Temporary in-memory storage for serverless environment
let items: any[] = [];

export async function GET() {
  try {
    // Try to use the file-based storage first
    try {
      await dbServer.init();
      const allItems = await dbServer.getAllItems();
      return NextResponse.json(allItems);
    } catch (error) {
      // If file system is not available, use in-memory storage
      console.log('Using in-memory storage');
      return NextResponse.json(items);
    }
  } catch (error) {
    console.error('Failed to get items:', error);
    return NextResponse.json({ error: 'Failed to get items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    // Try to use the file-based storage first
    try {
      await dbServer.init();
      const id = await dbServer.addItem(item);
      return NextResponse.json({ id });
    } catch (error) {
      // If file system is not available, use in-memory storage
      console.log('Using in-memory storage');
      const id = items.length + 1;
      items.push({ ...item, id });
      return NextResponse.json({ id });
    }
  } catch (error) {
    console.error('Failed to add item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedItem = await request.json();
    // Try to use the file-based storage first
    try {
      await dbServer.init();
      await dbServer.updateItem(updatedItem);
      return NextResponse.json({ success: true });
    } catch (error) {
      // If file system is not available, use in-memory storage
      console.log('Using in-memory storage');
      const index = items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        items[index] = updatedItem;
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    // Try to use the file-based storage first
    try {
      await dbServer.init();
      await dbServer.deleteItem(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      // If file system is not available, use in-memory storage
      console.log('Using in-memory storage');
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items.splice(index, 1);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 