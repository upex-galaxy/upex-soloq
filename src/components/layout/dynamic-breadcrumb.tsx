'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Map routes to readable names
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  invoices: 'Facturas',
  clients: 'Clientes',
  create: 'Nuevo',
  settings: 'Configuración',
};

/**
 * Dynamic breadcrumb component that supports overrides from child pages.
 *
 * Uses BreadcrumbContext to allow child pages to set custom labels
 * for dynamic route segments (e.g., showing client name instead of UUID).
 */
export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { overrides } = useBreadcrumb();

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    // Check overrides first, then static route names, then capitalize segment
    const name =
      overrides[segment] ||
      routeNames[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { href, name, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
