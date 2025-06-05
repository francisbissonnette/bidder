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
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState<Omit<Item, 'id'>>(initialFormData);
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  const toast = useToast();

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
            ...scrapedData
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent 
        maxW="660px" 
        w="660px"
        sx={{
          width: '660px !important',
          maxWidth: '660px !important'
        }}
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add New Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="300px 300px" gap={4} justifyContent="center">
              <GridItem>
                <VStack spacing={4}>
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
                    <FormLabel>URL</FormLabel>
                    <InputGroup>
                      <Input
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        placeholder="Enter item URL"
                      />
                      {isFetching && (
                        <InputRightElement>
                          <Button size="sm" isLoading />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Seller</FormLabel>
                    <Select
                      value={selectedSeller}
                      onChange={handleSellerChange}
                      placeholder="Select a seller"
                    >
                      {knownSellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Seller URL</FormLabel>
                    <Input
                      name="sellerUrl"
                      value={formData.sellerUrl}
                      onChange={handleInputChange}
                      placeholder="Enter seller URL"
                    />
                  </FormControl>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Bid Amount</FormLabel>
                    <Input
                      name="bid"
                      type="number"
                      value={formData.bid}
                      onChange={handleInputChange}
                      placeholder="Enter bid amount"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Current Bid</FormLabel>
                    <Input
                      name="currentBid"
                      type="number"
                      value={formData.currentBid}
                      onChange={handleInputChange}
                      placeholder="Enter current bid"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Market Value</FormLabel>
                    <Input
                      name="market"
                      type="number"
                      value={formData.market}
                      onChange={handleInputChange}
                      placeholder="Enter market value"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </VStack>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
            >
              Add Item
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddItemModal; 