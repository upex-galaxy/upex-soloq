import Link from 'next/link';
import {
  FileText,
  Clock,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  CreditCard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/site-header';

const features = [
  {
    icon: FileText,
    title: 'Facturas Profesionales',
    subtitle: 'En 2 minutos',
    description:
      'Crea facturas con tu logo, datos de negocio y métodos de pago. Templates profesionales que impresionan.',
  },
  {
    icon: Clock,
    title: 'Dashboard Inteligente',
    subtitle: 'Seguimiento en tiempo real',
    description:
      'Visualiza qué facturas están pendientes, pagadas o vencidas. Nunca pierdas de vista quién te debe.',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    subtitle: 'Sin vergüenza',
    description:
      'El sistema envía recordatorios por ti cuando una factura vence. Cobra sin incomodidad.',
  },
  {
    icon: CreditCard,
    title: 'Múltiples Métodos de Pago',
    subtitle: 'Flexibilidad total',
    description:
      'Acepta transferencias bancarias, PayPal, Mercado Pago, y más. Tus clientes eligen cómo pagar.',
  },
  {
    icon: Globe,
    title: 'Multi-Moneda',
    subtitle: 'Clientes globales',
    description:
      'Factura en USD, EUR, MXN, o la moneda que necesites. Perfecto para clientes internacionales.',
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    subtitle: 'Datos protegidos',
    description:
      'Tu información está encriptada y segura. Cumplimos con los estándares más exigentes.',
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

const stats = [
  { value: '10K+', label: 'Facturas creadas' },
  { value: '87%', label: 'Cobradas a tiempo' },
  { value: '$2M+', label: 'Total facturado' },
  { value: '4.9★', label: 'Satisfacción' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Layer */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-background via-background to-primary/5" />

        {/* Animated Orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Large floating orb - top left */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />

          {/* Medium orb - top right */}
          <div
            className="absolute -top-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Small orb - center right */}
          <div
            className="absolute top-1/2 -right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] animate-pulse"
            style={{ animationDelay: '2s' }}
          />

          {/* Bottom gradient orb */}
          <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
        </div>

        {/* Falling Lights Animation */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Light particles - Column 1 */}
          <div
            className="absolute top-0 left-[10%] w-px h-32 bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-fall"
            style={{ animationDuration: '3s', animationDelay: '0s' }}
          />
          <div
            className="absolute top-0 left-[15%] w-0.5 h-24 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-fall"
            style={{ animationDuration: '4s', animationDelay: '0.5s' }}
          />
          <div
            className="absolute top-0 left-[20%] w-px h-40 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-fall"
            style={{ animationDuration: '3.5s', animationDelay: '1s' }}
          />

          {/* Light particles - Column 2 */}
          <div
            className="absolute top-0 left-[30%] w-0.5 h-28 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-fall"
            style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}
          />
          <div
            className="absolute top-0 left-[35%] w-px h-36 bg-gradient-to-b from-transparent via-blue-500/35 to-transparent animate-fall"
            style={{ animationDuration: '4.2s', animationDelay: '1.2s' }}
          />
          <div
            className="absolute top-0 left-[40%] w-0.5 h-20 bg-gradient-to-b from-transparent via-cyan-300/45 to-transparent animate-fall"
            style={{ animationDuration: '3.2s', animationDelay: '0.7s' }}
          />

          {/* Light particles - Column 3 (center) */}
          <div
            className="absolute top-0 left-[50%] w-1 h-44 bg-gradient-to-b from-transparent via-primary/60 to-transparent animate-fall"
            style={{ animationDuration: '3.8s', animationDelay: '0.2s' }}
          />
          <div
            className="absolute top-0 left-[55%] w-px h-32 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent animate-fall"
            style={{ animationDuration: '2.5s', animationDelay: '1.5s' }}
          />

          {/* Light particles - Column 4 */}
          <div
            className="absolute top-0 left-[65%] w-0.5 h-36 bg-gradient-to-b from-transparent via-primary/35 to-transparent animate-fall"
            style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}
          />
          <div
            className="absolute top-0 left-[70%] w-px h-28 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent animate-fall"
            style={{ animationDuration: '3s', animationDelay: '1.8s' }}
          />
          <div
            className="absolute top-0 left-[75%] w-0.5 h-40 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent animate-fall"
            style={{ animationDuration: '3.7s', animationDelay: '0.4s' }}
          />

          {/* Light particles - Column 5 */}
          <div
            className="absolute top-0 left-[85%] w-px h-24 bg-gradient-to-b from-transparent via-primary/45 to-transparent animate-fall"
            style={{ animationDuration: '2.9s', animationDelay: '1.1s' }}
          />
          <div
            className="absolute top-0 left-[90%] w-0.5 h-32 bg-gradient-to-b from-transparent via-blue-400/35 to-transparent animate-fall"
            style={{ animationDuration: '4s', animationDelay: '0.6s' }}
          />

          {/* Extra sparkles */}
          <div
            className="absolute top-0 left-[25%] w-1 h-2 bg-white/60 rounded-full animate-fall blur-[1px]"
            style={{ animationDuration: '5s', animationDelay: '2s' }}
          />
          <div
            className="absolute top-0 left-[45%] w-1 h-2 bg-white/50 rounded-full animate-fall blur-[1px]"
            style={{ animationDuration: '4.5s', animationDelay: '2.5s' }}
          />
          <div
            className="absolute top-0 left-[60%] w-1 h-2 bg-white/55 rounded-full animate-fall blur-[1px]"
            style={{ animationDuration: '5.5s', animationDelay: '1.3s' }}
          />
          <div
            className="absolute top-0 left-[80%] w-1 h-2 bg-white/45 rounded-full animate-fall blur-[1px]"
            style={{ animationDuration: '4.8s', animationDelay: '3s' }}
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge with Glassmorphism */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md px-5 py-2 text-sm font-medium text-primary shadow-lg shadow-primary/5">
              <Zap className="h-4 w-4" />
              <span>Diseñado para freelancers latinoamericanos</span>
            </div>

            {/* Headline with Gradient */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Factura profesionalmente,{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                cobra a tiempo
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              Deja de perder dinero por facturas no cobradas. SoloQ te ayuda a crear facturas
              profesionales, dar seguimiento a pagos y enviar recordatorios automáticos — todo en
              español y pensado para LATAM.
            </p>

            {/* CTAs with Glassmorphism */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="text-base px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Link href="/signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 py-6 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300"
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-sm text-muted-foreground">
              ✨ Sin tarjeta de crédito • Facturas ilimitadas • Configuración en 5 minutos
            </p>

            {/* Stats Bar with Glassmorphism */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-8">
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 md:p-6 shadow-lg"
                >
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 md:py-32">
        {/* Subtle background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Características
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Todo lo que necesitas para facturar{' '}
              <span className="text-primary">como profesional</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sin complicaciones, sin curva de aprendizaje. Solo tú, tus facturas y tus cobros.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-primary/70">
                    {feature.subtitle}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Glassmorphism */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-400/15 rounded-full blur-[140px]" />
        </div>

        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Por qué SoloQ
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                El software de facturación que los freelancers{' '}
                <span className="text-primary">merecen</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Herramientas como FreshBooks o QuickBooks cuestan $17-50 USD/mes y están diseñadas
                para empresas. SoloQ está hecho para ti: simple, accesible y en tu idioma.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map(benefit => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-primary/5 transition-colors duration-200"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button size="lg" asChild className="shadow-lg shadow-primary/25">
                  <Link href="/signup">
                    Crear mi Primera Factura
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Card with Glassmorphism */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />

              <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-primary-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <BarChart3 className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Total Cobrado</p>
                        <p className="text-4xl font-bold">$12,450 USD</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-5 bg-background/80 backdrop-blur-sm">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Facturas enviadas</span>
                      <span className="font-semibold text-lg">24</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                      <span className="text-muted-foreground">Pagadas a tiempo</span>
                      <span className="font-semibold text-lg text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Tiempo promedio de cobro</span>
                      <span className="font-semibold text-lg">12 días</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Glassmorphism */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-primary/10 to-background" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-[120px]" />
        </div>

        <div className="container">
          <div className="mx-auto max-w-3xl">
            {/* Glassmorphism Card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 text-center shadow-2xl">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-blue-500/20 opacity-50" />

              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Deja de perder dinero por facturas{' '}
                  <span className="text-primary">no cobradas</span>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                  Los freelancers pierden en promedio 10% de sus ingresos por facturas que nunca
                  cobran. Con SoloQ, ese dinero vuelve a tu bolsillo.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="text-base px-8 py-6 shadow-lg shadow-primary/25"
                  >
                    <Link href="/signup">
                      Comenzar Gratis Ahora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Únete a miles de freelancers que ya cobran a tiempo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg">SoloQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SoloQ. Hecho con cariño para freelancers LATAM.
            </p>
            <div className="flex gap-8">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
