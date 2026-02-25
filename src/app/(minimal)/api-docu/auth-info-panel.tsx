'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Key,
  Cookie,
  FileText,
  Terminal,
  Copy,
  Check,
  Zap,
  Shield,
} from 'lucide-react';

interface AuthInfoPanelProps {
  apiType: string;
}

// Supabase project configuration
const SUPABASE_URL = 'https://czuusjchqpgvanvbdrnz.supabase.co';
const COOKIE_NAME = 'sb-czuusjchqpgvanvbdrnz-auth-token';

export function AuthInfoPanel({ apiType }: AuthInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isNextJs = apiType === 'nextjs';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 rounded p-1 transition-colors hover:bg-muted"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {isNextJs ? (
              <Key className="h-4 w-4 text-amber-500" />
            ) : (
              <Key className="h-4 w-4 text-green-500" />
            )}
            <span className="font-medium">
              {isNextJs ? 'Authentication Guide' : 'API Key + JWT Authentication'}
            </span>
            <span className="text-muted-foreground">
              - {isNextJs ? 'Bearer Token & Cookies' : 'Click for quick reference'}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="space-y-6 pb-6">
            {isNextJs ? (
              <>
                {/* ============================================================
                    NEXT.JS API AUTHENTICATION
                    ============================================================ */}

                {/* Introduction */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                    <Shield className="h-5 w-5" />
                    Two Authentication Methods Available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The Next.js API supports both <strong>Bearer Token</strong> (for external
                    clients like Postman, mobile apps, or third-party integrations) and{' '}
                    <strong>Cookie-based</strong> authentication (automatic in browsers). Choose the
                    method that fits your use case.
                  </p>
                </div>

                {/* Flow Diagram */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Authentication Flow
                  </h4>
                  <div className="overflow-x-auto">
                    <pre className="text-xs leading-relaxed text-muted-foreground">
                      {`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    YOUR CLIENT                   SUPABASE AUTH                    NEXT.JS API
         │                              │                               │
         │  1. POST /auth/v1/token      │                               │
         │     { email, password }      │                               │
         │ ────────────────────────────>│                               │
         │                              │                               │
         │  2. { access_token: "eyJ.." }│                               │
         │ <────────────────────────────│                               │
         │                              │                               │
         │  3. GET /api/clients                                         │
         │     Authorization: Bearer eyJ...                             │
         │ ────────────────────────────────────────────────────────────>│
         │                              │                               │
         │                              │  4. Validates token           │
         │                              │<──────────────────────────────│
         │                              │                               │
         │                              │  5. Returns user data         │
         │                              │──────────────────────────────>│
         │                              │                               │
         │  6. 200 OK { clients: [...] }                                │
         │ <────────────────────────────────────────────────────────────│
         ▼                              ▼                               ▼
`}
                    </pre>
                  </div>
                </div>

                {/* Step 1: Get Token */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      1
                    </div>
                    Get Access Token (Login)
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        First, authenticate with Supabase to get your access token:
                      </p>
                    </div>

                    {/* Request */}
                    <div className="rounded border bg-muted/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium">Request</span>
                        <CopyButton
                          text={`POST ${SUPABASE_URL}/auth/v1/token?grant_type=password`}
                          field="login-url"
                        />
                      </div>
                      <code className="block text-xs">
                        <span className="text-green-600 dark:text-green-400">POST</span>{' '}
                        {SUPABASE_URL}/auth/v1/token?grant_type=password
                      </code>
                    </div>

                    {/* Headers */}
                    <div className="rounded border bg-muted/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium">Headers</span>
                        <CopyButton text="application/json" field="content-type" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400">apikey:</span>
                          <code className="rounded bg-background px-1">
                            {'<NEXT_PUBLIC_SUPABASE_ANON_KEY>'}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400">Content-Type:</span>
                          <code className="rounded bg-background px-1">application/json</code>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="rounded border bg-muted/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium">Body (JSON)</span>
                        <CopyButton
                          text='{\n  "email": "your-email@example.com",\n  "password": "your-password"\n}'
                          field="login-body"
                        />
                      </div>
                      <pre className="text-xs">
                        {`{
  "email": "your-email@example.com",
  "password": "your-password"
}`}
                      </pre>
                    </div>

                    {/* Response */}
                    <div className="rounded border border-green-500/30 bg-green-500/5 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Response (200 OK)
                        </span>
                      </div>
                      <pre className="text-xs">
                        {`{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",  ← Use this!
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "xxxxx",
  "user": { "id": "...", "email": "..." }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 2: Use Token */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      2
                    </div>
                    Use Token in API Requests
                  </h4>

                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Add the access_token as a Bearer token in the Authorization header:
                    </p>

                    {/* Example Request */}
                    <div className="rounded border bg-muted/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium">Example: List Clients</span>
                        <CopyButton text="GET /api/clients" field="example-url" />
                      </div>
                      <code className="block text-xs">
                        <span className="text-green-600 dark:text-green-400">GET</span> /api/clients
                      </code>
                    </div>

                    {/* Header */}
                    <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Key className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          Required Header
                        </span>
                        <CopyButton text="Authorization: Bearer <access_token>" field="auth-header" />
                      </div>
                      <code className="block text-xs">
                        <span className="text-purple-600 dark:text-purple-400">Authorization:</span>{' '}
                        Bearer {'<access_token>'}
                      </code>
                    </div>

                    {/* cURL Example */}
                    <div className="rounded border bg-zinc-900 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-3 w-3 text-green-400" />
                          <span className="text-xs font-medium text-zinc-300">cURL Example</span>
                        </div>
                        <CopyButton
                          text={`curl -X GET "http://localhost:3000/api/clients" \\\n  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
                          field="curl"
                        />
                      </div>
                      <pre className="text-xs text-green-400">
                        {`curl -X GET "http://localhost:3000/api/clients" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Available Endpoints */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Protected Endpoints
                  </h4>
                  <div className="grid gap-2 text-xs md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">Clients</p>
                      <div className="space-y-0.5">
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/clients
                        </code>
                        <code className="block">
                          <span className="text-blue-600">POST</span> /api/clients
                        </code>
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/clients/:id
                        </code>
                        <code className="block">
                          <span className="text-amber-600">PUT</span> /api/clients/:id
                        </code>
                        <code className="block">
                          <span className="text-red-600">DELETE</span> /api/clients/:id
                        </code>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">Invoices</p>
                      <div className="space-y-0.5">
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/invoices
                        </code>
                        <code className="block">
                          <span className="text-blue-600">POST</span> /api/invoices
                        </code>
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/invoices/:id
                        </code>
                        <code className="block">
                          <span className="text-amber-600">PUT</span> /api/invoices/:id
                        </code>
                        <code className="block">
                          <span className="text-red-600">DELETE</span> /api/invoices/:id
                        </code>
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/invoices/next-number
                        </code>
                        <code className="block">
                          <span className="text-green-600">GET</span> /api/invoices/check-number
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative: Cookie Auth */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Cookie className="h-4 w-4 text-blue-500" />
                    Alternative: Cookie Authentication (Browser)
                  </h4>
                  <p className="mb-2 text-xs text-muted-foreground">
                    When using the app in a browser, authentication is handled automatically via
                    cookies. After logging in through the UI, the session cookie is sent with every
                    request.
                  </p>
                  <code className="block overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                    Cookie: {COOKIE_NAME}=...
                  </code>
                </div>

                {/* Token Expiration */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    <Key className="h-4 w-4" />
                    Token Expiration
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    <li>
                      Access tokens expire after <strong>1 hour</strong> (3600 seconds)
                    </li>
                    <li>
                      Use the <code className="rounded bg-muted px-1">refresh_token</code> to get a
                      new access token
                    </li>
                    <li>Multiple sessions can coexist (tokens are not invalidated on new login)</li>
                    <li>
                      If you get <code className="rounded bg-muted px-1">401 Unauthorized</code>,
                      your token has expired
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* ============================================================
                    SUPABASE REST API AUTHENTICATION
                    ============================================================ */}
                <div className="grid gap-4 md:grid-cols-2">
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
                      Login via Supabase Auth endpoint, then extract the access_token from the
                      response. The same token works for both Supabase REST and Next.js APIs.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>
                {isNextJs ? (
                  <>
                    Tip: In Postman, save the token to an environment variable for easy reuse across
                    requests.
                  </>
                ) : (
                  <>
                    For detailed guides and Postman collections, see{' '}
                    <code className="rounded bg-muted px-1">docs/api-testing/</code>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
