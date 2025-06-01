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
import { useState } from 'react';
import { Item } from '@/types/item';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
}

const AddItemModal = ({ isOpen, onClose, onAdd }: AddItemModalProps) => {
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    name: '',
    url: '',
    imageUrl: '',
    sellerUrl: '',
    bid: 0,
    currentBid: 0,
    market: 1,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:00',
  });

  const initialFormData = {
    name: '',
    url: '',
    imageUrl: '',
    sellerUrl: '',
    bid: 0,
    currentBid: 0,
    market: 1,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:00',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      await onAdd(formData);
      setFormData(initialFormData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'bid' || name === 'market' || name === 'currentBid' ? parseFloat(value) : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add New Item</ModalHeader>
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
                  value={formData.currentBid}
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
              Add Item
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal; 