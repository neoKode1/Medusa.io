// pages/_app.js

import Head from 'next/head';
import '../styles/globals.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // You can customize your theme here
  breakpoints: {
    values: {
      xs: 0,
      sm: 400,
      md: 567,
      lg: 768,
      xl: 1280,
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
