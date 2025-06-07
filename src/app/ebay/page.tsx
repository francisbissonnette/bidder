'use client';

import { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  ChakraProvider,
  Input,
  Button,
  Box,
  Text,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import theme from '@/theme';
import Layout from '@/components/Layout/Layout';
import { ebay } from '@/services/ebay';

interface SalesData {
  date: string;
  price: number;
  quantity: number;
}

interface PriceData {
  date: string;
  price: number;
}

export default function EbayPage() {
  const [itemId, setItemId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [salesHistory, setSalesHistory] = useState<SalesData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSearch = async () => {
    if (!itemId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an item ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both sales and price history in parallel
      const [salesResponse, priceResponse] = await Promise.all([
        ebay.getItemSalesHistory(itemId),
        ebay.getItemPriceHistory(itemId)
      ]);

      // Process sales history data
      const salesData = salesResponse.records?.map((record: any) => ({
        date: new Date(record.date).toLocaleDateString(),
        price: record.price,
        quantity: record.quantity
      })) || [];

      // Process price history data
      const priceData = priceResponse.records?.map((record: any) => ({
        date: new Date(record.date).toLocaleDateString(),
        price: record.price
      })) || [];

      setSalesHistory(salesData);
      setPriceHistory(priceData);

      if (salesData.length === 0 && priceData.length === 0) {
        setError('No data found for this item');
      }
    } catch (err) {
      console.error('Error fetching eBay data:', err);
      setError('Failed to fetch data. Please check the item ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const prices = data.map(d => d.price);
    return {
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const salesStats = calculateStats(salesHistory);
  const priceStats = calculateStats(priceHistory);

  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Container maxW="container.2xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading size="lg">eBay Marketplace Insights</Heading>

            <Box>
              <Text mb={2}>Enter eBay Item ID:</Text>
              <Input
                placeholder="e.g., 123456789012"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                maxW="300px"
                mr={4}
              />
              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={isLoading}
                mt={4}
              >
                Search
              </Button>
            </Box>

            {isLoading && (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" />
                <Text mt={4}>Fetching data...</Text>
              </Box>
            )}

            {error && (
              <Box p={4} bg="red.100" borderRadius="md">
                <Text color="red.600">{error}</Text>
              </Box>
            )}

            {!isLoading && !error && (salesHistory.length > 0 || priceHistory.length > 0) && (
              <>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Average Sales Price</StatLabel>
                        <StatNumber>${salesStats.avg.toFixed(2)}</StatNumber>
                        <StatHelpText>
                          Min: ${salesStats.min.toFixed(2)} | Max: ${salesStats.max.toFixed(2)}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Average Price History</StatLabel>
                        <StatNumber>${priceStats.avg.toFixed(2)}</StatNumber>
                        <StatHelpText>
                          Min: ${priceStats.min.toFixed(2)} | Max: ${priceStats.max.toFixed(2)}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Tabs>
                  <TabList>
                    <Tab>Sales History</Tab>
                    <Tab>Price History</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Box h="400px">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="price"
                              stroke="#8884d8"
                              name="Price"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="quantity"
                              stroke="#82ca9d"
                              name="Quantity"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Box h="400px">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#8884d8"
                              name="Price"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </VStack>
        </Container>
      </Layout>
    </ChakraProvider>
  );
} 