import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#1D1D1D' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.400',
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
  },
});

export default theme; 