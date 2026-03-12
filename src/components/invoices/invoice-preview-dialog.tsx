'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Download, Pencil, Send, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSendInvoice } from '@/hooks/invoices';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Dynamic Imports - Avoid SSR issues with react-pdf
// =============================================================================

const BlobProvider = dynamic(() => import('@react-pdf/renderer').then(mod => mod.BlobProvider), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

const InvoiceDocument = dynamic(
  () =>
    import('@/app/(app)/invoices/[id]/components/invoice-document').then(mod => ({
      default: mod.InvoiceDocument,
    })),
  { ssr: false }
);

// =============================================================================
// Types
// =============================================================================

interface InvoicePreviewDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Invoice data formatted for preview */
  previewData: InvoiceWithDetails;
  /** Invoice ID - if provided, enables "Send" button */
  invoiceId?: string;
  /** Callback when invoice is sent successfully */
  onSendSuccess?: () => void;
}

type PreviewState = 'loading' | 'ready' | 'error';

// =============================================================================
// InvoicePreviewDialog Component (SQ-26)
// =============================================================================

/**
 * Dialog component for previewing an invoice before sending
 *
 * Features:
 * - PDF preview using react-pdf
 * - Edit button (closes dialog to return to form)
 * - Download PDF button
 * - Send button (only when invoiceId is provided)
 *
 * Test Cases covered:
 * - TC-001: Open preview from form
 * - TC-002: Preview shows all data
 * - TC-003: Return to edit from preview
 * - TC-004: Send invoice from preview
 * - TC-005: Download PDF from preview
 *
 * @example
 * // In create page (no Send button)
 * <InvoicePreviewDialog
 *   open={isPreviewOpen}
 *   onOpenChange={setIsPreviewOpen}
 *   previewData={buildPreviewData(formValues, client, businessProfile)}
 * />
 *
 * // In edit page (with Send button)
 * <InvoicePreviewDialog
 *   open={isPreviewOpen}
 *   onOpenChange={setIsPreviewOpen}
 *   previewData={buildPreviewData(formValues, client, businessProfile, invoiceId)}
 *   invoiceId={invoiceId}
 *   onSendSuccess={() => router.push('/invoices')}
 * />
 */
export function InvoicePreviewDialog({
  open,
  onOpenChange,
  previewData,
  invoiceId,
  onSendSuccess,
}: InvoicePreviewDialogProps) {
  // PDF generation state
  const [previewState, setPreviewState] = useState<PreviewState>('loading');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Send invoice mutation
  const { mutate: sendInvoice, isPending: isSending } = useSendInvoice();

  // Ref for tracking blob URL to cleanup
  const previousBlobUrlRef = useRef<string | null>(null);

  // Ref to track the last processed blob to prevent infinite re-render loop
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPreviewState('loading');
      setDownloadSuccess(false);
      lastProcessedBlobRef.current = null;
    }
  }, [open]);

  // Cleanup blob URLs
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

  // Handle download (TC-005)
  const handleDownload = useCallback(() => {
    if (!blobUrl || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const filename = generateInvoiceFilename(
        previewData.invoice_number,
        previewData.client.name
      );

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } finally {
      setIsDownloading(false);
    }
  }, [blobUrl, isDownloading, previewData.invoice_number, previewData.client.name]);

  // Handle edit (TC-003)
  const handleEdit = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle send (TC-004)
  const handleSend = useCallback(() => {
    if (!invoiceId || isSending) return;

    sendInvoice(invoiceId, {
      onSuccess: () => {
        toast.success('Factura enviada correctamente');
        onOpenChange(false);
        onSendSuccess?.();
      },
      onError: error => {
        toast.error(error.message || 'Error al enviar la factura');
      },
    });
  }, [invoiceId, isSending, sendInvoice, onOpenChange, onSendSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col"
        data-testid="preview-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vista previa de factura
          </DialogTitle>
          <DialogDescription>
            {previewData.invoice_number !== 'BORRADOR'
              ? `Factura ${previewData.invoice_number} para ${previewData.client.name}`
              : `Borrador de factura para ${previewData.client.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Preview content */}
        <div className="flex-1 overflow-auto bg-muted/50 rounded-lg min-h-[400px]">
          {previewState === 'error' ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-4 p-8"
              data-testid="preview-error-state"
            >
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-muted-foreground text-center">
                Error al generar la vista previa.
                <br />
                Por favor, verifica los datos e intenta de nuevo.
              </p>
            </div>
          ) : (
            <BlobProvider document={<InvoiceDocument data={previewData} />}>
              {({ blob, loading, error }) => {
                // Guard: only process state transitions once per blob instance
                if (!loading && error) {
                  handleBlobUpdate(null, error);
                } else if (!loading && blob && blob !== lastProcessedBlobRef.current) {
                  lastProcessedBlobRef.current = blob;
                  handleBlobUpdate(blob, null);
                } else if (!loading && !blob && !error && previewState === 'loading') {
                  // Edge case: BlobProvider finished but returned nothing
                  handleBlobUpdate(null, new Error('PDF generation returned empty result'));
                }

                // Loading indicator
                if (loading || previewState === 'loading') {
                  return (
                    <div
                      className="flex flex-col items-center justify-center h-[500px] gap-4"
                      data-testid="preview-loading-state"
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Generando vista previa...</p>
                    </div>
                  );
                }

                // PDF iframe preview
                if (blobUrl && previewState === 'ready') {
                  return (
                    <div
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                      data-testid="preview-ready-state"
                    >
                      <iframe
                        src={blobUrl}
                        className="w-full h-[500px] border-0"
                        title={`Vista previa de factura ${previewData.invoice_number}`}
                        data-testid="pdf-preview-iframe"
                      />
                    </div>
                  );
                }

                return null;
              }}
            </BlobProvider>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          {/* Edit button - left side */}
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isSending}
            data-testid="preview-edit-button"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          {/* Download and Send buttons - right side */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={previewState !== 'ready' || isDownloading}
              data-testid="preview-download-button"
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

            {/* Send button - only shown when invoiceId exists */}
            {invoiceId && (
              <Button
                onClick={handleSend}
                disabled={previewState !== 'ready' || isSending}
                data-testid="preview-send-button"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar factura
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
