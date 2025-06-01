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
        const loadedItems = await db.getAllItems();
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
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleEditItem = async (item: Item) => {
    try {
      await db.updateItem(item);
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
      setIsEditModalOpen(false);
      setSelectedItem(null);
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
            <Button colorScheme="gray" onClick={() => setIsAddModalOpen(true)}>
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