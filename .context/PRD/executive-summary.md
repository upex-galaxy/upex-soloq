# Executive Summary - SoloQ

> **Product Requirements Document**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## 1. Problem Statement

### Pain Point Crítico

Los freelancers y trabajadores independientes en Latinoamérica **no tienen una herramienta accesible para facturar profesionalmente y hacer seguimiento de sus cobros**.

**Situación actual:**
- Crean facturas manualmente en Word/Excel (15-30 minutos por factura)
- Las envían por WhatsApp o email sin formato profesional
- No tienen visibilidad de quién les debe dinero ni cuánto
- Sienten vergüenza de enviar recordatorios de pago
- Usan métodos de pago fragmentados (transferencia, PayPal, Mercado Pago, efectivo)

**Impacto medible:**
- Pierden **>10% de sus ingresos** por facturas no cobradas o cobradas tarde
- Tiempo promedio de cobro: **30-45 días** (cuando sí pagan)
- Imagen poco profesional ante clientes que pagan premium

### Por qué las soluciones actuales no funcionan

| Solución Actual | Problema |
|-----------------|----------|
| FreshBooks, QuickBooks | Precio prohibitivo ($17-50/mes), en inglés, demasiado complejo |
| Wave | Solo en inglés, interfaz confusa, no opera en LATAM |
| Holded | Enfocado en España, precio alto para LATAM |
| Excel/Word | Sin seguimiento, sin recordatorios, imagen amateur |
| PayPal.me / Links | Sin facturas, sin gestión de clientes |

---

## 2. Solution Overview

**SoloQ** es una webapp de facturación diseñada para freelancers latinoamericanos que quieren:

### Core Features MVP

1. **Crear facturas profesionales** en menos de 2 minutos
   - Templates con logo y datos del freelancer
   - Items con descripción, cantidad, precio
   - Cálculo automático de subtotal, impuestos, total

2. **Gestionar clientes** de forma simple
   - Base de datos de clientes con datos de contacto
   - Historial de facturas por cliente
   - Métodos de pago preferidos del cliente

3. **Configurar métodos de pago flexibles**
   - CLABE/CBU/cuenta bancaria
   - Links de PayPal, Mercado Pago, etc.
   - Cualquier texto personalizado

4. **Enviar facturas por email** con un click
   - PDF profesional adjunto
   - Datos de pago incluidos en el email

5. **Dashboard de seguimiento**
   - Facturas pendientes, pagadas, vencidas
   - Monto total por cobrar
   - Alertas de facturas vencidas

6. **Marcar facturas como pagadas** con detalles
   - Método de pago utilizado
   - Monto recibido
   - Notas opcionales

7. **Recordatorios automáticos** (Pro)
   - Emails automáticos para facturas vencidas
   - Frecuencia configurable
   - El sistema cobra por ti, sin vergüenza

---

## 3. Success Metrics

### KPIs de Adopción (3 meses post-launch)

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Usuarios registrados | 1,000 | Supabase Auth |
| MAU (Monthly Active Users) | 300 | Usuarios que crean/envían facturas |
| Time to First Invoice | <10 min | Analytics de onboarding |

### KPIs de Engagement

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Facturas creadas | 2,000 | Eventos en DB |
| Facturas enviadas por email | 1,500 | Logs de Resend |
| Facturas marcadas como pagadas | 500 | DB tracking |
| Retention D7 | >40% | Usuarios activos 7 días después de registro |

### KPIs de Negocio

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Conversión Free→Pro | 8% | Subscripciones / Total usuarios |
| MRR | $500-800 | Stripe (suscripciones) |
| Churn mensual Pro | <10% | Cancelaciones / Total Pro |
| NPS | >40 | Encuesta in-app |

### KPIs de Valor (Hipótesis a validar)

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Reducción tiempo de cobro (Pro) | >30% | Días factura enviada → marcada pagada |
| Tiempo creación factura | <2 min | Analytics de flujo |

---

## 4. Target Users

### Persona 1: Diseñador Freelance

**Nombre:** Carlos, 32 años, Ciudad de México

**Perfil:**
- Diseñador gráfico independiente
- Factura $2,000-4,000 USD/mes
- 5-8 clientes activos
- Trabaja desde casa

**Pain Point Principal:**
> "Pierdo tiempo haciendo facturas en Canva y luego las mando por WhatsApp. Nunca sé exactamente cuánto me deben en total."

### Persona 2: Desarrolladora Freelance

**Nombre:** Valentina, 28 años, Bogotá, Colombia

**Perfil:**
- Desarrolladora web frontend
- Factura $3,000-6,000 USD/mes
- 3-5 clientes (algunos internacionales)
- Trabaja para startups remotas

**Pain Point Principal:**
> "Mis clientes tardan 30+ días en pagarme y me da pena mandar recordatorios. Necesito algo que lo haga por mí."

### Persona 3: Consultor de Negocios

**Nombre:** Andrés, 41 años, Buenos Aires, Argentina

**Perfil:**
- Consultor de estrategia y marketing
- Factura $1,500-3,000 USD/mes
- 8-12 clientes (empresas medianas)
- Trabaja híbrido (casa + coworking)

**Pain Point Principal:**
> "El software de facturación que existe cuesta lo mismo que un día de mi trabajo. Solo necesito algo simple para facturar y cobrar."

---

## 5. Out of Scope (MVP)

Las siguientes funcionalidades **NO** están incluidas en el MVP:

- Facturación electrónica fiscal (SAT, DIAN, AFIP, SII)
- Multi-moneda avanzada (conversión automática)
- Contabilidad y reportes fiscales
- Facturas recurrentes automáticas
- App móvil nativa (solo webapp responsive)
- Integración con WhatsApp
- Integración con pasarelas de pago (Stripe, Mercado Pago)
- Cotizaciones / Presupuestos
- Time tracking
- Gestión de gastos

---

## 6. Tech Stack

| Capa | Tecnología | Razón |
|------|------------|-------|
| Frontend | Next.js 15 (App Router) | SSR, RSC, performance |
| Styling | TailwindCSS + shadcn/ui | Consistencia, rapidez, accesibilidad |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Infraestructura unificada, RLS |
| Forms | React Hook Form + Zod | Validación type-safe |
| PDF | @react-pdf/renderer | Server-side, control total |
| Email | Resend + React Email | Type-safe templates |
| Hosting | Vercel | Integración con Next.js |
| Types | TypeScript (strict) | Type safety end-to-end |

---

## 7. Timeline & Milestones

### Fase 2: Architecture (Actual)
- PRD completo (este documento)
- SRS con especificaciones técnicas
- Diseño de base de datos
- API contracts

### Fase 3: Backlog (Siguiente)
- Épicas y User Stories detalladas
- Test cases
- Implementation plans

### Fase 4-6: Development
- Setup del proyecto
- Implementación iterativa
- Testing continuo

### Fase 7+: Launch
- Beta con usuarios reales
- Iteración basada en feedback
- Launch público

---

*Documento parte del PRD de SoloQ - Fase 2 Architecture*
