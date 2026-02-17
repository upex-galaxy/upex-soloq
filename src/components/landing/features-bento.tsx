'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Bell,
  CreditCard,
  Globe,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: FileText,
    title: 'Facturas Profesionales',
    subtitle: 'En solo 2 minutos',
    description:
      'Crea facturas con tu logo, datos de negocio y métodos de pago. Templates que impresionan a tus clientes.',
    gradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    size: 'large',
    gridClass: 'md:col-span-2 md:row-span-2',
  },
  {
    icon: Clock,
    title: 'Dashboard en Tiempo Real',
    subtitle: 'Control total',
    description: 'Visualiza facturas pendientes, pagadas o vencidas al instante.',
    gradient: 'from-violet-500/15 to-transparent',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    size: 'small',
    gridClass: '',
  },
  {
    icon: CreditCard,
    title: 'Múltiples Métodos de Pago',
    subtitle: 'Flexibilidad total',
    description: 'Acepta transferencias, PayPal, Mercado Pago y más.',
    gradient: 'from-emerald-500/15 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    size: 'small',
    gridClass: '',
  },
  {
    icon: Globe,
    title: 'Multi-Moneda',
    subtitle: 'Clientes globales',
    description: 'Factura en USD, EUR, MXN o la moneda que necesites.',
    gradient: 'from-amber-500/15 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    size: 'small',
    gridClass: '',
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    subtitle: 'Datos protegidos',
    description: 'Información encriptada con los estándares más altos.',
    gradient: 'from-cyan-500/15 to-transparent',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-600',
    size: 'small',
    gridClass: '',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    subtitle: 'Cobra sin vergüenza',
    description:
      'El sistema envía recordatorios por ti cuando una factura vence. Nunca más tendrás que pedir el pago incómodamente.',
    gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
    size: 'large',
    badge: 'Pro',
    gridClass: 'md:col-span-2 md:row-span-2',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export function FeaturesBento() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-gray-50/50 to-background dark:via-gray-900/50" />

      <div className="container">
        {/* Section Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-1.5 text-sm font-medium text-primary">
            Características
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Todo lo que necesitas,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              nada que no
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sin complicaciones, sin curva de aprendizaje. Solo tú, tus facturas y tus cobros.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={feature.gridClass}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const isLarge = feature.size === 'large';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative h-full overflow-hidden rounded-3xl border border-border/50 bg-background p-6 md:p-8 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300',
        isLarge && 'min-h-[280px] md:min-h-[320px]'
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          feature.gradient
        )}
      />

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
              feature.iconBg
            )}
          >
            <feature.icon className={cn('h-6 w-6', feature.iconColor)} />
          </div>
          {feature.badge && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-500/25">
              {feature.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary/70">
            {feature.subtitle}
          </div>
          <h3 className={cn('font-bold', isLarge ? 'text-2xl md:text-3xl' : 'text-xl')}>
            {feature.title}
          </h3>
          <p
            className={cn(
              'mt-3 text-muted-foreground leading-relaxed',
              isLarge ? 'text-base md:text-lg' : 'text-sm'
            )}
          >
            {feature.description}
          </p>
        </div>

        {/* Learn more link for large cards */}
        {isLarge && (
          <div className="mt-6 flex items-center text-sm font-medium text-primary group-hover:underline">
            Saber más
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
