'use client';

import { ChakraProvider, Box, Button, Container, Heading, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, useToast, Input, Text } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import { useState } from 'react';
import theme from '@/theme';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  seller: {
    username: string;
  };
  endedDate: string;
}

export default function EbayResearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<EbayItem[]>([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const toast = useToast();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const headerColor = useColorModeValue('gray.600', 'gray.200');
  const colorMode = useColorModeValue('light', 'dark');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const boxBg = useColorModeValue('white', 'gray.800');

  const handleTestAuth = async () => {
    setIsTestingAuth(true);
    try {
      const response = await axios.get('/api/ebay/test-auth');
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'eBay credentials are valid',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.details || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingAuth(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter search keywords');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ebay/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: searchQuery,
          limit: 100,
          filters: {
            soldItemsOnly: true,
            deliveryCountry: 'CA'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: { value: string; currency: string }) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: price.currency
    }).format(parseFloat(price.value));
  };

  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="lg" mb={4}>eBay Research</Heading>
              <Text color={textColor} mb={6}>
                Search for items on eBay and analyze their sales data.
              </Text>
            </Box>

            <Box
              p={6}
              bg={boxBg}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <HStack justify="space-between">
                <Heading size="lg">eBay Research</Heading>
                <HStack spacing={4}>
                  <Button 
                    colorScheme="blue" 
                    onClick={handleTestAuth}
                    isLoading={isTestingAuth}
                  >
                    Test eBay Auth
                  </Button>
                  <Button 
                    colorScheme="blue"
                    onClick={handleSearch}
                    isLoading={isLoading}
                  >
                    Search
                  </Button>
                </HStack>
              </HStack>

              <Input
                placeholder="Enter keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                size="lg"
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                color={colorMode === 'dark' ? 'white' : 'gray.800'}
                _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                _hover={{
                  borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                }}
                _focus={{
                  borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                  boxShadow: `0 0 0 1px ${colorMode === 'dark' ? 'blue.400' : 'blue.500'}`,
                }}
              />

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th bg={headerBg} color={headerColor} borderColor={borderColor}>Date Sold</Th>
                      <Th bg={headerBg} color={headerColor} borderColor={borderColor}>Name</Th>
                      <Th bg={headerBg} color={headerColor} borderColor={borderColor} isNumeric>Price</Th>
                      <Th bg={headerBg} color={headerColor} borderColor={borderColor}>Seller</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((item) => (
                      <Tr key={item.itemId}>
                        <Td borderColor={borderColor}>{formatDate(item.endedDate)}</Td>
                        <Td borderColor={borderColor}>{item.title}</Td>
                        <Td borderColor={borderColor} isNumeric>{formatPrice(item.price)}</Td>
                        <Td borderColor={borderColor}>{item.seller.username}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </Container>
      </Layout>
    </ChakraProvider>
  );
} 