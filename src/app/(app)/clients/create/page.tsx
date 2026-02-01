import Link from 'next/link';
import { UserPlus } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateClientPage() {
  return (
    <div className="space-y-8" data-testid="clientCreatePage">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Nuevo cliente</h1>
        <p className="text-muted-foreground">
          Registra los datos basicos para enviar facturas profesionales.
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20" data-testid="client_create_notice">
        <AlertDescription>
          Esta es una vista demo. La creacion real se conectara en la Fase 7.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Informacion del cliente</CardTitle>
          <CardDescription>Completa la informacion clave para tus cobros.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" data-testid="client_create_form">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre completo</Label>
                <Input
                  id="clientName"
                  placeholder="Ej: Ana Gonzalez"
                  data-testid="client_name_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="cliente@email.com"
                  data-testid="client_email_input"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Empresa (opcional)</Label>
                <Input
                  id="clientCompany"
                  placeholder="Ej: Estudio Creativo"
                  data-testid="client_company_input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefono</Label>
                <Input
                  id="clientPhone"
                  placeholder="Ej: +52 55 1234 5678"
                  data-testid="client_phone_input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Direccion</Label>
              <Input
                id="clientAddress"
                placeholder="Ciudad, pais"
                data-testid="client_address_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientNotes">Notas internas</Label>
              <Textarea
                id="clientNotes"
                placeholder="Notas sobre acuerdos, descuentos o preferencias de pago"
                data-testid="client_notes_input"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="gap-2" disabled data-testid="client_save_button">
                <UserPlus className="h-4 w-4" />
                Guardar cliente
              </Button>
              <Button variant="outline" asChild data-testid="back_to_clients_link">
                <Link href="/clients">Volver a clientes</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
