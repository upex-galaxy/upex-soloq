# Business Data Map: SoloQ

╔══════════════════════════════════════════════════════════════════════════════╗
║ SOLOQ - BUSINESS DATA MAP                                                    ║
║ Plataforma de facturación y seguimiento de cobros para freelancers LATAM    ║
╚══════════════════════════════════════════════════════════════════════════════╝

## Resumen Ejecutivo

SoloQ ayuda a freelancers latinoamericanos a facturar de forma profesional en menos de dos minutos y a hacer seguimiento de cobros sin fricción. El valor del producto no es solo crear facturas, sino convertir un proceso manual, lento y vergonzoso en un flujo simple, claro y trazable.

El negocio gira alrededor de cuatro momentos: configurar el perfil del negocio, gestionar clientes, emitir facturas y cobrar a tiempo. Todo lo demás existe para hacer más confiable ese ciclo: PDFs profesionales, emails, dashboard, pagos, recordatorios y suscripción Pro.

## Actores Principales

┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ Freelancer           │ │ Cliente del freelancer│ │ Sistema externo      │
│ Crea y cobra         │ │ Recibe factura/email  │ │ Supabase/Resend/Stripe│
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘

## Propuesta de Valor

- Para el freelancer: menos tiempo administrando, más tiempo facturando.
- Para el cliente: recibe facturas claras, profesionales y con datos de pago.
- Para el negocio: más conversión a Pro gracias a recordatorios y seguimiento.

## Mapa de Entidades

┌───────────────┐
│ auth.users    │
└──────┬────────┘
       │ crea sesión / perfil
       ▼
┌──────────────────┐      ┌─────────────────────┐
│ profiles         │──────▶│ business_profiles   │
└──────────────────┘      └─────────┬───────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │ payment_methods         │
                        └────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│ clients          │──────▶│ invoices         │──────▶│ invoice_items      │
└──────────────────┘      └─────────┬────────┘      └────────────────────┘
                                    │
                                    ├──────────────▶┌────────────────────┐
                                    │               │ payments           │
                                    │               └────────────────────┘
                                    │
                                    ├──────────────▶┌────────────────────┐
                                    │               │ invoice_events     │
                                    │               └────────────────────┘
                                    │
                                    └──────────────▶┌────────────────────┐
                                                    │ reminder_settings  │
                                                    └────────────────────┘

┌────────────────────┐
│ subscription       │
└────────────────────┘

### Rol de Negocio de Cada Entidad

| Entidad | Rol en el negocio | Por qué existe |
| --- | --- | --- |
| `profiles` | Identidad operativa del usuario | Necesitamos un perfil base para auditar actividad y preferencias |
| `business_profiles` | Marca y datos de facturación | La factura debe reflejar al freelancer o negocio |
| `payment_methods` | Opciones de cobro | Reduce fricción al cliente al pagar |
| `clients` | Directorio de clientes | Evita rehacer datos de contacto en cada factura |
| `invoices` | Núcleo de cobro | Representa la obligación de pago y su estado |
| `invoice_items` | Detalle de servicios | Permite explicar qué se cobró |
| `payments` | Registro de cobro real | Separa “facturado” de “cobrado” |
| `invoice_events` | Trazabilidad | Ayuda a rastrear envío, pago y recordatorios |
| `reminder_settings` | Automatización Pro | Habilita seguimientos automáticos |
| `subscription` | Monetización | Controla Free vs Pro |

## Flujos de Negocio

═══════════════════════════════════════════════════════════════════════════════
FLUJO 1: Onboarding y configuración del negocio
═══════════════════════════════════════════════════════════════════════════════

Usuario → registro/login → crea perfil de negocio → define datos fiscales y métodos de pago.

Por qué importa:
- Si este flujo falla, el usuario no puede facturar con identidad profesional.

Reglas de negocio:
- Un usuario debe poder completar su perfil antes de emitir facturas de forma consistente.
- El logo y datos de negocio deben reutilizarse en PDF y emails.

Efectos secundarios:
- Se habilita el resto de la experiencia y se reducen errores en facturas futuras.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 2: Gestión de clientes
═══════════════════════════════════════════════════════════════════════════════

Usuario → crea/edita cliente → lo usa como destinatario de futuras facturas.

Por qué importa:
- El cliente es el punto de anclaje de facturación, historial y seguimiento.

Reglas de negocio:
- Un cliente pertenece a un solo usuario.
- No debe duplicarse fácilmente por email.
- Si el cliente ya tiene facturas, eliminarlo requiere tratamiento cuidadoso.

Efectos secundarios:
- Se habilita historial por cliente y búsquedas rápidas.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 3: Creación de factura
═══════════════════════════════════════════════════════════════════════════════

Usuario → selecciona cliente → agrega items → define vencimiento → guarda borrador o factura lista.

Por qué importa:
- Es el corazón del producto; aquí se genera el dinero potencial.

Reglas de negocio:
- Los cálculos deben ser consistentes.
- La numeración debe ser única por usuario.
- Una factura enviada o pagada tiene restricciones mayores de edición.

Efectos secundarios:
- Se crean eventos, totales y estados que alimentan dashboard y cobro.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 4: PDF profesional
═══════════════════════════════════════════════════════════════════════════════

Factura → render PDF → incluye logo, datos del negocio, cliente, items y métodos de pago.

Por qué importa:
- El PDF es la evidencia profesional que el cliente recibe.

Reglas de negocio:
- Debe reflejar exactamente la factura persistida.
- Si cambian datos del negocio, el PDF también debe cambiar.

Efectos secundarios:
- Puede guardarse en storage para reutilización.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 5: Envío por email
═══════════════════════════════════════════════════════════════════════════════

Factura → genera PDF → envía email con adjunto → marca estado enviado → registra evento.

Por qué importa:
- Convierte una factura interna en una acción de cobro real.

Reglas de negocio:
- El email debe incluir datos suficientes para pagar.
- El estado debe pasar a enviada cuando el envío es exitoso.

Efectos secundarios:
- Se alimenta el tracking y el historial de comunicaciones.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 6: Dashboard y tracking
═══════════════════════════════════════════════════════════════════════════════

Facturas → agregaciones → resumen de pendientes, vencidas y pagadas.

Por qué importa:
- Le da al freelancer visibilidad financiera inmediata.

Reglas de negocio:
- Los totales deben coincidir con el estado real de las facturas.
- Las vencidas deben destacarse con claridad.

Efectos secundarios:
- Sirve como base para priorizar seguimiento.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 7: Registro de pago
═══════════════════════════════════════════════════════════════════════════════

Factura enviada/vencida → registrar pago → cambia a pagada → conserva trazabilidad.

Por qué importa:
- Cierra el ciclo de negocio y permite medir ingresos reales.

Reglas de negocio:
- No debería poder pagarse dos veces sin control.
- El monto y la fecha importan para consistencia financiera.

Efectos secundarios:
- El dashboard cambia y se registra el evento de pago.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 8: Recordatorios automáticos (Pro)
═══════════════════════════════════════════════════════════════════════════════

Factura vencida → job automático → email recordatorio → incrementa contador.

Por qué importa:
- Es la feature que monetiza la propuesta Pro y reduce cobros tardíos.

Reglas de negocio:
- Solo aplica a usuarios Pro.
- Debe respetar frecuencia y máximo de recordatorios.
- No debe insistir indefinidamente.

Efectos secundarios:
- Aumenta probabilidades de cobro y genera historial de recordatorios.

═══════════════════════════════════════════════════════════════════════════════
FLUJO 9: Suscripción
═══════════════════════════════════════════════════════════════════════════════

Free → checkout → webhook de Stripe → Pro activo.

Por qué importa:
- Controla el acceso a features premium.

Reglas de negocio:
- El estado de suscripción debe sincronizarse con el proveedor.
- Si falla el pago, el plan debe reflejarlo.

Efectos secundarios:
- Habilita recordatorios y features Pro.

## State Machines

### Invoice Status Machine

┌─────────────────────────────────────────────────────────────────────────────┐
│ INVOICE STATUS MACHINE                                                      │
│─────────────────────────────────────────────────────────────────────────────│
│ draft ──────▶ sent ──────▶ paid                                             │
│    │            │                                                            │
│    │            ├──────▶ overdue ──────▶ paid                                │
│    │            │                                                            │
│    └────────────┴────────▶ cancelled                                         │
└─────────────────────────────────────────────────────────────────────────────┘

Transiciones clave:
- `draft` → `sent`: el usuario envía la factura.
- `sent` → `overdue`: vence sin pago.
- `overdue` → `paid`: el cliente paga tarde.
- `draft/sent` → `cancelled`: se anula por corrección o decisión de negocio.

### Subscription Machine

free → checkout/active → pro active → canceled/past_due

## Procesos Automáticos

### Email de verificación
- Se dispara al crear cuenta.
- Existe para validar identidad y evitar cuentas basura.

### Generación de PDF
- Se ejecuta al previsualizar o enviar factura.
- Evita que el usuario arme documentos manualmente.

### Recordatorios programados
- Corren en usuarios Pro con facturas vencidas.
- Resuelven el problema de seguimiento repetitivo.

### Webhooks de suscripción
- Sincronizan el estado real de pago con la app.
- Evitan desajustes entre Stripe y SoloQ.

### Invoice events
- Registran cambios relevantes del ciclo de cobro.
- Sirven para soporte, auditoría y analítica.

## Integraciones Externas

### Supabase
- Auth: autenticación y sesiones.
- PostgreSQL: fuente de verdad de los datos.
- Storage: logos y PDFs.

### Resend
- Envío de facturas y recordatorios por email.

### Stripe
- Suscripción Pro y webhooks de estado.

### Vercel
- Hosting y despliegue del frontend.

## Lo que más conviene testear después

- Registro/login/onboarding.
- Creación y edición de clientes.
- Creación de facturas y cálculos.
- Generación y envío de PDF/email.
- Registro de pagos y cambio de estados.
- Recordatorios automáticos Pro.
- Upgrade/downgrade de suscripción.

**Última actualización:** 2026-03-23
