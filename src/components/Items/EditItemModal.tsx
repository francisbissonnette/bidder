import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { knownSellers } from '@/types/seller';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: Item) => void;
  item: Item | null;
}

const EditItemModal = ({ isOpen, onClose, onEdit, item }: EditItemModalProps) => {
  const [formData, setFormData] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to local timezone without modifying the actual time
    const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        date: formatDateForInput(item.date)
      });
      // Find the seller ID based on the sellerUrl
      const seller = knownSellers.find(s => s.url === item.sellerUrl);
      if (seller) {
        setSelectedSeller(seller.id);
      }
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      const updatedItem = {
        ...prev,
        [name]: name === 'bid' || name === 'currentBid' || name === 'market' 
          ? parseFloat(value) || 0 
          : value
      };
      return updatedItem;
    });
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsLoading(true);
    try {
      await onEdit(formData);
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sellerId = e.target.value;
    setSelectedSeller(sellerId);
    
    if (sellerId) {
      const seller = knownSellers.find(s => s.id === sellerId);
      if (seller) {
        setFormData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            sellerUrl: seller.url
          };
        });
      }
    } else {
      setFormData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sellerUrl: ''
        };
      });
    }
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>URL</FormLabel>
              <Input
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="Enter item URL"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Image URL</FormLabel>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Seller URL</FormLabel>
              <Input
                name="sellerUrl"
                value={formData.sellerUrl}
                onChange={handleInputChange}
                placeholder="Enter seller URL"
              />
            </FormControl>

            <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Bid</FormLabel>
                  <Input
                    name="bid"
                    type="number"
                    value={formData.bid}
                    onChange={handleInputChange}
                    placeholder="Enter bid amount"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Current Bid</FormLabel>
                  <Input
                    name="currentBid"
                    type="number"
                    value={formData.currentBid}
                    onChange={handleInputChange}
                    placeholder="Enter current bid"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Market Value (CAD)</FormLabel>
                  <Input
                    name="market"
                    type="number"
                    value={formData.market}
                    onChange={handleInputChange}
                    placeholder="Enter market value"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired>
              <FormLabel>End time</FormLabel>
              <Input
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditItemModal; 