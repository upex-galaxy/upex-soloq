import Link from 'next/link';
import { FileText, Clock, Bell, BarChart3, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/site-header';

const features = [
  {
    icon: FileText,
    title: 'Facturas Profesionales en 2 Minutos',
    description:
      'Crea facturas con tu logo, datos de negocio y métodos de pago. Templates profesionales que impresionan a tus clientes.',
  },
  {
    icon: Clock,
    title: 'Dashboard de Seguimiento Inteligente',
    description:
      'Visualiza qué facturas están pendientes, pagadas o vencidas. Nunca pierdas de vista quién te debe dinero.',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos sin Vergüenza',
    description:
      'El sistema envía recordatorios por ti cuando una factura vence. Cobra sin la incomodidad de pedirlo tú mismo.',
  },
];

const benefits = [
  'Facturas ilimitadas en el plan gratuito',
  'PDF profesional con tu logo y datos',
  'Envío por email con un click',
  'Dashboard de cobros en tiempo real',
  'Métodos de pago personalizables',
  'Soporte para múltiples monedas',
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 -z-10" />

        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Diseñado para freelancers latinoamericanos
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Factura profesionalmente, <span className="text-primary">cobra a tiempo</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Deja de perder dinero por facturas no cobradas. SoloQ te ayuda a crear facturas
              profesionales, dar seguimiento a pagos y enviar recordatorios automáticos — todo en
              español y pensado para LATAM.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-sm text-muted-foreground">
              Sin tarjeta de crédito • Facturas ilimitadas • Configuración en 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para facturar como profesional
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sin complicaciones, sin curva de aprendizaje. Solo tú, tus facturas y tus cobros.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map(feature => (
              <Card
                key={feature.title}
                className="relative overflow-hidden border-0 bg-background shadow-md transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                El software de facturación que los freelancers merecen
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Herramientas como FreshBooks o QuickBooks cuestan $17-50 USD/mes y están diseñadas
                para empresas. SoloQ está hecho para ti: simple, accesible y en tu idioma.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map(benefit => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Crear mi Primera Factura
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-0">
                  <div className="bg-primary p-6 text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8" />
                      <div>
                        <p className="text-sm opacity-90">Total Cobrado</p>
                        <p className="text-3xl font-bold">$12,450 USD</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Facturas enviadas</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pagadas a tiempo</span>
                      <span className="font-semibold text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tiempo promedio de cobro</span>
                      <span className="font-semibold">12 días</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary/5 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Deja de perder dinero por facturas no cobradas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Los freelancers pierden en promedio 10% de sus ingresos por facturas que nunca cobran.
              Con SoloQ, ese dinero vuelve a tu bolsillo.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild className="text-base">
                <Link href="/signup">
                  Comenzar Gratis Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-semibold">SoloQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SoloQ. Hecho con cariño para freelancers LATAM.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Términos
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
