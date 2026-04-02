'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Clock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reminderFeatures = [
  {
    icon: Bell,
    text: 'Recordatorios automáticos cuando una factura vence',
  },
  {
    icon: Clock,
    text: 'Frecuencia configurable: cada 3, 7 o 14 días',
  },
  {
    icon: Mail,
    text: 'Mensajes personalizados con tu tono de voz',
  },
  {
    icon: Shield,
    text: 'Sin incomodidad: el sistema cobra por ti',
  },
];

export function RemindersSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-violet-50/30 to-background dark:via-violet-950/20" />

      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Image */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/30">
              <Image
                src="/images/landing/invoice-sending-illustration.png"
                alt="Envío automático de facturas y recordatorios de cobro"
                width={1264}
                height={848}
                className="w-full h-auto"
                quality={85}
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-violet-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                Pro
              </span>
              Recordatorios Automáticos
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Cobra sin{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                vergüenza
              </span>
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              El <span className="text-foreground font-medium">65% de los freelancers</span> en LATAM
              evita enviar recordatorios de pago por incomodidad. Con SoloQ Pro, el sistema lo hace
              por ti de forma profesional y automática.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-4">
              {reminderFeatures.map((feature, index) => (
                <motion.li
                  key={feature.text}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                    <feature.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-foreground mt-0.5">{feature.text}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                asChild
                className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300"
              >
                <Link href="/signup?plan=pro">
                  Probar Pro 30 días gratis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
