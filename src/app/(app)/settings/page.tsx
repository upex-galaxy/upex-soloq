'use client';

import { Settings } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu perfil de negocio y preferencias.</p>
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
            <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Configuración del Negocio</h3>
            <p className="text-muted-foreground max-w-md">
              Aquí podrás configurar tu perfil de negocio, métodos de pago, recordatorios
              automáticos y preferencias de facturación.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
