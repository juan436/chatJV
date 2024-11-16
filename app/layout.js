'use client'
import { SessionProvider } from 'next-auth/react';
import { CssBaseline } from '@mui/material';
import { SWRConfig } from 'swr';
import { SnackbarProvider } from 'notistack';
import './globals.css';
import CustomSnackbar from '@/components/utils/CustomSnackbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SnackbarProvider
            autoHideDuration={3000}
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            Components={{
              success: CustomSnackbar,
              error: CustomSnackbar,
            }}
          >
            <SWRConfig
              value={{
                fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
              }}
            >
              <CssBaseline />
                  {children}
            </SWRConfig>
          </SnackbarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}