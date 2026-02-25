'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Database, Server } from 'lucide-react';

interface ApiDocSelectorProps {
  currentApi: string;
}

export function ApiDocSelector({ currentApi }: ApiDocSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApiChange = (api: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('api', api);
    router.push(`/api-docu?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">API Documentation</h1>

          <div className="flex gap-2">
            <button
              onClick={() => handleApiChange('nextjs')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                currentApi === 'nextjs'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Server className="h-4 w-4" />
              Next.js API
            </button>

            <button
              onClick={() => handleApiChange('supabase')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                currentApi === 'supabase'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Database className="h-4 w-4" />
              Supabase REST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
