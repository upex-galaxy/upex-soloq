/**
 * GET /api/openapi
 *
 * Serves the OpenAPI specification for the API.
 * Auto-generated from Zod schemas and always up-to-date.
 */

import { NextResponse } from 'next/server';
import { generateOpenAPIDocument } from '@/lib/openapi';

export async function GET() {
  try {
    const document = generateOpenAPIDocument();

    return NextResponse.json(document, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control':
          process.env.NODE_ENV === 'production'
            ? 'public, max-age=86400, s-maxage=86400'
            : 'no-cache',
      },
    });
  } catch (error) {
    console.error('[OpenAPI] Failed to generate document:', error);

    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
