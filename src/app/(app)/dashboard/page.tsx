'use client';

import Link from 'next/link';
import { DollarSign, FileText, AlertTriangle, Users, Plus, ArrowUpRight } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for demo
const mockStats = {
  totalPending: 2450.0,
  overdueCount: 2,
  paidThisMonth: 5200.0,
  activeClients: 8,
};

const mockInvoices = [
  {
    id: '1',
    invoice_number: 'INV-2025-001',
    client_name: 'Tech Solutions CDMX',
    total: 1200.0,
    status: 'sent' as const,
    due_date: '2025-01-25',
  },
  {
    id: '2',
    invoice_number: 'INV-2025-002',
    client_name: 'Diseño Creativo SA',
    total: 850.0,
    status: 'overdue' as const,
    due_date: '2025-01-15',
  },
  {
    id: '3',
    invoice_number: 'INV-2024-098',
    client_name: 'Marketing Digital Co',
    total: 2100.0,
    status: 'paid' as const,
    due_date: '2025-01-10',
  },
  {
    id: '4',
    invoice_number: 'INV-2025-003',
    client_name: 'Startup Innovadora',
    total: 400.0,
    status: 'draft' as const,
    due_date: '2025-01-30',
  },
];

const statusConfig = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  paid: { label: 'Pagada', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName =
    user?.businessProfile?.business_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {displayName}</h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tu actividad de facturación.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalPending)}</div>
            <p className="text-xs text-muted-foreground">Facturas enviadas sin pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockStats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockStats.paidThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">Con facturas este trimestre</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Facturas Recientes</CardTitle>
            <CardDescription>Últimas facturas creadas y su estado actual</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">
              Ver todas
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {mockInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay facturas aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera factura para comenzar a facturar profesionalmente.
              </p>
              <Button asChild>
                <Link href="/invoices/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Factura
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.client_name}</TableCell>
                    <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[invoice.status].className}>
                        {statusConfig[invoice.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
