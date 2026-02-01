import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';

import { SiteHeader } from '@/components/layout/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="contactPage">
      <SiteHeader />
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hablemos</h1>
            <p className="text-muted-foreground">
              Tienes preguntas sobre facturacion, onboarding o planes Pro? Escribenos y te
              respondemos en menos de 24 horas habiles.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Soporte por email</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-4 text-sm text-muted-foreground">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">support@soloq.app</p>
                <Link
                  href="mailto:support@soloq.app"
                  className="text-primary hover:underline"
                  data-testid="contact_support_email_link"
                >
                  Enviar correo
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comunidad de freelancers</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-4 text-sm text-muted-foreground">
              <MessageCircle className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p>
                  Pronto abriremos un espacio con tips de cobro, plantillas y recursos para
                  freelancers LATAM.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
