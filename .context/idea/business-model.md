# Business Model Canvas - SoloQ

> **Plataforma de Facturación y Seguimiento de Cobros para Freelancers**
> Última actualización: 2026-01-20 (v2 - Sin pasarela de pagos)

---

## Problem Statement

Los freelancers y trabajadores independientes en Latinoamérica enfrentan un problema crítico: **no tienen herramientas accesibles para facturar profesionalmente y cobrar a tiempo**. Actualmente, muchos crean facturas en Word o Excel, las envían por WhatsApp, y esperan que el cliente se acuerde de pagar. No hay seguimiento, no hay recordatorios automáticos, y el proceso de cobro se vuelve incómodo y poco profesional.

El software de facturación existente (QuickBooks, FreshBooks, Holded) está diseñado para mercados desarrollados con precios en dólares ($15-50/mes) que resultan prohibitivos para freelancers latinoamericanos que ganan en moneda local. Además, estas plataformas tienen curvas de aprendizaje altas y funcionalidades excesivas que un freelancer no necesita.

El resultado es que los freelancers pierden dinero por facturas que nunca cobran, proyectan una imagen poco profesional ante sus clientes, y desperdician horas en tareas administrativas que podrían automatizarse. **Estiman perder >10% de sus ingresos por cobros fallidos o tardíos.**

---

## Business Model Canvas

### 1. Customer Segments

**Segmento Primario:**
- Freelancers independientes (diseñadores, desarrolladores, redactores, traductores, consultores)
- Edad: 25-45 años
- Ubicación: Latinoamérica (México, Colombia, Argentina, Chile, Perú)
- Ingresos: $500-5,000 USD/mes
- Manejan 3-15 clientes simultáneamente
- Facturan $500-10,000 USD/mes en total

**Segmento Secundario:**
- Microempresas (1-5 empleados)
- Profesionales de servicios independientes (abogados, contadores, arquitectos)
- Creadores de contenido que venden servicios

**Características Comunes:**
- Prefieren herramientas simples ("solo quiero facturar, no aprender contabilidad")
- Usan WhatsApp como canal principal de comunicación
- Trabajan principalmente en laptop, pero valoran mobile-first
- Desconfían de herramientas complicadas

### 2. Value Propositions

**Propuesta Principal:** *"Factura profesionalmente, haz seguimiento, automatiza recordatorios."*

| Pain Point | Solución SoloQ |
|------------|----------------|
| Crear facturas toma 15-30 min | Facturas profesionales en <2 minutos |
| Cobros tardan 15-45 días | Recordatorios automáticos reducen tiempo >30% (Pro) |
| Facturas en Word son amateur | Templates profesionales con logo y datos fiscales |
| Sin visibilidad de deudas | Dashboard con pendientes, pagadas, vencidas |
| Vergüenza de cobrar | El sistema envía recordatorios por ti automáticamente |
| Software caro ($25-50/mes) | Gratis ilimitado o $9.99/mes para features Pro |
| Métodos de pago varían por país | Configura tus propios métodos (transferencia, PayPal, Mercado Pago, etc.) |

**Diferenciadores Clave:**
1. **Gratis e ilimitado** para facturación básica (vs 14-day trial de competidores)
2. Interfaz 100% en español nativo
3. Simplicidad radical - solo lo necesario
4. **Flexibilidad de pagos**: configura tus propios métodos de cobro (sin depender de pasarelas)
5. Recordatorios automáticos sin fricción social (Pro)

### 3. Channels

| Canal | Tipo | Estrategia |
|-------|------|------------|
| **SEO/Blog** | Adquisición | Keywords: "facturación freelancers", "cobrar clientes morosos", "templates facturas" |
| **Comunidades** | Adquisición | Grupos Facebook/Discord de freelancers LATAM, foros Workana/Freelancer.com |
| **Referidos** | Adquisición | $5 crédito por cada referido que pague (viral loop) |
| **Email** | Retención | Onboarding, tips, recordatorios de uso |
| **In-app** | Retención | Notificaciones de facturas abiertas/pagadas |

### 4. Customer Relationships

| Tipo | Descripción |
|------|-------------|
| **Self-service** | Registro, onboarding guiado, centro de ayuda |
| **Automated** | Recordatorios de pago, notificaciones de apertura de facturas |
| **Community** | Base de conocimiento, FAQs, foros de usuarios |
| **Support** | Chat/email para usuarios Pro y Business |

**Métricas de Relación:**
- Onboarding completion rate: >70%
- Time to first invoice: <10 minutos
- Support response time: <4 horas (Pro/Business)

### 5. Revenue Streams

| Tier | Precio | Incluye | Target |
|------|--------|---------|--------|
| **Free** | $0/mes | Facturas ilimitadas, clientes ilimitados, PDF profesional, métodos de pago configurables | Freelancers que empiezan |
| **Pro** | $9.99 USD/mes | Todo Free + Recordatorios automáticos + Reportes avanzados + Templates premium + Notificación de apertura + Export CSV | Freelancers activos |

**Feature Gates (Free vs Pro):**

| Feature | Free | Pro |
|---------|------|-----|
| Crear facturas | Ilimitado | Ilimitado |
| Gestión de clientes | Ilimitado | Ilimitado |
| Generar PDF | Sí | Sí |
| Envío por email | Sí | Sí |
| Métodos de pago personalizados | Sí | Sí |
| Templates de factura | 1 básico | 5+ premium |
| Recordatorios automáticos | No | Sí (configurable) |
| Reportes/Analytics | Básico | Avanzado |
| Notificación de apertura | No | Sí |
| Exportar datos (CSV) | No | Sí |

**Proyección de Revenue (Año 1):**
- Target: 1,000 usuarios (free ilimitado atrae más), 8% conversión Free→Pro = 80 usuarios pagando
- MRR estimado: $500-800 USD/mes al mes 12

### 6. Key Resources

| Recurso | Descripción |
|---------|-------------|
| **Plataforma Tech** | Next.js 15, Supabase, Vercel |
| **Templates** | Diseños de facturas profesionales pre-creados |
| **Integraciones** | Resend (email), @react-pdf/renderer (PDF generation) |
| **Data** | Historial de facturas, métricas de cobro, comportamiento de clientes |
| **Brand** | Nombre memorable "SoloQ", posicionamiento LATAM |

### 7. Key Activities

| Actividad | Prioridad MVP |
|-----------|---------------|
| Desarrollo de producto (features core) | Alta |
| Generación de contenido SEO | Alta |
| Onboarding y retención de usuarios | Alta |
| Soporte al cliente | Media |
| Partnerships con comunidades | Media |
| Mejoras de UX basadas en feedback | Continua |

### 8. Key Partners

| Partner | Valor |
|---------|-------|
| **Supabase** | Infraestructura de backend (DB, Auth, Storage) |
| **Resend** | Envío de emails transaccionales |
| **Vercel** | Hosting y deployment |
| **Comunidades Freelancers** | Workana, Freelancer.com, grupos FB/Discord - canal de adquisición |

### 9. Cost Structure

| Costo | Tipo | Estimado Mensual (MVP) |
|-------|------|------------------------|
| **Infraestructura** | Variable | $0-50 (Vercel, Supabase free tiers) |
| **Resend** | Variable | $0-20 (3,000 emails/mes gratis) |
| **Dominio** | Fijo | $1-2/mes |
| **Desarrollo** | Fijo | $0 (interno/educativo) |
| **Marketing** | Variable | $0-100 (content marketing orgánico) |

**Total Estimado MVP:** $20-100 USD/mes (costos operativos muy bajos sin pasarela de pagos)

---

## MVP Hypothesis

### Hipótesis 1: Problema Real
> "Los freelancers en LATAM pierden >10% de sus ingresos por facturas no cobradas o cobradas tarde."

**Cómo validar:**
- Encuesta a usuarios durante onboarding
- Tracking de facturas vencidas vs pagadas en la plataforma
- Comparar tiempo promedio de cobro antes/después de usar SoloQ

### Hipótesis 2: Solución Efectiva
> "Un sistema de recordatorios automáticos reduce el tiempo de cobro promedio en >30%."

**Cómo validar:**
- A/B test: usuarios con recordatorios vs sin recordatorios
- Medir días promedio desde envío hasta pago
- Target: reducir de 30 días promedio a <21 días

### Hipótesis 3: Disposición a Pagar
> "Freelancers están dispuestos a pagar $9.99/mes si el ROI es claro (cobran más de lo que pagan)."

**Cómo validar:**
- Conversión Free→Pro después de 30 días de uso
- Encuesta de willingness-to-pay durante onboarding
- Churn rate de usuarios Pro
- Target: >5% conversión, <10% churn mensual

---

## Métricas de Éxito MVP (3 meses)

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| Usuarios registrados | 1,000 | Supabase Auth |
| MAU (Monthly Active Users) | 300 | Usuarios que crean/envían facturas |
| Facturas creadas | 2,000 | Eventos en DB |
| Facturas marcadas como pagadas | 500 | DB tracking |
| Conversión Free→Pro | 8% | Subscripciones activas / Total usuarios |
| NPS | >40 | Encuesta in-app |
| Tiempo promedio de cobro (usuarios Pro) | <25 días | Analytics de facturas con recordatorios |

---

## Restricciones MVP

**NO incluir en MVP:**
- Facturación electrónica fiscal (SAT, DIAN, AFIP, etc.)
- Multi-moneda avanzada (solo USD + moneda local simple)
- Contabilidad (solo facturación y cobros)
- Facturas recurrentes
- App móvil nativa
- Integración WhatsApp

**SÍ incluir en MVP:**
- Tipos TypeScript generados desde Supabase
- Documentación OpenAPI desde el inicio
- RLS policies bien definidas
- Ambientes separados (dev, staging, prod)
- Alta testabilidad para QA Engineers

---

*Documento generado como parte de Fase 1 - Constitution del proyecto SoloQ.*
