'use client';
// from  client api  of nextAuth docs  we copied session provider
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode; // type of children 
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  ); 
  
}

// we will wrap this entire auth provider with Layut.tsx file in src
