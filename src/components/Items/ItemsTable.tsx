import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Image,
  IconButton,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Link,
  VStack,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiChevronRight, FiArchive, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { Item } from '@/types/item';
import EditItemModal from './EditItemModal';
import DeleteItemModal from './DeleteItemModal';
import { useState, useEffect, useMemo } from 'react';
import { exchangeRateService } from '@/services/exchangeRate';
import { knownSellers } from '@/types/seller';
import React from 'react';
import { scraper } from '@/services/scraper';
import { db } from '@/services/db';

interface ItemsTableProps {
  items: Item[];
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onArchiveItem?: (id: number) => void;
  onRestoreItem?: (id: number) => void;
  isArchive?: boolean;
}

const ItemsTable = ({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onArchiveItem,
  onRestoreItem,
  isArchive = false,
}: ItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0.74);
  const [localItems, setLocalItems] = useState<Item[]>(items);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const updateBidAmounts = async () => {
    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const scrapedData = await scraper.scrapeItem(item.url);
            if (!scrapedData) return item;

            const updatedItem = {
              ...item,
              bid: scrapedData.bid,
              currentBid: scrapedData.currentBid,
            };

            // Only update if bid or currentBid has changed
            if (updatedItem.bid !== item.bid || updatedItem.currentBid !== item.currentBid) {
              await onEditItem(updatedItem);
            }

            return updatedItem;
          } catch (error) {
            console.error(`Failed to update item ${item.id}:`, error);
            return item;
          }
        })
      );
    } catch (error) {
      console.error('Failed to update bid amounts:', error);
    }
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      const rate = await exchangeRateService.getExchangeRate();
      setExchangeRate(rate);
    };

    fetchExchangeRate();
    // Update rate every hour
    const rateInterval = setInterval(fetchExchangeRate, 1000 * 60 * 60);

    // Update time remaining and bid amounts every minute
    const timeInterval = setInterval(() => {
      forceUpdate({});
      updateBidAmounts();
    }, 1000 * 60);

    return () => {
      clearInterval(rateInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const bgColor = useColorModeValue('white', 'gray.900');
  const subItemBgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.700', 'gray.800');

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      try {
        await onDeleteItem(selectedItem);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const getTimeRemaining = (date: string) => {
    const endDate = new Date(date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeRemainingColor = (date: string) => {
    const endDate = new Date(date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'gray.500';
    
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes > 60) return 'green.500';
    if (minutes > 10) return 'orange.500';
    return 'red.500';
  };

  const getSellerName = (url: string) => {
    const knownSeller = knownSellers.find(seller => seller.url === url);
    if (knownSeller) {
      return knownSeller.name;
    }
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const renderItem = (item: Item, isSubItem = false, mainItemDate?: string) => (
    <Tr
      key={item.id}
      bg={isSubItem ? bgColor : subItemBgColor}
      borderBottomWidth="2px"
      borderBottomColor="gray.600"
      fontSize="1rem"
      mb={!isSubItem ? "20px" : "0"}
    >
      <Td>
        <Flex align="center" gap={4}>
          <Box
            position="relative"
            width={isSubItem ? "60px" : "80px"}
            height={isSubItem ? "85px" : "115px"}
            marginLeft={isSubItem ? "15px" : "0"}
            overflow="hidden"
            borderRadius="md"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={isSubItem ? "160px" : "200px"}
              height={isSubItem ? "210px" : "270px"}
              position="absolute"
              objectFit="cover"
              top="070%"
              left="50%"
              transform="translate(-50%, -50%)"
              objectPosition="55% 55%"
            />
          </Box>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            color="blue.500"
            _hover={{ textDecoration: 'underline' }}
            fontWeight={isSubItem ? 'normal' : 'bold'}
            fontSize="1rem"
          >
            {item.name}
            <Icon as={FiExternalLink} ml={1} boxSize={3} />
          </Link>
        </Flex>
      </Td>
      <Td>
        <Text fontSize="1rem" color={isSubItem && mainItemDate && new Date(item.date) < new Date(mainItemDate) ? 'red.500' : 'white'}>
          {(() => {
            const date = new Date(item.date);
            date.setHours(date.getHours() + 4);
            return date.toLocaleString();
          })()}
        </Text>
        <Text fontSize="0.875rem" color={getTimeRemainingColor(item.date)}>
          {(() => {
            const date = new Date(item.date);
            date.setHours(date.getHours() + 4);
            return getTimeRemaining(date.toISOString());
          })()}
        </Text>
      </Td>
      <Td>
        <Link
          href={item.sellerUrl}
          target="_blank"
          rel="noopener noreferrer"
          color="blue.500"
          _hover={{ textDecoration: 'underline' }}
          fontSize="1rem"
        >
          {item.seller || getSellerName(item.sellerUrl)}
          <Icon as={FiExternalLink} ml={1} boxSize={3} />
        </Link>
      </Td>
      <Td>
        <Text fontSize="1rem">{item.auctions || 0}</Text>
      </Td>
      <Td>
        <Text 
          fontSize="1rem" 
          fontWeight="medium"
          color={item.bid && item.currentBid && item.bid > item.currentBid ? 'green.500' : 'inherit'}
        >
          {item.bid && item.bid > 0 ? `$${item.bid.toFixed(2)}` : ''}
          {item.bid && item.bid > 0 && item.currentBid && item.bid > item.currentBid && new Date(item.date) < new Date() && ' 🎉'}
        </Text>
      </Td>
      <Td>
        <Text fontSize="1rem" fontWeight="medium">
          {item.currentBid ? `$${item.currentBid.toFixed(2)}` : '-'}
        </Text>
      </Td>
      <Td>
        <Text fontSize="1rem">${(item.market * exchangeRate).toFixed(2)} USD</Text>
        <Text fontSize="0.875rem" color="gray.500">
          ${item.market.toFixed(2)} CAD
        </Text>
      </Td>
      <Td>
        {!isArchive ? (
          <Flex gap={2}>
            <IconButton
              aria-label="Edit item"
              icon={<Icon as={FiEdit2} />}
              size="sm"
              colorScheme="gray"
              onClick={() => handleEdit(item)}
            />
            <IconButton
              aria-label="Delete item"
              icon={<Icon as={FiTrash2} />}
              size="sm"
              colorScheme="gray"
              onClick={() => handleDelete(item)}
            />
            {onArchiveItem && (
              <IconButton
                aria-label="Archive item"
                icon={<Icon as={FiArchive} />}
                size="sm"
                colorScheme="gray"
                onClick={() => onArchiveItem(item.id!)}
              />
            )}
          </Flex>
        ) : (
          <Flex gap={2}>
            {onRestoreItem && (
              <IconButton
                aria-label="Restore item"
                icon={<Icon as={FiRefreshCw} />}
                size="sm"
                colorScheme="gray"
                onClick={() => onRestoreItem(item.id!)}
              />
            )}
          </Flex>
        )}
      </Td>
    </Tr>
  );

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th fontSize="1rem">Item</Th>
            <Th fontSize="1rem">End time</Th>
            <Th fontSize="1rem">Seller</Th>
            <Th fontSize="1rem">Bids</Th>
            <Th fontSize="1rem">My bid</Th>
            <Th fontSize="1rem">Current</Th>
            <Th fontSize="1rem">Market</Th>
            <Th fontSize="1rem">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {localItems.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem(item)}
              {item.subItems?.map((subItem) => renderItem(subItem, true, item.date))}
              <Tr>
                <Td colSpan={8} h="20px" p={0}></Td>
              </Tr>
            </React.Fragment>
          ))}
        </Tbody>
      </Table>

      {!isArchive && selectedItem && (
        <>
          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            onEdit={onEditItem}
            item={selectedItem}
          />
          <DeleteItemModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedItem(null);
            }}
            onDelete={handleDeleteConfirm}
            itemName={selectedItem.name}
          />
        </>
      )}
    </Box>
  );
};

export default ItemsTable; 