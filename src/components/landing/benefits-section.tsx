'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, BarChart3, TrendingUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  'Facturas ilimitadas en el plan gratuito',
  'PDF profesional con tu logo y datos',
  'Envío por email con un solo click',
  'Dashboard de cobros en tiempo real',
  'Métodos de pago personalizables',
  'Soporte para múltiples monedas',
];

const painPoints = [
  { before: '30 min', after: '2 min', label: 'crear factura' },
  { before: '45 días', after: '12 días', label: 'tiempo de cobro' },
  { before: 'Manual', after: 'Auto', label: 'recordatorios' },
];

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export function BenefitsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[140px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Por qué SoloQ
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              El software de facturación que los freelancers{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                merecen
              </span>
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Herramientas como FreshBooks o QuickBooks cuestan{' '}
              <span className="text-foreground font-semibold">$17-50 USD/mes</span> y están
              diseñadas para empresas. SoloQ está hecho para ti:{' '}
              <span className="text-primary font-semibold">simple, accesible y en tu idioma</span>.
            </p>

            {/* Benefits List */}
            <motion.ul
              className="mt-8 space-y-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit) => (
                <motion.li
                  key={benefit}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 rounded-lg p-3 -mx-3 hover:bg-primary/5 transition-colors duration-200 cursor-default"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                asChild
                className="group shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Link href="/signup">
                  Crear mi Primera Factura
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl" />

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 p-6 md:p-8">
                  {/* Animated shine */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />

                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80 font-medium">Total Cobrado</p>
                      <p className="text-3xl md:text-4xl font-bold text-white">
                        $<CountUp end={12450} duration={2000} /> USD
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats rows */}
                <div className="p-6 space-y-4 bg-gradient-to-b from-gray-800 to-gray-900">
                  {/* Before/After comparison */}
                  <div className="grid grid-cols-3 gap-3">
                    {painPoints.map((point, index) => (
                      <motion.div
                        key={point.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-xs text-gray-500 line-through mb-1">{point.before}</div>
                        <div className="text-xl font-bold text-emerald-400">{point.after}</div>
                        <div className="text-xs text-gray-400 mt-1">{point.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4" />

                  {/* Metric rows */}
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50"
                    >
                      <span className="text-gray-400 text-sm">Facturas enviadas</span>
                      <span className="font-bold text-lg text-white">24</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 }}
                      className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        Pagadas a tiempo
                      </span>
                      <span className="font-bold text-lg text-emerald-400">87%</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-800/50"
                    >
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        Tiempo promedio de cobro
                      </span>
                      <span className="font-bold text-lg text-white">12 días</span>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
