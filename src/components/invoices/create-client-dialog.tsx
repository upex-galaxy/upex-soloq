'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { clientFormSchema, type ClientFormData } from '@/lib/validations/client';
import { useCreateClient } from '@/hooks/clients';
import type { Client } from '@/lib/types';

interface CreateClientDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when client is created successfully */
  onSuccess: (client: Client) => void;
}

/**
 * Dialog for creating a new client inline (without leaving the invoice flow)
 *
 * Features:
 * - Simplified form with essential fields only
 * - Auto-selects new client on success
 * - Doesn't redirect after creation
 */
export function CreateClientDialog({ open, onOpenChange, onSuccess }: CreateClientDialogProps) {
  const { mutate: createClient, isPending } = useCreateClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      notes: '',
      tax_id: '',
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    createClient(data, {
      onSuccess: client => {
        form.reset();
        onSuccess(client);
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="create-client-dialog">
        <DialogHeader>
          <DialogTitle>Agregar nuevo cliente</DialogTitle>
          <DialogDescription>
            Crea un nuevo cliente para asociarlo a esta factura.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            data-testid="create-client-form"
          >
            {/* Name - Required */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del cliente"
                      {...field}
                      data-testid="client-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email - Required */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      {...field}
                      data-testid="client-email-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company - Optional */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la empresa"
                      {...field}
                      data-testid="client-company-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax ID - Optional */}
            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Fiscal (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="RFC/NIT/CUIT" {...field} data-testid="client-taxid-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                data-testid="create-client-cancel"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="create-client-submit">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cliente'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
