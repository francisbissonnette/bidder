'use client';

import { Box, Flex, Link, Text, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path: string) => pathname === path;

  return (
    <Box minH="100vh">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding={6}
        bg={useColorModeValue('white', 'gray.800')}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex align="center" mr={5}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={useColorModeValue('gray.800', 'white')}
          >
            Bidder
          </Text>
        </Flex>

        <Flex align="center" gap={4}>
          <Link
            as={NextLink}
            href="/"
            color={isActive('/') ? 'blue.500' : useColorModeValue('gray.600', 'gray.300')}
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Home
          </Link>
          <Link
            as={NextLink}
            href="/ebay"
            color={isActive('/ebay') ? 'blue.500' : useColorModeValue('gray.600', 'gray.300')}
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            eBay
          </Link>
          <Link
            as={NextLink}
            href="/ebay-research"
            color={isActive('/ebay-research') ? 'blue.500' : useColorModeValue('gray.600', 'gray.300')}
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Card Research
          </Link>
          <Link
            as={NextLink}
            href="/archives"
            color={isActive('/archives') ? 'blue.500' : useColorModeValue('gray.600', 'gray.300')}
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Archives
          </Link>
        </Flex>
      </Flex>

      <Box as="main" p={4}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 