'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Types
// =============================================================================

// InvoiceDocument type for lazy loading
type InvoiceDocumentType = React.ComponentType<{ data: InvoiceWithDetails }>;

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

// =============================================================================
// InvoicePreviewDialog Component (SQ-26, SQ-126 refactor)
// =============================================================================

/**
 * Dialog component for previewing an invoice before sending.
 *
 * Uses pdf().toBlob() API instead of BlobProvider to avoid render loops.
 * PDF is generated once when the dialog opens using a data snapshot.
 *
 * @see .context/PRD/pdf-live-preview-documentation.md
 */
export function InvoicePreviewDialog({
  open,
  onOpenChange,
  previewData,
  invoiceId,
  onSendSuccess,
}: InvoicePreviewDialogProps) {
  // PDF generation via stable pdf().toBlob() API
  const { state, pdfUrl, pdfBlob, generatePdf, reset } = usePdfGenerator();

  // Lazy-loaded InvoiceDocument component
  const docComponentRef = useRef<InvoiceDocumentType | null>(null);
  const [docReady, setDocReady] = useState(false);

  // Snapshot of previewData captured when dialog opens
  const capturedDataRef = useRef<InvoiceWithDetails | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Send invoice mutation
  const { mutate: sendInvoice, isPending: isSending } = useSendInvoice();

  // Lazy load InvoiceDocument on mount
  useEffect(() => {
    import('@/app/(app)/invoices/[id]/components/invoice-document')
      .then(mod => {
        docComponentRef.current = mod.InvoiceDocument;
        setDocReady(true);
      })
      .catch(err => {
        console.error('Failed to load InvoiceDocument:', err);
      });
  }, []);

  // Generate PDF when dialog opens and DocComponent is ready
  useEffect(() => {
    if (!open) return;

    // Capture data snapshot to prevent re-generation from parent re-renders
    capturedDataRef.current = previewData;
    setDownloadSuccess(false);

    if (docReady && docComponentRef.current) {
      const DocComponent = docComponentRef.current;
      const element = <DocComponent data={previewData} />;
      generatePdf(element);
    }
    // previewData intentionally excluded from deps - we snapshot on open only
  }, [open, docReady, generatePdf]);

  // Reset PDF state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Stable data reference for UI labels
  const stableData = capturedDataRef.current ?? previewData;

  // Handle download (TC-005)
  const handleDownload = useCallback(() => {
    if (!pdfBlob || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const filename = generateInvoiceFilename(
        stableData.invoice_number,
        stableData.client.name
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
  }, [pdfBlob, isDownloading, stableData.invoice_number, stableData.client.name]);

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

  const isReady = state === 'ready';
  const isError = state === 'error';
  const isLoading = state === 'idle' || state === 'generating';

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
            {stableData.invoice_number !== 'BORRADOR'
              ? `Factura ${stableData.invoice_number} para ${stableData.client.name}`
              : `Borrador de factura para ${stableData.client.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Preview content */}
        <div className="flex-1 overflow-auto bg-muted/50 rounded-lg min-h-[400px]">
          {isError && (
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
          )}

          {isLoading && (
            <div
              className="flex flex-col items-center justify-center h-[500px] gap-4"
              data-testid="preview-loading-state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generando vista previa...</p>
            </div>
          )}

          {isReady && pdfUrl && (
            <div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              data-testid="preview-ready-state"
            >
              <iframe
                src={pdfUrl}
                className="w-full h-[500px] border-0"
                title={`Vista previa de factura ${stableData.invoice_number}`}
                data-testid="pdf-preview-iframe"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          {/* Edit button - left side */}
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isSending}
            className="w-full sm:w-auto"
            data-testid="preview-edit-button"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          {/* Download and Send buttons - right side */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!isReady || isDownloading}
              className="w-full sm:w-auto"
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
                disabled={!isReady || isSending}
                className="w-full sm:w-auto"
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
