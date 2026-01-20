# MVP Scope - SoloQ

> **Product Requirements Document**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## 1. In Scope (Must Have)

### EPIC-SOLOQ-001: User Authentication & Onboarding

**Descripción:** Sistema de autenticación y configuración inicial del usuario.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 1.1 | Como usuario, quiero registrarme con mi email y contraseña, para crear mi cuenta en SoloQ | Must Have |
| US 1.2 | Como usuario, quiero hacer login con mis credenciales, para acceder a mi cuenta | Must Have |
| US 1.3 | Como usuario, quiero recuperar mi contraseña por email, para no perder acceso a mi cuenta | Must Have |
| US 1.4 | Como usuario, quiero cerrar sesión de forma segura, para proteger mi cuenta en dispositivos compartidos | Must Have |
| US 1.5 | Como usuario nuevo, quiero completar un onboarding guiado, para configurar mi perfil de negocio | Should Have |

---

### EPIC-SOLOQ-002: Business Profile Management

**Descripción:** Configuración del perfil de negocio del freelancer que aparecerá en las facturas.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 2.1 | Como usuario, quiero configurar mi nombre o nombre de negocio, para que aparezca en mis facturas | Must Have |
| US 2.2 | Como usuario, quiero subir mi logo, para personalizar mis facturas | Should Have |
| US 2.3 | Como usuario, quiero agregar mis datos de contacto (email, teléfono, dirección), para que mis clientes puedan contactarme | Must Have |
| US 2.4 | Como usuario, quiero configurar mis datos fiscales (RFC/NIT/CUIT), para que aparezcan en mis facturas | Should Have |
| US 2.5 | Como usuario, quiero configurar mis métodos de pago aceptados (CLABE, PayPal, etc.), para que mis clientes sepan cómo pagarme | Must Have |

---

### EPIC-SOLOQ-003: Client Management

**Descripción:** Gestión de la base de datos de clientes del freelancer.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 3.1 | Como usuario, quiero agregar un nuevo cliente con nombre y email, para poder facturarle | Must Have |
| US 3.2 | Como usuario, quiero ver la lista de todos mis clientes, para encontrar rápidamente a quien necesito facturar | Must Have |
| US 3.3 | Como usuario, quiero editar los datos de un cliente, para mantener la información actualizada | Must Have |
| US 3.4 | Como usuario, quiero agregar datos fiscales del cliente (RFC/NIT), para incluirlos en la factura | Should Have |
| US 3.5 | Como usuario, quiero ver el historial de facturas de un cliente, para tener contexto de nuestra relación | Should Have |
| US 3.6 | Como usuario, quiero eliminar un cliente que ya no uso, para mantener mi lista limpia | Could Have |

---

### EPIC-SOLOQ-004: Invoice Creation

**Descripción:** Creación y gestión de facturas.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 4.1 | Como usuario, quiero crear una nueva factura seleccionando un cliente, para comenzar a facturar | Must Have |
| US 4.2 | Como usuario, quiero agregar líneas de items (descripción, cantidad, precio unitario), para detallar mis servicios | Must Have |
| US 4.3 | Como usuario, quiero que el sistema calcule automáticamente subtotal y total, para evitar errores de cálculo | Must Have |
| US 4.4 | Como usuario, quiero agregar impuestos (IVA/porcentaje), para cumplir con requisitos fiscales | Should Have |
| US 4.5 | Como usuario, quiero agregar descuentos (porcentaje o monto fijo), para ofrecer promociones a clientes | Could Have |
| US 4.6 | Como usuario, quiero previsualizar la factura antes de enviarla, para verificar que todo está correcto | Must Have |
| US 4.7 | Como usuario, quiero asignar un número de factura único, para llevar control de mi numeración | Must Have |
| US 4.8 | Como usuario, quiero establecer una fecha de vencimiento, para definir cuándo espero el pago | Must Have |
| US 4.9 | Como usuario, quiero agregar notas o términos y condiciones, para comunicar información adicional | Should Have |
| US 4.10 | Como usuario, quiero guardar una factura como borrador, para terminarla después | Should Have |

---

### EPIC-SOLOQ-005: PDF Generation & Download

**Descripción:** Generación de facturas en formato PDF profesional.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 5.1 | Como usuario, quiero generar un PDF de mi factura con diseño profesional, para enviar a mi cliente | Must Have |
| US 5.2 | Como usuario, quiero que el PDF incluya mi logo y datos de negocio, para proyectar profesionalismo | Must Have |
| US 5.3 | Como usuario, quiero que el PDF incluya mis métodos de pago configurados, para que el cliente sepa cómo pagarme | Must Have |
| US 5.4 | Como usuario, quiero descargar el PDF a mi dispositivo, para guardarlo o enviarlo manualmente | Must Have |
| US 5.5 | Como usuario Pro, quiero elegir entre diferentes templates de factura, para personalizar mi estilo | Pro Feature |

---

### EPIC-SOLOQ-006: Invoice Sending

**Descripción:** Envío de facturas por email.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 6.1 | Como usuario, quiero enviar la factura por email al cliente con un click, para ahorrar tiempo | Must Have |
| US 6.2 | Como usuario, quiero que el email incluya el PDF adjunto, para que el cliente tenga la factura | Must Have |
| US 6.3 | Como usuario, quiero que el email incluya mis datos de pago, para facilitar el cobro | Must Have |
| US 6.4 | Como usuario, quiero personalizar el asunto y mensaje del email, para comunicarme mejor con mi cliente | Should Have |
| US 6.5 | Como usuario, quiero ver si el email fue enviado exitosamente, para tener certeza de que llegó | Must Have |

---

### EPIC-SOLOQ-007: Invoice Dashboard & Tracking

**Descripción:** Panel de control para visualizar y gestionar el estado de las facturas.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 7.1 | Como usuario, quiero ver un dashboard con todas mis facturas, para tener una vista general | Must Have |
| US 7.2 | Como usuario, quiero filtrar facturas por estado (borrador, enviada, pagada, vencida), para encontrar las que necesito | Must Have |
| US 7.3 | Como usuario, quiero ver el monto total pendiente de cobro, para conocer mi situación financiera | Must Have |
| US 7.4 | Como usuario, quiero ver facturas vencidas destacadas, para priorizar el seguimiento | Should Have |
| US 7.5 | Como usuario, quiero buscar facturas por cliente o número, para encontrar una específica | Should Have |
| US 7.6 | Como usuario, quiero ver un resumen de ingresos del mes, para trackear mi progreso | Could Have |

---

### EPIC-SOLOQ-008: Payment Tracking

**Descripción:** Registro de pagos recibidos y actualización de estado de facturas.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 8.1 | Como usuario, quiero marcar una factura como pagada, para actualizar su estado | Must Have |
| US 8.2 | Como usuario, quiero registrar el método de pago utilizado (transferencia, PayPal, etc.), para tener registro | Must Have |
| US 8.3 | Como usuario, quiero registrar el monto recibido, para verificar contra el total facturado | Must Have |
| US 8.4 | Como usuario, quiero agregar notas al pago (referencia de transferencia, etc.), para tener contexto | Should Have |
| US 8.5 | Como usuario, quiero registrar la fecha de pago, para llevar historial preciso | Must Have |
| US 8.6 | Como usuario, quiero poder revertir una factura de "pagada" a "pendiente", para corregir errores | Should Have |

---

### EPIC-SOLOQ-009: Automatic Reminders (Pro Feature)

**Descripción:** Sistema de recordatorios automáticos para facturas vencidas.

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 9.1 | Como usuario Pro, quiero que el sistema envíe recordatorios automáticos para facturas vencidas, para no tener que hacerlo manualmente | Pro Feature |
| US 9.2 | Como usuario Pro, quiero configurar la frecuencia de recordatorios (cada X días), para ajustar a mis necesidades | Pro Feature |
| US 9.3 | Como usuario Pro, quiero personalizar el mensaje de recordatorio, para mantener mi tono de comunicación | Pro Feature |
| US 9.4 | Como usuario Pro, quiero pausar recordatorios para una factura específica, para clientes con acuerdos especiales | Pro Feature |
| US 9.5 | Como usuario Pro, quiero ver el historial de recordatorios enviados, para saber cuántas veces he contactado al cliente | Pro Feature |

---

### EPIC-SOLOQ-010: Subscription Management

**Descripción:** Gestión de la suscripción del usuario (Free vs Pro).

| ID | User Story | Prioridad |
|----|------------|-----------|
| US 10.1 | Como usuario Free, quiero ver qué features están limitadas a Pro, para entender el valor de upgrade | Should Have |
| US 10.2 | Como usuario Free, quiero poder hacer upgrade a Pro fácilmente, para acceder a recordatorios automáticos | Should Have |
| US 10.3 | Como usuario Pro, quiero gestionar mi suscripción (ver fecha de renovación, cancelar), para tener control | Should Have |
| US 10.4 | Como usuario Pro, quiero ver mi historial de pagos de suscripción, para mis registros | Could Have |

---

## 2. Out of Scope (Nice to Have - v2+)

Las siguientes funcionalidades **NO** están en el MVP pero se consideran para versiones futuras:

### Facturación Avanzada
- Facturación electrónica fiscal (SAT, DIAN, AFIP, SII)
- Facturas recurrentes automáticas
- Cotizaciones / Presupuestos que se convierten en facturas
- Multi-moneda con conversión automática
- Múltiples impuestos configurables

### Finanzas y Reportes
- Reportes fiscales (ingresos por período)
- Gestión de gastos
- Proyecciones de cash flow
- Exportar datos a contadores (formato específico)

### Integraciones
- Integración con WhatsApp Business
- Integración con pasarelas de pago (Stripe, Mercado Pago)
- Integración con calendarios (Google Calendar)
- API pública para integraciones
- Zapier / Make integrations

### Experiencia de Usuario
- App móvil nativa (iOS/Android)
- Notificaciones push
- Modo offline
- Time tracking integrado

### Colaboración
- Múltiples usuarios por cuenta (equipo)
- Roles y permisos
- White-label (logo del cliente en lugar de SoloQ)

---

## 3. Success Criteria

### Criterios de Aceptación del MVP

El MVP se considera **completo** cuando:

| Criterio | Métrica | Target |
|----------|---------|--------|
| Usuarios pueden registrarse | Tasa de éxito de registro | >95% |
| Usuarios pueden crear facturas | Time to first invoice | <10 minutos |
| Facturas se generan en PDF | PDF generation success rate | >99% |
| Emails se envían correctamente | Email delivery rate | >98% |
| Dashboard muestra estados correctos | Data consistency | 100% |
| Recordatorios Pro funcionan | Emails enviados en tiempo | >95% |

### Métricas de Éxito Post-Launch (3 meses)

| Métrica | Target |
|---------|--------|
| Usuarios registrados | 1,000 |
| MAU | 300 |
| Facturas creadas | 2,000 |
| Conversión Free→Pro | 8% |
| NPS | >40 |
| Churn Pro | <10% mensual |

### Condiciones para Launch Público

1. **Funcionalidad completa**: Todas las US "Must Have" implementadas y testeadas
2. **Estabilidad**: <1% error rate en operaciones críticas
3. **Performance**: Page load <2s, API response <500ms
4. **Seguridad**: Auth funciona, RLS policies activas, no vulnerabilidades críticas
5. **UX validada**: Al menos 10 usuarios beta han completado el flujo completo

---

## 4. Resumen de Épicas

| Epic ID | Epic Title | # User Stories | Prioridad |
|---------|------------|----------------|-----------|
| EPIC-SOLOQ-001 | User Authentication & Onboarding | 5 | Must Have |
| EPIC-SOLOQ-002 | Business Profile Management | 5 | Must Have |
| EPIC-SOLOQ-003 | Client Management | 6 | Must Have |
| EPIC-SOLOQ-004 | Invoice Creation | 10 | Must Have |
| EPIC-SOLOQ-005 | PDF Generation & Download | 5 | Must Have |
| EPIC-SOLOQ-006 | Invoice Sending | 5 | Must Have |
| EPIC-SOLOQ-007 | Invoice Dashboard & Tracking | 6 | Must Have |
| EPIC-SOLOQ-008 | Payment Tracking | 6 | Must Have |
| EPIC-SOLOQ-009 | Automatic Reminders | 5 | Pro Feature |
| EPIC-SOLOQ-010 | Subscription Management | 4 | Should Have |

**Total User Stories MVP:** 57

---

*Documento parte del PRD de SoloQ - Fase 2 Architecture*
