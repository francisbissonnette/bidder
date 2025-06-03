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
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  useEffect(() => {
    if (item) {
      setFormData(item);
      // Find the seller ID based on the sellerUrl
      const seller = knownSellers.find(s => s.url === item.sellerUrl);
      if (seller) {
        setSelectedSeller(seller.id);
      }
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      await onEdit(formData);
      setFormData(null);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === 'bid' || name === 'market' || name === 'currentBid' ? parseFloat(value) : value,
      };
    });
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent width="660px" maxW="660px" sx={{
        width: '660px !important',
        maxWidth: '660px !important'
      }}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Item</ModalHeader>
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
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>URL</FormLabel>
                    <Input
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Seller</FormLabel>
                    <Select
                      value={selectedSeller}
                      onChange={handleSellerChange}
                      placeholder="Select a seller"
                    >
                      {knownSellers.map((seller) => (
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
                    />
                  </FormControl>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Bid Amount</FormLabel>
                    <Input
                      name="bid"
                      type="number"
                      step="0.01"
                      value={formData.bid}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Current Bid</FormLabel>
                    <Input
                      name="currentBid"
                      type="number"
                      step="0.01"
                      value={formData.currentBid || ''}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Market Value</FormLabel>
                    <Input
                      name="market"
                      type="number"
                      step="0.01"
                      value={formData.market}
                      onChange={handleInputChange}
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