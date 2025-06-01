import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Image,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiChevronRight, FiArchive } from 'react-icons/fi';
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const subItemBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const renderItem = (item: Item, isSubItem = false) => (
    <Tr
      key={item.id}
      bg={isSubItem ? subItemBgColor : bgColor}
      borderLeft={isSubItem ? '4px solid' : 'none'}
      borderLeftColor={isSubItem ? 'blue.500' : undefined}
    >
      <Td>
        <Flex align="center" gap={4}>
          {isSubItem && <Icon as={FiChevronRight} color="blue.500" />}
          <Box
            position="relative"
            width={isSubItem ? "75px" : "150px"}
            height={isSubItem ? "75px" : "150px"}
            overflow="hidden"
            borderRadius="md"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={isSubItem ? "75px" : "150px"}
              height="auto"
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              objectFit="none"
              objectPosition="55% 55%"
            />
          </Box>
          <Text fontWeight={isSubItem ? 'normal' : 'bold'}>{item.name}</Text>
        </Flex>
      </Td>
      <Td>
        <Text
          as="a"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          color="blue.500"
          _hover={{ textDecoration: 'underline' }}
        >
          View Item
        </Text>
      </Td>
      <Td>
        <Text
          as="a"
          href={item.sellerUrl}
          target="_blank"
          rel="noopener noreferrer"
          color="blue.500"
          _hover={{ textDecoration: 'underline' }}
        >
          View Seller
        </Text>
      </Td>
      <Td>${item.bid.toFixed(2)}</Td>
      <Td>${item.currentBid?.toFixed(2) || '0.00'}</Td>
      <Td>{item.market}</Td>
      <Td>{new Date(item.date).toLocaleString()}</Td>
      <Td>
        {!isArchive && (
          <Flex gap={2}>
            <Button
              size="sm"
              leftIcon={<Icon as={FiEdit2} />}
              onClick={() => handleEdit(item)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={() => handleDelete(item)}
            >
              Delete
            </Button>
            {onArchiveItem && (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<Icon as={FiArchive} />}
                onClick={() => onArchiveItem(item.id!)}
              >
                Archive
              </Button>
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
            <Th>Item URL</Th>
            <Th>Seller URL</Th>
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