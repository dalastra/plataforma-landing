'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';

export default function OportunidadesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/descoberta');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm">Redirecionando para o Mapa & Criador de Sites...</p>
    </div>
  );
}
