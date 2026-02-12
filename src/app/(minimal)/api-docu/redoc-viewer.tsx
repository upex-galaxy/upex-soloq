'use client';

import { useEffect, useRef } from 'react';

interface RedocViewerProps {
  specUrl: string;
}

export function RedocViewer({ specUrl }: RedocViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Redoc from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
    script.async = true;

    script.onload = () => {
      if (containerRef.current && window.Redoc) {
        window.Redoc.init(
          specUrl,
          {
            theme: {
              colors: {
                primary: { main: '#7c3aed' }, // Purple to match brand
              },
              typography: {
                fontFamily: 'system-ui, sans-serif',
              },
            },
            hideDownloadButton: false,
            expandResponses: '200,201',
          },
          containerRef.current
        );
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [specUrl]);

  return <div ref={containerRef} />;
}

// Type declaration for Redoc
declare global {
  interface Window {
    Redoc?: {
      init: (specUrl: string, options: Record<string, unknown>, element: HTMLElement) => void;
    };
  }
}
