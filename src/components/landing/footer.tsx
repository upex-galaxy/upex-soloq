'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Mail, Heart } from 'lucide-react';

const footerLinks = {
  producto: [
    { label: 'Características', href: '#features' },
    { label: 'Precios', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Roadmap', href: '#' },
  ],
  recursos: [
    { label: 'Blog', href: '#' },
    { label: 'Guías', href: '#' },
    { label: 'Ayuda', href: '#' },
    { label: 'API Docs', href: '#' },
  ],
  legal: [
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Términos', href: '/terms' },
    { label: 'Cookies', href: '#' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/soloqapp', icon: Twitter },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/soloq', icon: Linkedin },
    { label: 'GitHub', href: 'https://github.com/soloq', icon: Github },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-gray-950 text-gray-400">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/images/branding/logo-icon-only-transparent.png"
                alt="SoloQ"
                width={40}
                height={40}
                className="rounded-xl group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-xl text-white">SoloQ</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              La herramienta de facturación diseñada para freelancers latinoamericanos. Crea
              facturas profesionales, gestiona clientes y cobra a tiempo.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Producto
            </h3>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Recursos
            </h3>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Contacto
              </h3>
              <a
                href="mailto:hola@soloq.app"
                className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                hola@soloq.app
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SoloQ. Todos los derechos reservados.
          </p>

          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            Hecho con{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> para freelancers LATAM
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
