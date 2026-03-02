'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '10K+', label: 'Facturas creadas', icon: TrendingUp },
  { value: '87%', label: 'Cobradas a tiempo', icon: Clock },
  { value: '$2M+', label: 'Total facturado', icon: DollarSign },
  { value: '4.9★', label: 'Satisfacción', icon: Sparkles },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-20">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-400/25 to-purple-400/15 rounded-full blur-[100px]"
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/20 to-blue-400/15 rounded-full blur-[80px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="container relative py-20 md:py-28 lg:py-32">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-primary shadow-lg shadow-primary/5 hover:bg-primary/10 transition-colors">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>La herramienta #1 para freelancers LATAM</span>
              <span className="ml-1 text-amber-500">→</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">Factura en 2 minutos.</span>
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Cobra a tiempo.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Deja de perseguir pagos y perder horas en Excel.{' '}
            <span className="text-foreground font-medium">SoloQ</span> te ayuda a crear facturas
            profesionales, enviarlas por email y cobrar más rápido —{' '}
            <span className="text-primary font-medium">todo gratis</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              asChild
              className="group relative text-base px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
            >
              <Link href="/signup">
                <span className="relative z-10 flex items-center">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 py-6 backdrop-blur-sm bg-background/60 hover:bg-background/80 border-border/50 transition-all duration-300"
            >
              <Link href="#features">Ver características</Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> Sin tarjeta de crédito
            </span>
            <span className="hidden sm:block text-border">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> Facturas ilimitadas
            </span>
            <span className="hidden sm:block text-border">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> Configuración en 5 minutos
            </span>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={statsVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm p-5 md:p-6 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <stat.icon className="h-5 w-5 text-primary/60 mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
