'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * usePdfGenerator - Stable PDF generation using pdf().toBlob() API
 *
 * Replaces BlobProvider (which causes render loops) with the programmatic
 * pdf().toBlob() API. Uses a generation counter to cancel stale generations
 * at async checkpoints.
 *
 * Features:
 * - Generation counter prevents stale PDF renders
 * - Dynamic imports for SSR safety and code-splitting
 * - Object URL memory management (revoke on replace/unmount)
 * - isClient guard prevents server-side execution
 *
 * @see .context/PRD/pdf-live-preview-documentation.md
 */

type PdfState = 'idle' | 'generating' | 'ready' | 'error';

interface UsePdfGeneratorReturn {
  /** Current state of PDF generation */
  state: PdfState;
  /** Object URL for the generated PDF blob (for iframe src) */
  pdfUrl: string | null;
  /** The generated PDF blob (for download) */
  pdfBlob: Blob | null;
  /** Error message if generation failed */
  error: string | null;
  /** Whether PDF is currently being generated */
  isGenerating: boolean;
  /** Trigger PDF generation with given React element */
  generatePdf: (documentElement: React.ReactElement) => Promise<void>;
  /** Reset state (clear PDF, URL, errors) */
  reset: () => void;
}

export function usePdfGenerator(): UsePdfGeneratorReturn {
  const [state, setState] = useState<PdfState>('idle');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation counter - incremented on each call, stale generations self-cancel
  const generationRef = useRef(0);
  // Track current URL for cleanup
  const pdfUrlRef = useRef<string | null>(null);
  // isClient guard
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, []);

  const generatePdf = useCallback(
    async (documentElement: React.ReactElement) => {
      if (!isClient) return;

      const currentGeneration = ++generationRef.current;

      setState('generating');
      setError(null);

      try {
        // Small delay to let React settle before heavy work
        await new Promise(resolve => setTimeout(resolve, 200));
        if (currentGeneration !== generationRef.current) return;

        // Dynamic import - SSR safe, code-split
        const { pdf } = await import('@react-pdf/renderer');
        if (currentGeneration !== generationRef.current) return;

        // Generate blob using the stable programmatic API
        // Type cast needed: pdf() expects ReactElement<DocumentProps> but we receive
        // a generic ReactElement from the InvoiceDocument wrapper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = await pdf(documentElement as any).toBlob();
        if (currentGeneration !== generationRef.current) return;

        // Revoke previous URL before creating new one
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }

        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url;

        setPdfBlob(blob);
        setPdfUrl(url);
        setError(null);
        setState('ready');
      } catch (err) {
        if (currentGeneration === generationRef.current) {
          const message = err instanceof Error ? err.message : 'Error al generar el PDF';
          console.error('PDF generation error:', message);
          setError(message);
          setState('error');
        }
      }
    },
    [isClient]
  );

  const reset = useCallback(() => {
    // Increment generation to cancel any in-flight generation
    generationRef.current++;

    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }

    setPdfUrl(null);
    setPdfBlob(null);
    setError(null);
    setState('idle');
  }, []);

  return {
    state,
    pdfUrl,
    pdfBlob,
    error,
    isGenerating: state === 'generating',
    generatePdf,
    reset,
  };
}
