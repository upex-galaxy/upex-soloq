import Link from 'next/link';

import { SiteHeader } from '@/components/layout/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="privacyPage">
      <SiteHeader />
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <p className="text-sm text-muted-foreground">Ultima actualizacion: 2026-01-20</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Politica de Privacidad de SoloQ
            </h1>
            <p className="text-muted-foreground">
              SoloQ esta disenado para freelancers en Latinoamerica. Esta politica explica como
              recopilamos y protegemos tu informacion cuando creas facturas y das seguimiento a tus
              cobros.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Informacion que recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Recopilamos los datos minimos necesarios para operar la plataforma: email, datos de
                perfil de negocio, clientes e historial de facturas. Nunca almacenamos informacion
                de tarjetas; los pagos se procesan por proveedores externos como Stripe.
              </p>
              <p>
                Los datos de facturas y pagos se conservan por hasta 7 años para cumplir con
                practicas contables y legales comunes en LATAM.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como usamos tus datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Usamos tu informacion para generar facturas profesionales, enviar recordatorios y
                mostrar metricas de cobro. Tambien podemos enviarte comunicaciones operativas sobre
                el estado de tu cuenta.
              </p>
              <p>
                No vendemos ni compartimos tu informacion con terceros para fines publicitarios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad y acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Tus datos estan protegidos con cifrado en transito y en reposo. Implementamos Row
                Level Security en Supabase para asegurar que cada usuario solo acceda a su propia
                informacion.
              </p>
              <p>
                Si necesitas eliminar tu cuenta o exportar tus datos, contactanos y te guiaremos en
                el proceso.
              </p>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            Tienes dudas? Escribenos a{' '}
            <Link
              href="mailto:support@soloq.app"
              className="text-primary hover:underline"
              data-testid="privacy_support_email_link"
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
