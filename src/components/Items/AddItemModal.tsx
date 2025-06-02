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
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Item } from '@/types/item';
import { scraperService } from '@/services/scraper';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => Promise<void>;
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

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

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
      try {
        setIsLoading(true);
        await onAdd(formData);
        setFormData(initialFormData);
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add item',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'bid' || name === 'market' || name === 'currentBid' ? parseFloat(value) : value,
    }));
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));

    if (url && url.startsWith('http')) {
      try {
        setIsLoading(true);
        const scrapedData = await scraperService.scrapeItem(url);
        setFormData(prev => ({
          ...prev,
          ...scrapedData,
        }));
        toast({
          title: 'Success',
          description: 'Item details scraped successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to scrape item details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
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
                <FormLabel>URL</FormLabel>
                <Input
                  name="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  placeholder="Enter item URL"
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Seller URL</FormLabel>
                <Input
                  name="sellerUrl"
                  value={formData.sellerUrl}
                  onChange={handleChange}
                  placeholder="Enter seller URL"
                  isDisabled={isLoading}
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
                  isDisabled={isLoading}
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
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Market Value (CAD)</FormLabel>
                <Input
                  name="market"
                  type="number"
                  value={formData.market}
                  onChange={handleChange}
                  placeholder="Enter market value"
                  isDisabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  isDisabled={isLoading}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isLoading}>
              Add Item
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal; 