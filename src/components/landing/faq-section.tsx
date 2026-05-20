'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: '¿Es realmente gratis?',
    answer:
      'Si. El plan gratuito incluye facturas ilimitadas, clientes ilimitados, envio por email con PDF y dashboard de cobros. Sin limites de tiempo ni tarjeta de credito. El plan Pro agrega recordatorios automaticos, templates premium y analytics avanzados.',
  },
  {
    question: '¿Funciona para mi pais?',
    answer:
      'SoloQ esta disenado para freelancers de toda Latinoamerica. Puedes configurar tu moneda local, tipo de impuesto (IVA, ISR, etc.) y formato de factura segun tu pais. Funciona para Mexico, Colombia, Argentina, Chile, Peru y mas.',
  },
  {
    question: '¿Puedo personalizar mis facturas?',
    answer:
      'Por supuesto. Puedes agregar tu logo, datos de negocio, informacion fiscal y metodos de pago. Las facturas se generan como PDFs profesionales listos para enviar a tus clientes.',
  },
  {
    question: '¿Como cobro a mis clientes?',
    answer:
      'Crea tu factura, agregala a un cliente y enviala por email con un solo clic. El PDF se adjunta automaticamente. Desde el dashboard puedes ver el estado de cada factura (pendiente, pagada, vencida) y hacer seguimiento.',
  },
  {
    question: '¿Mis datos estan seguros?',
    answer:
      'Absolutamente. Usamos encriptacion en transito y en reposo. Tu informacion esta alojada en infraestructura segura con backups automaticos. No compartimos tus datos con terceros.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer:
      'Si, sin compromisos ni contratos. Si tienes el plan Pro, puedes cancelar cuando quieras y mantendras el acceso hasta el final de tu periodo de facturacion. Tus datos siempre te pertenecen.',
  },
  {
    question: '¿Que metodos de pago puedo ofrecer a mis clientes?',
    answer:
      'Puedes configurar multiples metodos de pago en tu perfil: transferencia bancaria, PayPal, Mercado Pago, efectivo y otros. Estos aparecen automaticamente en tus facturas para que tus clientes sepan como pagarte.',
  },
];

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
    >
      {/* Gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[130px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.2, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
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
            <HelpCircle className="h-4 w-4 text-blue-400" />
            Preguntas frecuentes
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            ¿Tienes{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              dudas?
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Respondemos las preguntas mas comunes sobre SoloQ.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="mx-auto max-w-3xl space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-base font-medium text-white">{item.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-colors',
                      openIndex === index ? 'text-blue-400' : 'text-gray-500'
                    )}
                  />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 text-sm leading-relaxed text-gray-400">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
