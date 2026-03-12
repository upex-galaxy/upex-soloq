'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Download, AlertCircle, RefreshCw, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Types
// =============================================================================

interface InvoicePreviewProps {
  invoice: InvoiceWithDetails;
  InvoiceDocument: React.ComponentType<{ data: InvoiceWithDetails }>;
}

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_DELAY = 1500; // 1.5 seconds as per spec

// =============================================================================
// InvoicePreview Component (SQ-126 refactor: pdf().toBlob() replaces BlobProvider)
// =============================================================================

/**
 * PDF Preview component with debouncing and download functionality.
 *
 * Uses pdf().toBlob() API instead of BlobProvider to avoid render loops.
 * The generation counter in usePdfGenerator cancels stale generations.
 *
 * @see .context/PRD/pdf-live-preview-documentation.md
 */
export function InvoicePreview({ invoice, InvoiceDocument }: InvoicePreviewProps) {
  // Debounce invoice data to prevent excessive PDF regeneration
  const debouncedInvoice = useDebounce(invoice, DEBOUNCE_DELAY);

  // PDF generation via stable pdf().toBlob() API
  const { state, pdfUrl, pdfBlob, generatePdf, reset } = usePdfGenerator();

  // Download state (SQ-35) - prevents double-click
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate PDF when debounced data changes
  useEffect(() => {
    const element = <InvoiceDocument data={debouncedInvoice} />;
    generatePdf(element);
  }, [debouncedInvoice, InvoiceDocument, generatePdf]);

  // Handle retry
  const handleRetry = useCallback(() => {
    reset();
    const element = <InvoiceDocument data={debouncedInvoice} />;
    generatePdf(element);
  }, [debouncedInvoice, InvoiceDocument, generatePdf, reset]);

  // Handle download (SQ-35)
  const handleDownload = useCallback(() => {
    if (!pdfBlob || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const filename = generateInvoiceFilename(invoice.invoice_number, invoice.client.name);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } finally {
      setIsDownloading(false);
    }
  }, [pdfBlob, isDownloading, invoice.invoice_number, invoice.client.name]);

  const isReady = state === 'ready';
  const isError = state === 'error';
  const isLoading = state === 'idle' || state === 'generating';

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
          disabled={!isReady || isDownloading}
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
        {isError && (
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

        {/* Loading State */}
        {isLoading && (
          <div
            className="flex flex-col items-center justify-center h-[600px] gap-4"
            data-testid="preview-loading-state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generando PDF...</p>
          </div>
        )}

        {/* Ready State */}
        {isReady && pdfUrl && (
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            data-testid="preview-ready-state"
          >
            <iframe
              src={pdfUrl}
              className="w-full h-[600px] border-0"
              title={`Vista previa de factura ${invoice.invoice_number}`}
              data-testid="pdf-preview-iframe"
            />
          </div>
        )}
      </div>
    </div>
  );
}
