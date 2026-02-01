import { Building2, Mail, Phone, MapPin } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8" data-testid="profileSettingsPage">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Perfil de negocio</h1>
        <p className="text-muted-foreground">Define los datos que apareceran en tus facturas.</p>
      </div>

      <Alert className="bg-primary/5 border-primary/20" data-testid="profile_settings_notice">
        <AlertDescription>
          Vista demo. La configuracion real se conectara a Supabase en la Fase 7.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos principales</CardTitle>
            <CardDescription>Nombre, contacto y datos fiscales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre de negocio</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="Ej: Estudio SoloQ"
                  className="pl-9"
                  data-testid="business_name_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de contacto</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contacto@soloq.app"
                  className="pl-9"
                  data-testid="business_email_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  placeholder="+52 55 1234 5678"
                  className="pl-9"
                  data-testid="business_phone_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Direccion fiscal</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="businessAddress"
                  placeholder="Ciudad, pais"
                  className="pl-9"
                  data-testid="business_address_input"
                />
              </div>
            </div>
            <Button type="button" disabled data-testid="business_profile_save_button">
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metodos de pago</CardTitle>
            <CardDescription>Comparte opciones de cobro con tus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-dashed border-border p-4 text-muted-foreground">
              Aun no hay metodos configurados.
            </div>
            <Button variant="outline" type="button" disabled data-testid="payment_methods_button">
              Agregar metodo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
