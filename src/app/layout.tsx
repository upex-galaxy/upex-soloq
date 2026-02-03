import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/components/providers/query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoloQ - Facturación para Freelancers',
  description:
    'Plataforma de facturación profesional diseñada para freelancers y trabajadores independientes en Latinoamérica.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
