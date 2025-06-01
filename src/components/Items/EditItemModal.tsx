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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Item } from '@/types/item';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: Item) => void;
  item: Item | null;
}

const EditItemModal = ({ isOpen, onClose, onEdit, item }: EditItemModalProps) => {
  const [formData, setFormData] = useState<Item | null>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onEdit(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === 'bid' || name === 'market' || name === 'currentBid' ? parseFloat(value) : value,
      };
    });
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>URL</FormLabel>
                <Input
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="Enter item URL"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Seller URL</FormLabel>
                <Input
                  name="sellerUrl"
                  value={formData.sellerUrl}
                  onChange={handleChange}
                  placeholder="Enter seller URL"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Bid Amount</FormLabel>
                <Input
                  name="bid"
                  type="number"
                  value={formData.bid}
                  onChange={handleChange}
                  placeholder="Enter bid amount"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Current Bid</FormLabel>
                <Input
                  name="currentBid"
                  type="number"
                  value={formData.currentBid || 0}
                  onChange={handleChange}
                  placeholder="Enter current bid"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Market Value</FormLabel>
                <Input
                  name="market"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.market}
                  onChange={handleChange}
                  placeholder="Enter market value"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="datetime-local"
                  value={formData.date.slice(0, 16)}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditItemModal; 