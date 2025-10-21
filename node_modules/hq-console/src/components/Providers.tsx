'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
