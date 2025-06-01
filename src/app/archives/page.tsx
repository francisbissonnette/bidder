'use client';

import { ChakraProvider, Box, Button, Container, Heading, HStack } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import ItemsTable from '@/components/Items/ItemsTable';
import { useState, useMemo, useEffect } from 'react';
import { Item } from '@/types/item';
import theme from '@/theme';
import { db } from '@/services/db';

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

export default function Archives() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArchivedItems = async () => {
      try {
        await db.init();
        const archivedItems = await db.getArchivedItems();
        setItems(archivedItems);
      } catch (error) {
        console.error('Failed to load archived items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArchivedItems();
  }, []);

  // Organize items into groups with main items and sub-items
  const organizedItems = useMemo(() => organizeItemsIntoGroups(items), [items]);

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
            <Heading size="lg">Archived Items</Heading>
          </HStack>

          <ItemsTable
            items={organizedItems}
            onAddItem={() => {}} // Disabled for archives
            onEditItem={() => {}} // Disabled for archives
            onDeleteItem={() => {}} // Disabled for archives
            isArchive={true}
          />
        </Container>
      </Layout>
    </ChakraProvider>
  );
} 