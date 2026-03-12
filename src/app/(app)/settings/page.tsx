'use client';

import { Building2, CreditCard, Mail, Settings } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessProfile } from '@/hooks/business-profile';
import { BusinessNameForm } from '@/components/settings/business-name-form';
import { LogoUpload } from '@/components/settings/logo-upload';
import { ContactInfoForm } from '@/components/settings/contact-info-form';
import { TaxIdForm } from '@/components/settings/tax-id-form';
import { PaymentMethodsSection } from '@/components/settings/payment-methods-section';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
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
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ) : (
            <ContactInfoForm
              businessProfile={profile ?? null}
              userEmail={user?.email ?? undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="tax" className="mt-6">
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
            <TaxIdForm businessProfile={profile ?? null} />
          )}
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <PaymentMethodsSection businessProfile={profile ?? null} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
