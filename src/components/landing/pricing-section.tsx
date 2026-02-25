'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  badge: string | null;
  popular: boolean;
  features: PlanFeature[];
  cta: string;
  ctaVariant: 'outline' | 'default';
  href: string;
}

const plans: Plan[] = [
  {
    name: 'Gratis',
    description: 'Todo lo esencial para empezar a facturar',
    price: '$0',
    period: '/mes',
    badge: null,
    popular: false,
    features: [
      { text: 'Facturas ilimitadas', included: true },
      { text: 'Clientes ilimitados', included: true },
      { text: 'Dashboard de cobros', included: true },
      { text: 'Envío por email con PDF', included: true },
      { text: 'Template profesional', included: true },
      { text: 'Multi-moneda', included: true },
      { text: 'Recordatorios automáticos', included: false },
      { text: 'Templates premium', included: false },
      { text: 'Analytics avanzados', included: false },
      { text: 'Export CSV/Excel', included: false },
    ],
    cta: 'Comenzar Gratis',
    ctaVariant: 'outline',
    href: '/signup',
  },
  {
    name: 'Pro',
    description: 'Para freelancers que quieren cobrar más rápido',
    price: '$9.99',
    period: '/mes',
    badge: 'Más popular',
    popular: true,
    features: [
      { text: 'Todo de Gratis', included: true, highlight: true },
      { text: 'Recordatorios automáticos', included: true, highlight: true },
      { text: 'Templates premium', included: true },
      { text: 'Analytics avanzados', included: true },
      { text: 'Export CSV/Excel', included: true },
      { text: 'Historial de pagos completo', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Personalización avanzada', included: true },
    ],
    cta: 'Probar 30 días gratis',
    ctaVariant: 'default',
    href: '/signup?plan=pro',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">

      {/* Gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                           linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Precios transparentes
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Un plan para{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              cada etapa
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Empieza gratis y actualiza cuando lo necesites. Sin sorpresas, sin compromisos.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="mx-auto max-w-4xl grid gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative rounded-3xl p-8 md:p-10',
                plan.popular
                  ? 'bg-gradient-to-b from-white to-gray-50 text-gray-900 shadow-2xl shadow-blue-500/20'
                  : 'bg-white/5 backdrop-blur-sm border border-white/10 text-white'
              )}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
                    <Crown className="h-4 w-4" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p
                  className={cn(
                    'mt-2 text-sm',
                    plan.popular ? 'text-gray-600' : 'text-gray-400'
                  )}
                >
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span
                    className={cn(
                      'text-lg font-medium',
                      plan.popular ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={cn(
                      'flex items-center gap-3 text-sm',
                      !feature.included && (plan.popular ? 'text-gray-400' : 'text-gray-500')
                    )}
                  >
                    {feature.included ? (
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                          feature.highlight
                            ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                            : plan.popular
                              ? 'bg-emerald-500'
                              : 'bg-emerald-500/80'
                        )}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                          plan.popular ? 'bg-gray-200' : 'bg-white/10'
                        )}
                      >
                        <X
                          className={cn(
                            'h-3 w-3',
                            plan.popular ? 'text-gray-400' : 'text-gray-500'
                          )}
                        />
                      </div>
                    )}
                    <span
                      className={cn(
                        feature.highlight && 'font-semibold',
                        feature.included
                          ? plan.popular
                            ? 'text-gray-700'
                            : 'text-gray-200'
                          : ''
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
                asChild
                className={cn(
                  'w-full text-base py-6',
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60'
                )}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              {/* Trust text */}
              <p
                className={cn(
                  'mt-4 text-center text-xs',
                  plan.popular ? 'text-gray-500' : 'text-gray-500'
                )}
              >
                {plan.popular
                  ? 'Cancela cuando quieras, sin preguntas'
                  : 'Sin tarjeta de crédito requerida'}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust badges */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Datos encriptados
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Sin contratos
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Soporte en español
          </span>
        </motion.div>
      </div>
    </section>
  );
}
