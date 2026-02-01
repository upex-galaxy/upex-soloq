import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateInvoicePage() {
  return (
    <div className="space-y-8" data-testid="invoiceCreatePage">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Nueva factura</h1>
        <p className="text-muted-foreground">
          Prepara una factura profesional en minutos y enviala con un click.
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20" data-testid="invoice_create_notice">
        <AlertDescription>
          Vista demo. La creacion real se implementara en la Fase 7 con calculos y guardado en base
          de datos.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
              <CardDescription>Define el cliente, fechas y numero de factura.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input
                    id="client"
                    placeholder="Busca o agrega un cliente"
                    data-testid="invoice_client_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Numero de factura</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="INV-2026-0001"
                    data-testid="invoice_number_input"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Fecha de emision</Label>
                  <Input id="issueDate" type="date" data-testid="invoice_issue_date_input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                  <Input id="dueDate" type="date" data-testid="invoice_due_date_input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Terminos, condiciones o mensajes para tu cliente"
                  data-testid="invoice_notes_input"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items de la factura</CardTitle>
              <CardDescription>Agrega los servicios o productos que vas a cobrar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="itemDescription">Descripcion</Label>
                  <Input
                    id="itemDescription"
                    placeholder="Ej: Diseño de logo"
                    data-testid="invoice_item_description_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemQuantity">Cantidad</Label>
                  <Input
                    id="itemQuantity"
                    type="number"
                    placeholder="1"
                    data-testid="invoice_item_quantity_input"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="itemPrice">Precio unitario</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    placeholder="500"
                    data-testid="invoice_item_price_input"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" disabled data-testid="invoice_add_item">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Vista previa de los totales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>$0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impuesto</span>
                <span>$0.00</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>$0.00</span>
              </div>
              <Badge className="w-fit" variant="secondary">
                Estado: Borrador
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="button" className="w-full" disabled data-testid="invoice_save_button">
                <FileText className="mr-2 h-4 w-4" />
                Guardar factura
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
                data-testid="invoice_preview_button"
              >
                Previsualizar PDF
              </Button>
              <Button asChild variant="ghost" className="w-full" data-testid="back_to_invoices">
                <Link href="/invoices">Volver a facturas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
