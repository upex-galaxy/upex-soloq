'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Key, Cookie, FileText } from 'lucide-react';

interface AuthInfoPanelProps {
  apiType: string;
}

export function AuthInfoPanel({ apiType }: AuthInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isNextJs = apiType === 'nextjs';

  // Cookie name for SoloQ Supabase project
  const cookieName = 'sb-czuusjchqpgvanvbdrnz-auth-token';

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {isNextJs ? (
              <Cookie className="h-4 w-4 text-blue-500" />
            ) : (
              <Key className="h-4 w-4 text-green-500" />
            )}
            <span className="font-medium">
              {isNextJs ? 'Cookie-based Authentication' : 'API Key + JWT Authentication'}
            </span>
            <span className="text-muted-foreground">- Click for quick reference</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="grid gap-4 pb-4 md:grid-cols-2">
            {isNextJs ? (
              <>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Cookie className="h-4 w-4 text-blue-500" />
                    Most Endpoints (Cookie Auth)
                  </h4>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Supabase session cookies are sent automatically from the browser.
                  </p>
                  <code className="block overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                    Cookie: {cookieName}=...
                  </code>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Key className="h-4 w-4 text-amber-500" />
                    Special Endpoints
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <strong>Cron jobs:</strong> Authorization: Bearer CRON_SECRET
                    </p>
                    <p>
                      <strong>Testing:</strong> X-API-Key: [your-key]
                    </p>
                    <p>
                      <strong>Webhooks:</strong> Signature header from provider
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Key className="h-4 w-4 text-green-500" />
                    Required Headers
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="mb-1 text-muted-foreground">Always required:</p>
                      <code className="block rounded bg-muted px-2 py-1">
                        apikey: {'<SUPABASE_ANON_KEY>'}
                      </code>
                    </div>
                    <div>
                      <p className="mb-1 text-muted-foreground">For authenticated requests:</p>
                      <code className="block rounded bg-muted px-2 py-1">
                        Authorization: Bearer {'<JWT_TOKEN>'}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Getting the JWT
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Login via Supabase Auth, then extract the access_token from the session. See{' '}
                    <code className="rounded bg-muted px-1">docs/api-testing/</code> for detailed
                    guides.
                  </p>
                </div>
              </>
            )}
            <div className="mt-2 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground md:col-span-2">
              <FileText className="h-4 w-4" />
              <span>
                For detailed guides and Postman collections, see{' '}
                <code className="rounded bg-muted px-1">docs/api-testing/</code>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
