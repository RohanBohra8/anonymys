import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
//import AuthProvider from '../context/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/context/authProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anonymys',
  description: 'Real Anonymous messages to real people.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      <AuthProvider>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}

