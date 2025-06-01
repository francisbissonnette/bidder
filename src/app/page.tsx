'use client';

import { ChakraProvider, Box, Button, Container, Heading, HStack } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import ItemsTable from '@/components/Items/ItemsTable';
import { useState, useMemo, useEffect } from 'react';
import { Item } from '@/types/item';
import theme from '@/theme';
import { db } from '@/services/db';
import AddItemModal from '@/components/Items/AddItemModal';
import EditItemModal from '@/components/Items/EditItemModal';
import DeleteItemModal from '@/components/Items/DeleteItemModal';

// Sample data
const sampleItems: Omit<Item, 'id'>[] = [
  {
    name: 'Item 1',
    url: 'https://example.com/item1',
    imageUrl: 'https://picsum.photos/200',
    sellerUrl: 'https://example.com/seller1',
    bid: 100,
    currentBid: 90,
    market: 1,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'Item 2',
    url: 'https://example.com/item2',
    imageUrl: 'https://picsum.photos/201',
    sellerUrl: 'https://example.com/seller1',
    bid: 200,
    currentBid: 180,
    market: 2,
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'Item 3',
    url: 'https://example.com/item3',
    imageUrl: 'https://picsum.photos/202',
    sellerUrl: 'https://example.com/seller2',
    bid: 150,
    currentBid: 140,
    market: 1,
    date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'Item 4',
    url: 'https://example.com/item4',
    imageUrl: 'https://picsum.photos/203',
    sellerUrl: 'https://example.com/seller2',
    bid: 300,
    currentBid: 280,
    market: 2,
    date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper function to organize items into groups
const organizeItemsIntoGroups = (items: Item[]): Item[] => {
  // Group items by seller URL
  const groups = items.reduce((acc, item) => {
    const key = item.sellerUrl;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({...item}); // Create a copy of the item
    return acc;
  }, {} as Record<string, Item[]>);

  // For each group, find the main item (highest market) and organize others as sub-items
  return Object.values(groups).map(group => {
    // Sort by market in descending order
    const sortedGroup = [...group].sort((a, b) => b.market - a.market);
    const mainItem = sortedGroup[0];
    const subItems = sortedGroup.slice(1);

    // Create a new object for the main item with subItems
    return {
      ...mainItem,
      subItems: subItems.length > 0 ? subItems : undefined
    };
  });
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        await db.init();
        let loadedItems = await db.getAllItems();
        
        // If no items exist, add sample items
        if (loadedItems.length === 0) {
          for (const item of sampleItems) {
            await db.addItem(item);
          }
          loadedItems = await db.getAllItems();
        }
        
        setItems(loadedItems);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  // Organize items into groups with main items and sub-items
  const organizedItems = useMemo(() => organizeItemsIntoGroups(items), [items]);

  const handleAddItem = async (item: Omit<Item, 'id'>) => {
    try {
      const id = await db.addItem(item);
      const newItem = { ...item, id };
      setItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleEditItem = async (item: Item) => {
    try {
      await db.updateItem(item);
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await db.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleArchiveItem = async (id: number) => {
    try {
      await db.archiveItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to archive item:', error);
    }
  };

  if (isLoading) {
    return (
      <ChakraProvider theme={theme}>
        <Layout>
          <div>Loading...</div>
        </Layout>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Container maxW="container.2xl" py={8}>
          <HStack justify="space-between" mb={8}>
            <Heading size="lg">Items</Heading>
            <Button colorScheme="blue" onClick={() => setIsAddModalOpen(true)}>
              Add Item
            </Button>
          </HStack>

          <ItemsTable
            items={organizedItems}
            onAddItem={() => setIsAddModalOpen(true)}
            onEditItem={(item) => {
              setSelectedItem(item);
              setIsEditModalOpen(true);
            }}
            onDeleteItem={(item) => {
              setSelectedItem(item);
              setIsDeleteModalOpen(true);
            }}
            onArchiveItem={handleArchiveItem}
            isArchive={false}
          />

          <AddItemModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddItem}
          />

          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            onEdit={handleEditItem}
            item={selectedItem}
          />

          <DeleteItemModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedItem(null);
            }}
            onDelete={() => selectedItem && handleDeleteItem(selectedItem.id!)}
            itemName={selectedItem?.name}
          />
        </Container>
      </Layout>
    </ChakraProvider>
  );
} 