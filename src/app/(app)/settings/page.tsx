'use client';

import { Building2, CreditCard, Mail, Settings } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessProfile } from '@/hooks/business-profile';
import { BusinessNameForm } from '@/components/settings/business-name-form';
import { LogoUpload } from '@/components/settings/logo-upload';

export default function SettingsPage() {
  const { data: profile, isLoading } = useBusinessProfile();

  return (
    <div className="space-y-8" data-testid="settingsPage">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu perfil de negocio y preferencias.</p>
      </div>

      <Tabs defaultValue="profile" data-testid="settings_tabs">
        <TabsList className="w-full lg:w-fit">
          <TabsTrigger value="profile" data-testid="tab_profile">
            <Building2 className="mr-2 h-4 w-4 hidden lg:block" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="contact" data-testid="tab_contact">
            <Mail className="mr-2 h-4 w-4 hidden lg:block" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="tax" data-testid="tab_tax">
            <Settings className="mr-2 h-4 w-4 hidden lg:block" />
            <span className="lg:hidden">Fiscal</span>
            <span className="hidden lg:inline">Datos Fiscales</span>
          </TabsTrigger>
          <TabsTrigger value="payment" data-testid="tab_payment">
            <CreditCard className="mr-2 h-4 w-4 hidden lg:block" />
            <span className="lg:hidden">Pagos</span>
            <span className="hidden lg:inline">Métodos de Pago</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ) : (
            <>
              <BusinessNameForm businessProfile={profile ?? null} />
              <LogoUpload businessProfile={profile ?? null} />
            </>
          )}
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ComingSoonCard
            title="Información de Contacto"
            description="Configura tu email, teléfono y dirección de contacto."
          />
        </TabsContent>

        <TabsContent value="tax" className="mt-6">
          <ComingSoonCard
            title="Datos Fiscales"
            description="Configura tu identificación fiscal (RFC, NIT, CUIT)."
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <ComingSoonCard
            title="Métodos de Pago"
            description="Configura tus métodos de pago para incluir en las facturas."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Próximamente</h3>
          <p className="text-muted-foreground max-w-md">
            Esta sección será implementada en una próxima actualización.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
