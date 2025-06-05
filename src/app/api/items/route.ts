import { NextResponse } from 'next/server';
import { dbServer } from '@/services/db-server';

export async function GET() {
  try {
    await dbServer.init();
    const items = await dbServer.getAllItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to get items:', error);
    return NextResponse.json({ error: 'Failed to get items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    await dbServer.init();
    const id = await dbServer.addItem(item);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Failed to add item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const item = await request.json();
    await dbServer.init();
    await dbServer.updateItem(item);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await dbServer.init();
    await dbServer.deleteItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 