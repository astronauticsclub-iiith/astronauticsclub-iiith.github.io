'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { withBasePath } from './common/HelperFunction';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider basePath={withBasePath(`/api/auth`)}>
      {children}
    </SessionProvider>
  );
}