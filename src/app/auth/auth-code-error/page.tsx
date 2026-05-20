'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md px-4">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Error de autenticacion</CardTitle>
            <CardDescription className="text-base">
              No pudimos completar el inicio de sesion. Esto puede ocurrir si el enlace expiro o ya
              fue utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Por favor, intenta iniciar sesion nuevamente. Si el problema persiste, solicita un
              nuevo enlace de verificacion.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Intentar de nuevo</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
