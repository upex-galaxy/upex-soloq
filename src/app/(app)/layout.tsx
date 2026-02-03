'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Separator } from '@/components/ui/separator';
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { href, name, isLast };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with breadcrumb */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
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
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
