import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  components: {
    Table: {
      baseStyle: {
        th: {
          borderColor: 'gray.900',
          color: 'gray.400',
          fontWeight: 'bold',
          textTransform: 'none',
          letterSpacing: 'normal',
          fontSize: '2xl',
          py: 6,
        },
        td: {
          borderColor: 'gray.900',
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
      },
      variants: {
        solid: {
          bg: 'blue.500',
          color: 'white',
          _hover: {
            bg: 'blue.600',
          },
        },
      },
    },
    IconButton: {
      baseStyle: {
        bg: 'transparent',
        _hover: {
          bg: 'gray.700',
        },
      },
    },
    Link: {
      baseStyle: {
        _hover: {
          textDecoration: 'none',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'gray.900',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: '#0a0a0a',
        color: 'white',
      },
    },
  },
});

export default theme; 