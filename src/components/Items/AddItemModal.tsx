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
  Select,
  Grid,
  GridItem,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { knownSellers } from '@/types/seller';
import { scraper } from '@/services/scraper';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => Promise<void>;
}

const AddItemModal = ({ isOpen, onClose, onAdd }: AddItemModalProps) => {
  const initialFormData = {
    name: '',
    url: '',
    imageUrl: '',
    sellerUrl: '',
    bid: 0,
    currentBid: 0,
    market: 0,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:00',
    auctions: 0
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState<Omit<Item, 'id'>>(initialFormData);
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  const toast = useToast();

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to local timezone without modifying the actual time
    const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedSeller('');
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('📝 [Modal] Input changed:', { name, value });
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bid' || name === 'currentBid' || name === 'market' 
        ? parseFloat(value) || 0 
        : value
    }));

    // If URL is changed and it's a Card Hobby URL, fetch the data
    if (name === 'url' && value.match(/cardhobby\.com\/#\/carddetails\/\d+/)) {
      console.log('🔍 [Modal] Detected Card Hobby URL, starting fetch process');
      setIsFetching(true);
      try {
        console.log('📡 [Modal] Calling scraper service...');
        const scrapedData = await scraper.scrapeItem(value);
        console.log('✅ [Modal] Received scraped data:', scrapedData);
        
        setFormData(prev => {
          const newData = {
            ...prev,
            ...scrapedData,
            date: formatDateForInput(new Date(new Date(scrapedData.date).getTime() - 24 * 60 * 60 * 1000).toISOString())
          };
          console.log('📝 [Modal] Updated form data:', newData);
          return newData;
        });
        
        toast({
          title: 'Success',
          description: 'Item details fetched successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('❌ [Modal] Error fetching item details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch item details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsFetching(false);
        console.log('✅ [Modal] Fetch process completed');
      }
    }
  };

  const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sellerId = e.target.value;
    setSelectedSeller(sellerId);
    
    if (sellerId) {
      const seller = knownSellers.find(s => s.id === sellerId);
      if (seller) {
        setFormData(prev => ({
          ...prev,
          sellerUrl: seller.url
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        sellerUrl: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onAdd(formData);
      toast({
        title: 'Success',
        description: 'Item added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
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
  };

  // Add useEffect to reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Item</ModalHeader>
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

            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Auctions</FormLabel>
                  <Input
                    name="auctions"
                    type="number"
                    value={formData.auctions}
                    onChange={handleInputChange}
                    placeholder="Number of auctions"
                    isReadOnly
                  />
                </FormControl>
              </GridItem>
            </Grid>
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
            isDisabled={isFetching}
          >
            Add Item
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal; 