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
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiChevronRight, FiArchive, FiExternalLink } from 'react-icons/fi';
import { Item } from '@/types/item';
import EditItemModal from './EditItemModal';
import DeleteItemModal from './DeleteItemModal';
import { useState } from 'react';

interface ItemsTableProps {
  items: Item[];
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onArchiveItem?: (id: number) => void;
  isArchive?: boolean;
}

const ItemsTable = ({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onArchiveItem,
  isArchive = false,
}: ItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const getSellerName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const renderItem = (item: Item, isSubItem = false) => (
    <Tr
      key={item.id}
      bg={isSubItem ? subItemBgColor : bgColor}
      borderBottomWidth="2px"
      borderBottomColor="gray.600"
      fontSize="18px"
    >
      <Td>
        <Flex align="center" gap={4}>
          <Box
            position="relative"
            width={isSubItem ? "80px" : "100px"}
            height={isSubItem ? "105px" : "135px"}
            marginLeft={isSubItem ? "20px" : "0"}
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
              top="50%"
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
          >
            {item.name}
            <Icon as={FiExternalLink} ml={1} boxSize={3} />
          </Link>
        </Flex>
      </Td>
      <Td>
        <Link
          href={item.sellerUrl}
          target="_blank"
          rel="noopener noreferrer"
          color="blue.500"
          _hover={{ textDecoration: 'underline' }}
        >
          {getSellerName(item.sellerUrl)}
          <Icon as={FiExternalLink} ml={1} boxSize={3} />
        </Link>
      </Td>
      <Td>${item.bid.toFixed(2)}</Td>
      <Td>${item.currentBid?.toFixed(2) || '0.00'}</Td>
      <Td>${item.market.toFixed(2)}</Td>
      <Td>
        <Text>{new Date(item.date).toLocaleString()}</Text>
        <Text fontSize="sm" color="gray.500">{getTimeRemaining(item.date)}</Text>
      </Td>
      <Td>
        {!isArchive && (
          <Flex gap={2}>
            <IconButton
              aria-label="Edit item"
              icon={<Icon as={FiEdit2} />}
              size="sm"
              onClick={() => handleEdit(item)}
            />
            <IconButton
              aria-label="Delete item"
              icon={<Icon as={FiTrash2} />}
              size="sm"
              colorScheme="red"
              onClick={() => handleDelete(item)}
            />
            {onArchiveItem && (
              <IconButton
                aria-label="Archive item"
                icon={<Icon as={FiArchive} />}
                size="sm"
                colorScheme="purple"
                onClick={() => onArchiveItem(item.id!)}
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
            <Th>Item</Th>
            <Th>Seller</Th>
            <Th>Bid</Th>
            <Th>Current</Th>
            <Th>Market</Th>
            <Th>Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <>
              {renderItem(item)}
              {item.subItems?.map((subItem) => renderItem(subItem, true))}
            </>
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
            onDelete={() => {
              onDeleteItem(selectedItem);
              setIsDeleteModalOpen(false);
            }}
            itemName={selectedItem.name}
          />
        </>
      )}
    </Box>
  );
};

export default ItemsTable; 