'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

interface BreadcrumbOverrides {
  [segment: string]: string;
}

interface BreadcrumbContextValue {
  overrides: BreadcrumbOverrides;
  setOverride: (segment: string, label: string) => void;
  clearOverride: (segment: string) => void;
}

// =============================================================================
// Context
// =============================================================================

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

/**
 * BreadcrumbProvider allows child pages to override breadcrumb segment labels.
 *
 * This is useful for dynamic routes where the URL contains an ID (e.g., /clients/[id])
 * but we want to display a human-readable name instead.
 *
 * @example
 * // In a child page component:
 * const { setOverride, clearOverride } = useBreadcrumb();
 *
 * useEffect(() => {
 *   if (client?.name) {
 *     setOverride(clientId, client.name);
 *   }
 *   return () => clearOverride(clientId);
 * }, [client?.name, clientId]);
 */
export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<BreadcrumbOverrides>({});

  const setOverride = useCallback((segment: string, label: string) => {
    setOverrides(prev => ({ ...prev, [segment]: label }));
  }, []);

  const clearOverride = useCallback((segment: string) => {
    setOverrides(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [segment]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const value = useMemo(
    () => ({
      overrides,
      setOverride,
      clearOverride,
    }),
    [overrides, setOverride, clearOverride]
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);

  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }

  return context;
}
