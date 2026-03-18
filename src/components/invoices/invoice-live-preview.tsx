'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  FileText,
  Check,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import { buildPreviewData, canShowPreview } from '@/lib/utils/invoice-preview';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';
import type { Client, BusinessProfile } from '@/lib/types';
import type { CreateInvoiceFormData, UpdateInvoiceData } from '@/lib/validations/invoice';

// =============================================================================
// Types
// =============================================================================

interface InvoiceLivePreviewProps {
  /** Form data from form.watch() - updates on every keystroke */
  formData: CreateInvoiceFormData | UpdateInvoiceData;
  /** Selected client object */
  client: Client | null;
  /** Business profile for the invoice header */
  businessProfile: BusinessProfile | null;
  /** Optional existing invoice ID (for edit mode) */
  existingInvoiceId?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_DELAY = 1500;

// =============================================================================
// InvoiceLivePreview Component
// =============================================================================

/**
 * Live PDF preview panel for invoice create/edit pages.
 *
 * Transforms form data to InvoiceWithDetails, debounces at 1500ms,
 * and generates a PDF displayed in an iframe. Shows a checklist of
 * required fields when minimum data is not met.
 *
 * @see .context/PRD/pdf-live-preview-documentation.md
 */
export function InvoiceLivePreview({
  formData,
  client,
  businessProfile,
  existingInvoiceId,
}: InvoiceLivePreviewProps) {
  // Build preview data from form state
  const previewData = useMemo<InvoiceWithDetails | null>(() => {
    if (!client) return null;
    return buildPreviewData(formData, client, businessProfile, existingInvoiceId);
  }, [formData, client, businessProfile, existingInvoiceId]);

  // Check if we have enough data for preview
  const hasMinimumData = useMemo(
    () => canShowPreview(formData, !!client),
    [formData, client]
  );

  // Debounce the preview data
  const debouncedData = useDebounce(previewData, DEBOUNCE_DELAY);
  const debouncedHasMinimumData = useDebounce(hasMinimumData, DEBOUNCE_DELAY);

  // PDF generation
  const { state, pdfUrl, pdfBlob, generatePdf, reset } = usePdfGenerator();

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate PDF when debounced data changes and has minimum data
  useEffect(() => {
    if (debouncedHasMinimumData && debouncedData) {
      // Dynamic import to avoid SSR issues (InvoiceDocument imports @react-pdf/renderer at top-level)
      import('@/app/(app)/invoices/[id]/components/invoice-document').then(mod => {
        const element = <mod.InvoiceDocument data={debouncedData} />;
        generatePdf(element);
      });
    }
  }, [debouncedData, debouncedHasMinimumData, generatePdf]);

  // Clear PDF when data becomes incomplete
  useEffect(() => {
    if (!debouncedHasMinimumData && pdfUrl) {
      reset();
    }
  }, [debouncedHasMinimumData, pdfUrl, reset]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (!debouncedData) return;
    reset();
    import('@/app/(app)/invoices/[id]/components/invoice-document').then(mod => {
      const element = <mod.InvoiceDocument data={debouncedData} />;
      generatePdf(element);
    });
  }, [debouncedData, generatePdf, reset]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!pdfBlob || isDownloading || !previewData) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const filename = generateInvoiceFilename(
        previewData.invoice_number,
        previewData.client.name
      );

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
  }, [pdfBlob, isDownloading, previewData]);

  const isReady = state === 'ready';
  const isError = state === 'error';
  const isLoading = state === 'generating';

  // Checklist items for minimum data gate
  const hasClient = !!client;
  const items = (formData.items as Array<{ description: string; quantity: number; unitPrice: number }>) || [];
  const hasValidItem = items.some(
    item => item.description?.trim() !== '' && item.quantity > 0 && item.unitPrice >= 0
  );

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card" data-testid="invoice-live-preview">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-sm">Vista previa</span>
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          onClick={handleDownload}
          disabled={!isReady || isDownloading}
          size="sm"
          variant="outline"
          data-testid="live-preview-download-button"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : downloadSuccess ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isDownloading ? 'Descargando...' : downloadSuccess ? 'Descargado' : 'Descargar'}
        </Button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-3">
        {/* Minimum data not met - show checklist */}
        {!hasMinimumData && (
          <div
            className="flex flex-col items-center justify-center h-full gap-6 p-6"
            data-testid="preview-checklist"
          >
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <div className="text-center space-y-2">
              <p className="font-medium text-muted-foreground">
                Completa los campos requeridos
              </p>
              <p className="text-sm text-muted-foreground/70">
                La vista previa se generara automaticamente
              </p>
            </div>
            <div className="space-y-3 w-full max-w-xs">
              <ChecklistItem checked={hasClient} label="Seleccionar cliente" />
              <ChecklistItem checked={hasValidItem} label="Agregar al menos un item" />
            </div>
          </div>
        )}

        {/* Error State */}
        {hasMinimumData && isError && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            data-testid="live-preview-error-state"
          >
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground text-center text-sm">
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

        {/* Loading State (first generation) */}
        {hasMinimumData && !isReady && !isError && !pdfUrl && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            data-testid="live-preview-loading-state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Generando PDF...</p>
          </div>
        )}

        {/* Ready State - iframe */}
        {pdfUrl && !isError && (
          <div
            className="bg-white rounded-lg shadow-sm overflow-hidden h-full"
            data-testid="live-preview-ready-state"
          >
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[600px] border-0"
              title="Vista previa de factura"
              data-testid="live-preview-pdf-iframe"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ChecklistItem
// =============================================================================

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
      )}
      <span
        className={`text-sm ${checked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
      >
        {label}
      </span>
    </div>
  );
}
