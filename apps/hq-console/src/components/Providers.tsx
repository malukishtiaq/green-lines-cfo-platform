'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { ReactNode, useEffect } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Suppress antd React 19 compatibility warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const warning = args.join(' ');
      // Suppress antd React compatibility warnings (antd v5 works fine with React 19)
      if (warning.includes('antd: compatible') || warning.includes('antd v5 support React')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
