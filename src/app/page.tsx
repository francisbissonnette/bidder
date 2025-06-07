'use client';

import { ChakraProvider, Box, Button, Container, Heading, HStack, VStack, Select } from '@chakra-ui/react';
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
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  // Known sellers mapping
  const knownSellers = [
    { url: 'https://www.ebay.com/usr/auction_house_usa', name: 'Auction House USA' },
    { url: 'https://www.ebay.com/usr/auction_house_canada', name: 'Auction House Canada' },
    { url: 'https://www.ebay.com/usr/auction_house_uk', name: 'Auction House UK' },
    { url: 'https://www.ebay.com/usr/auction_house_australia', name: 'Auction House Australia' },
    { url: 'https://www.ebay.com/usr/auction_house_germany', name: 'Auction House Germany' },
    { url: 'https://www.ebay.com/usr/auction_house_france', name: 'Auction House France' },
    { url: 'https://www.ebay.com/usr/auction_house_italy', name: 'Auction House Italy' },
    { url: 'https://www.ebay.com/usr/auction_house_spain', name: 'Auction House Spain' },
    { url: 'https://www.ebay.com/usr/auction_house_japan', name: 'Auction House Japan' },
    { url: 'https://www.ebay.com/usr/auction_house_china', name: 'Auction House China' }
  ];

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
      // Sort by market in descending order to find main item
      const sortedByMarket = [...group].sort((a, b) => b.market - a.market);
      const mainItem = sortedByMarket[0];
      
      // Get sub-items and sort them by end time
      const subItems = sortedByMarket.slice(1).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Create a new object for the main item with sorted subItems
      return {
        ...mainItem,
        subItems: subItems.length > 0 ? subItems : undefined
      };
    });
  }, [items]);

  // Get unique sellers from items
  const uniqueSellers = useMemo(() => {
    console.log('Current organized items:', organizedItems);
    const sellers = new Set<string>();
    organizedItems.forEach(item => {
      const sellerName = item.sellerUrl.split('/').pop() || '';
      if (sellerName) {
        sellers.add(sellerName);
      }
    });
    const sellerList = Array.from(sellers).sort();
    console.log('Unique sellers found:', sellerList);
    return sellerList;
  }, [organizedItems]);

  // Helper function to get seller name from URL
  const getSellerName = (url: string) => {
    const knownSeller = knownSellers.find((seller: { url: string; name: string }) => seller.url === url);
    if (knownSeller) {
      return knownSeller.name;
    }
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Filter items based on selected seller
  const filteredItems = useMemo(() => {
    if (!selectedSeller) return organizedItems;
    return organizedItems.filter(item => {
      const itemSeller = item.sellerUrl.split('/').pop() || '';
      return itemSeller === selectedSeller;
    });
  }, [organizedItems, selectedSeller]);

  const handleSellerFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeller(e.target.value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Container maxW="container.2xl" py={8}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="lg">Items</Heading>
              <Button colorScheme="gray" onClick={() => setIsAddModalOpen(true)}>
                Add Item
              </Button>
            </HStack>

            <Select
              placeholder="Filter by seller"
              value={selectedSeller}
              onChange={handleSellerFilterChange}
              maxW="300px"
            >
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </Select>

            <ItemsTable
              items={filteredItems}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onArchiveItem={handleArchiveItem}
              onAddItem={() => setIsAddModalOpen(true)}
              isArchive={false}
              onUpdate={async (updatedItems) => {
                try {
                  // Update each item in the database
                  await Promise.all(updatedItems.map(item => db.updateItem(item)));
                  // Refresh the items list
                  const refreshedItems = await db.getAllItems();
                  setItems(refreshedItems);
                } catch (error) {
                  console.error('Failed to update items:', error);
                }
              }}
            />
          </VStack>
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