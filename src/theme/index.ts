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
      600: '#353535',
      700: '#282828',
      800: '#232323',
      900: '#1D1D1D',
    },
  },
  components: {
    Table: {
      baseStyle: {
        th: {
          borderWidth: 0,
          borderColor: 'gray.700',
          color: 'gray.400',
          fontWeight: 'bold',
          textTransform: 'none',
          letterSpacing: 'wider',
          fontSize: '16px',
          py: 4,
        },
        td: {
          borderWidth: 0,
        },
        tr: {
        
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
        bg: '#171616',
        color: 'white',
      },
    },
  },
});

export default theme; 