'use client';

// import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Comentado para evitar chamadas desnecessárias a /auth/session
    // <SessionProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    // </SessionProvider>
  );
} 