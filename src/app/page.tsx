'use client';

import { ChakraProvider, Box, Button, Container, Heading, HStack, VStack } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import ItemsTable from '@/components/Items/ItemsTable';
import { useState, useMemo, useEffect } from 'react';
import { Item } from '@/types/item';
import theme from '@/theme';
import { db } from '@/services/db';
import AddItemModal from '@/components/Items/AddItemModal';
import EditItemModal from '@/components/Items/EditItemModal';
import DeleteItemModal from '@/components/Items/DeleteItemModal';
import { AddIcon } from '@chakra-ui/icons';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleAddItem = async (newItem: Omit<Item, 'id'>) => {
    try {
      await db.addItem(newItem);
      const updatedItems = await db.getAllItems();
      setItems(updatedItems);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleEditItem = async (updatedItem: Item) => {
    try {
      await db.updateItem(updatedItem);
      const updatedItems = await db.getAllItems();
      setItems(updatedItems);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (!item.id) return;
    try {
      await db.deleteItem(item.id);
      const updatedItems = await db.getAllItems();
      setItems(updatedItems);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleArchiveItem = async (id: number) => {
    try {
      await db.archiveItem(id);
      const updatedItems = await db.getAllItems();
      setItems(updatedItems);
    } catch (error) {
      console.error('Failed to archive item:', error);
    }
  };

  // Helper function to organize items into groups
  const organizedItems = useMemo(() => {
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
  }, [items]);

  if (isLoading) {
    return <div>Loading...</div>;
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
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onArchiveItem={handleArchiveItem}
            onAddItem={() => setIsAddModalOpen(true)}
            isArchive={false}
          />
        </Container>

        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem}
        />
      </Layout>
    </ChakraProvider>
  );
} 