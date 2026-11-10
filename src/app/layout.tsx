import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'LeadCraft AI | Prospecção Inteligente & Landing Pages',
  description: 'Plataforma para prospecção de negócios locais e geração automática de landing pages com inteligência artificial.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased">
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
