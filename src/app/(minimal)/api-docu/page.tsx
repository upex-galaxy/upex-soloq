import { notFound } from 'next/navigation';
import { RedocViewer } from './redoc-viewer';
import { ApiDocSelector } from './api-doc-selector';
import { AuthInfoPanel } from './auth-info-panel';

// Check if we're in an allowed environment
function isAllowedEnvironment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv) {
    // On Vercel: allow preview (staging), block production
    return vercelEnv !== 'production';
  }

  // Local development: always allow
  return process.env.NODE_ENV === 'development';
}

interface PageProps {
  searchParams: Promise<{ api?: string }>;
}

export default async function ApiDocuPage({ searchParams }: PageProps) {
  // Return 404 in production
  if (!isAllowedEnvironment()) {
    notFound();
  }

  const params = await searchParams;
  const apiType = params.api || 'nextjs';

  // Build the OpenAPI spec URL based on selected API
  const specUrl =
    apiType === 'supabase'
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      : '/api/openapi';

  return (
    <div className="min-h-screen bg-background">
      <ApiDocSelector currentApi={apiType} />
      <AuthInfoPanel apiType={apiType} />
      <RedocViewer specUrl={specUrl} />
    </div>
  );
}
