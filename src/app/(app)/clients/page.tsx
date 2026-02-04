'use client';

import Link from 'next/link';
import { Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu base de clientes y su historial de facturación.
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>
            Esta página será implementada en la siguiente fase de desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Gestión de Clientes</h3>
            <p className="text-muted-foreground max-w-md">
              Aquí podrás agregar, editar y gestionar todos tus clientes. Incluye historial de
              facturas por cliente, búsqueda y notas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
