'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/payment-methods';
import type { BusinessProfile, PaymentMethod, PaymentMethodType, BusinessAddress } from '@/lib/types';
import { PaymentMethodCard } from './payment-method-card';
import { PaymentMethodFormDialog } from './payment-method-form-dialog';

const MAX_PAYMENT_METHODS = 10;

interface PaymentMethodsSectionProps {
  businessProfile: BusinessProfile | null;
}

export function PaymentMethodsSection({ businessProfile }: PaymentMethodsSectionProps) {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  const activeCount = methods.filter((m) => m.is_active).length;
  const isLastActive = activeCount <= 1;
  const isMaxReached = methods.length >= MAX_PAYMENT_METHODS;

  const address = businessProfile?.address as BusinessAddress | null;
  const country = address?.country;

  function handleAdd() {
    setEditingMethod(null);
    setDialogOpen(true);
  }

  function handleEdit(method: PaymentMethod) {
    setEditingMethod(method);
    setDialogOpen(true);
  }

  function handleDeleteRequest(method: PaymentMethod) {
    setDeletingMethod(method);
  }

  function handleToggle(method: PaymentMethod, active: boolean) {
    updateMutation.mutate(
      { id: method.id, data: { is_active: active } },
      {
        onSuccess: () => {
          toast.success(active ? 'Método activado' : 'Método desactivado');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  }

  function handleSave(data: {
    type: PaymentMethodType;
    label: string;
    value: string;
    is_default: boolean;
  }) {
    if (editingMethod) {
      updateMutation.mutate(
        {
          id: editingMethod.id,
          data: {
            label: data.label,
            value: data.value,
            is_default: data.is_default,
          },
        },
        {
          onSuccess: () => {
            toast.success('Método actualizado');
            setDialogOpen(false);
            setEditingMethod(null);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          type: data.type,
          label: data.label,
          value: data.value,
          is_default: data.is_default,
        },
        {
          onSuccess: () => {
            toast.success('Método de pago agregado');
            setDialogOpen(false);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  }

  function handleDeleteConfirm() {
    if (!deletingMethod) return;

    deleteMutation.mutate(deletingMethod.id, {
      onSuccess: () => {
        toast.success('Método eliminado');
        setDeletingMethod(null);
      },
      onError: (error) => {
        toast.error(error.message);
        setDeletingMethod(null);
      },
    });
  }

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <Card data-testid="paymentMethodsSection">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Métodos de pago</CardTitle>
              <CardDescription>
                Define cómo tus clientes pueden pagarte. Se mostrarán en el pie de tus facturas.
              </CardDescription>
            </div>
            {methods.length > 0 && (
              <span
                className="text-sm text-muted-foreground whitespace-nowrap"
                data-testid="payment_methods_count"
              >
                {methods.length}/{MAX_PAYMENT_METHODS}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No tienes métodos de pago configurados</h3>
              <p className="text-muted-foreground max-w-md mt-1 mb-6">
                Agrega al menos un método de pago para poder crear facturas.
              </p>
              <Button onClick={handleAdd} data-testid="add_payment_method_button">
                <Plus className="mr-2 h-4 w-4" />
                Agregar tu primer método de pago
              </Button>
            </div>
          ) : (
            <>
              <div>
                {methods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    isLastActive={isLastActive}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onToggle={handleToggle}
                    isToggling={updateMutation.isPending}
                  />
                ))}
              </div>

              <div className="mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button
                          variant="outline"
                          onClick={handleAdd}
                          disabled={isMaxReached}
                          data-testid="add_payment_method_button"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar método de pago
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isMaxReached && (
                      <TooltipContent>
                        <p>Máximo 10 métodos de pago</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PaymentMethodFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingMethod(null);
        }}
        onSave={handleSave}
        method={editingMethod}
        country={country}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMethod} onOpenChange={(open) => !open && setDeletingMethod(null)}>
        <AlertDialogContent data-testid="delete_payment_method_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este método de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El método &quot;{deletingMethod?.label}&quot; será
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete_cancel_button">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="delete_confirm_button"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
