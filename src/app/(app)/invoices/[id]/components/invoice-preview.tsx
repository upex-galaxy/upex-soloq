'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Download, AlertCircle, RefreshCw, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Dynamic Import - Code Splitting
// =============================================================================

// Dynamically import BlobProvider to avoid SSR issues and reduce initial bundle
const BlobProvider = dynamic(() => import('@react-pdf/renderer').then(mod => mod.BlobProvider), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

// =============================================================================
// BlobProviderBridge - Defers state updates to useEffect to avoid
// calling setState during BlobProvider's render cycle (React anti-pattern)
// =============================================================================

function BlobProviderBridge({
  blob,
  loading,
  error,
  onUpdate,
}: {
  blob: Blob | null;
  loading: boolean;
  error: Error | null;
  onUpdate: (blob: Blob | null, error: Error | null) => void;
}) {
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (loading) return;

    if (error) {
      onUpdate(null, error);
    } else if (blob && blob !== lastProcessedBlobRef.current) {
      lastProcessedBlobRef.current = blob;
      onUpdate(blob, null);
    }
    // If loading=false, blob=null, error=null: BlobProvider is in an
    // intermediate state. Stay in loading and wait for blob or error.
  }, [blob, loading, error, onUpdate]);

  return null;
}

// =============================================================================
// Types
// =============================================================================

interface InvoicePreviewProps {
  invoice: InvoiceWithDetails;
  InvoiceDocument: React.ComponentType<{ data: InvoiceWithDetails }>;
}

type PreviewState = 'loading' | 'ready' | 'error';

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_DELAY = 1500; // 1.5 seconds as per spec

// =============================================================================
// InvoicePreview Component
// =============================================================================

/**
 * PDF Preview component with debouncing and download functionality
 *
 * Features:
 * - 1500ms debouncing to prevent excessive PDF regeneration
 * - Loading state during PDF generation
 * - Error handling with retry capability
 * - Memory cleanup for blob URLs
 * - Download functionality with professional filename (SQ-35)
 *
 * Download features (SQ-35):
 * - Filename format: Invoice-{number}-{client}.pdf
 * - Client name sanitized (no accents, special chars)
 * - Double-click prevention with loading state
 * - Success feedback after download
 */
export function InvoicePreview({ invoice, InvoiceDocument }: InvoicePreviewProps) {
  // Debounce invoice data to prevent excessive PDF regeneration
  const debouncedInvoice = useDebounce(invoice, DEBOUNCE_DELAY);

  // Track component state
  const [previewState, setPreviewState] = useState<PreviewState>('loading');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Download state (SQ-35) - prevents double-click
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Ref for tracking previous blob URL to cleanup
  const previousBlobUrlRef = useRef<string | null>(null);

  // Cleanup blob URLs on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  // Track blob URL changes for cleanup
  useEffect(() => {
    if (previousBlobUrlRef.current && previousBlobUrlRef.current !== blobUrl) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
    }
    previousBlobUrlRef.current = blobUrl;
  }, [blobUrl]);

  // Handle PDF blob generation
  const handleBlobUpdate = useCallback((blob: Blob | null, error: Error | null) => {
    if (error) {
      console.error('PDF generation error:', error);
      setPreviewState('error');
      setBlobUrl(null);
      return;
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setPreviewState('ready');
    }
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setPreviewState('loading');
    setRetryKey(prev => prev + 1);
  }, []);

  // Handle download (SQ-35)
  // - Uses professional filename format: Invoice-{number}-{client}.pdf
  // - Prevents double-click with loading state
  // - Shows brief success feedback
  const handleDownload = useCallback(() => {
    if (!blobUrl || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Generate professional filename with client name
      const filename = generateInvoiceFilename(invoice.invoice_number, invoice.client.name);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success briefly
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } finally {
      setIsDownloading(false);
    }
  }, [blobUrl, isDownloading, invoice.invoice_number, invoice.client.name]);

  return (
    <div className="flex flex-col h-full" data-testid="invoice-preview-container">
      {/* Header with download button */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Vista previa del PDF</span>
        </div>
        <Button
          onClick={handleDownload}
          disabled={previewState !== 'ready' || isDownloading}
          size="sm"
          data-testid="download-pdf-button"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : downloadSuccess ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isDownloading ? 'Descargando...' : downloadSuccess ? 'Descargado' : 'Descargar PDF'}
        </Button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-muted/50 p-4">
        {/* Error State */}
        {previewState === 'error' && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            data-testid="preview-error-state"
          >
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground text-center">
              Error al generar el PDF.
              <br />
              Por favor, intenta de nuevo.
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading / Ready State - BlobProvider handles both */}
        {previewState !== 'error' && (
          <BlobProvider key={retryKey} document={<InvoiceDocument data={debouncedInvoice} />}>
            {({ blob, loading, error }) => (
              <>
                <BlobProviderBridge
                  blob={blob}
                  loading={loading}
                  error={error}
                  onUpdate={handleBlobUpdate}
                />
                {(loading || previewState === 'loading') && (
                  <div
                    className="flex flex-col items-center justify-center h-[600px] gap-4"
                    data-testid="preview-loading-state"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generando PDF...</p>
                  </div>
                )}
                {blobUrl && previewState === 'ready' && (
                  <div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    data-testid="preview-ready-state"
                  >
                    <iframe
                      src={blobUrl}
                      className="w-full h-[600px] border-0"
                      title={`Vista previa de factura ${invoice.invoice_number}`}
                      data-testid="pdf-preview-iframe"
                    />
                  </div>
                )}
              </>
            )}
          </BlobProvider>
        )}
      </div>
    </div>
  );
}
