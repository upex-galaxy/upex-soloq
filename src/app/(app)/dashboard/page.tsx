'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, FileText, AlertTriangle, Users, Plus, ArrowUpRight } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};
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
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {displayName}</h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tu actividad de facturación.
          </p>
        </div>
        <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockStats.totalPending)}</div>
              <p className="text-xs text-muted-foreground mt-1">Facturas enviadas sin pagar</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{mockStats.overdueCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren seguimiento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(mockStats.paidThisMonth)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">+12% vs mes anterior</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeClients}</div>
              <p className="text-xs text-muted-foreground mt-1">Con facturas este trimestre</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Invoices */}
      <motion.div variants={cardVariants}>
        <Card className="card-elevated border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Facturas Recientes</CardTitle>
              <CardDescription>Últimas facturas creadas y su estado actual</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow transition-shadow">
              <Link href="/invoices">
                Ver todas
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mockInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No hay facturas aún</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crea tu primera factura para comenzar a facturar profesionalmente.
                </p>
                <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
                  <Link href="/invoices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Factura
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Número</TableHead>
                      <TableHead className="font-semibold">Monto</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Vencimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map(invoice => (
                      <TableRow
                        key={invoice.id}
                        className="table-row-interactive cursor-pointer"
                      >
                        <TableCell className="font-medium">{invoice.client_name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{invoice.invoice_number}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
