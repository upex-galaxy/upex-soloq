import Link from 'next/link';

import { SiteHeader } from '@/components/layout/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="termsPage">
      <SiteHeader />
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <p className="text-sm text-muted-foreground">Ultima actualizacion: 2026-01-20</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Terminos de Servicio de SoloQ
            </h1>
            <p className="text-muted-foreground">
              Al usar SoloQ aceptas estos terminos. Queremos que tengas claridad sobre como funciona
              la plataforma y que esperamos de nuestros usuarios.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Uso permitido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                SoloQ esta pensado para freelancers y trabajadores independientes en LATAM. Puedes
                usar la plataforma para crear, enviar y registrar pagos de facturas propias.
              </p>
              <p>
                No esta permitido utilizar SoloQ para actividades ilegales, suplantacion de
                identidad o envio de comunicaciones no solicitadas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad del servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Trabajamos para mantener SoloQ disponible y seguro, pero pueden existir ventanas de
                mantenimiento o interrupciones no planificadas. Comunicaremos cualquier cambio
                relevante cuando sea posible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuenta y seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Eres responsable de mantener segura tu contrasena y la informacion de tu cuenta. Si
                detectas actividad sospechosa, contactanos inmediatamente.
              </p>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            Para mas informacion, escribenos a{' '}
            <Link
              href="mailto:support@soloq.app"
              className="text-primary hover:underline"
              data-testid="terms_support_email_link"
            >
              support@soloq.app
            </Link>
            .
          </div>
        </div>
      </main>
    </div>
  );
}
