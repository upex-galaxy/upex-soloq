# User Journeys - SoloQ

> **Product Requirements Document**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## Journey 1: Registro y Primera Factura (Happy Path)

### Metadata

| Campo | Valor |
|-------|-------|
| **Persona** | Carlos (Diseñador Organizado) |
| **Scenario** | Carlos acaba de descubrir SoloQ y quiere probar la herramienta creando su primera factura |
| **Goal** | Registrarse, configurar perfil básico, y enviar primera factura a un cliente |
| **Duration estimada** | 8-12 minutos |

### Steps

#### Step 1: Landing y Registro

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos llega a la landing page y hace click en "Crear cuenta gratis" |
| **System Response** | Muestra formulario de registro con campos: email, contraseña, confirmar contraseña |
| **Pain Point** | Si el formulario es muy largo, Carlos puede abandonar |

#### Step 2: Verificación de Email

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos completa el formulario y hace click en "Registrarme" |
| **System Response** | Envía email de verificación, muestra pantalla "Revisa tu email" |
| **Pain Point** | Si el email tarda mucho o cae en spam, Carlos se frustra |

#### Step 3: Confirmar Email

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos abre el email y hace click en el link de verificación |
| **System Response** | Verifica cuenta, redirige al onboarding con mensaje de bienvenida |
| **Pain Point** | Si el link expira rápido, Carlos necesita reenviar |

#### Step 4: Onboarding - Datos de Negocio

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos completa nombre de negocio, email de contacto, teléfono |
| **System Response** | Guarda datos, avanza al siguiente paso del onboarding |
| **Pain Point** | Si hay demasiados campos obligatorios, Carlos puede sentirse abrumado |

#### Step 5: Onboarding - Logo (opcional)

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos sube su logo (o hace click en "Saltar por ahora") |
| **System Response** | Procesa imagen, muestra preview, permite continuar |
| **Pain Point** | Si el formato de imagen no es soportado, Carlos se confunde |

#### Step 6: Onboarding - Métodos de Pago

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos agrega su CLABE bancaria y su link de PayPal |
| **System Response** | Guarda métodos de pago, completa onboarding |
| **Pain Point** | Si no entiende qué información poner, Carlos necesita ayuda |

#### Step 7: Dashboard Vacío

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos ve el dashboard vacío con un CTA prominente "Crear primera factura" |
| **System Response** | Muestra empty state con guía visual de qué hacer |
| **Pain Point** | Si el dashboard se ve vacío y confuso, Carlos no sabe qué hacer |

#### Step 8: Crear Cliente

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos hace click en "Crear factura" y el sistema pide seleccionar cliente. Como no tiene, hace click en "Agregar cliente" |
| **System Response** | Abre modal/drawer para crear cliente con campos básicos |
| **Pain Point** | Si tiene que salir del flujo de factura para crear cliente, pierde contexto |

#### Step 9: Agregar Datos del Cliente

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos ingresa: nombre de cliente, email, empresa (opcional) |
| **System Response** | Valida datos, guarda cliente, lo selecciona automáticamente para la factura |
| **Pain Point** | Validación de email frustrante si es muy estricta |

#### Step 10: Agregar Items a la Factura

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos agrega items: "Diseño de logo - 1 - $500 USD" |
| **System Response** | Calcula subtotal y total automáticamente, permite agregar más items |
| **Pain Point** | Si la UI de agregar items es confusa, Carlos comete errores |

#### Step 11: Configurar Fecha y Número

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos verifica el número de factura (auto-generado) y establece fecha de vencimiento (30 días) |
| **System Response** | Muestra calendario para seleccionar fecha, sugiere opciones comunes (15, 30, 45 días) |
| **Pain Point** | Si el calendario es difícil de usar en móvil, Carlos se frustra |

#### Step 12: Previsualizar Factura

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos hace click en "Previsualizar" |
| **System Response** | Muestra preview del PDF con todos los datos, logo, métodos de pago |
| **Pain Point** | Si el preview tarda mucho en cargar, Carlos se impacienta |

#### Step 13: Enviar Factura

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos revisa que todo está bien y hace click en "Enviar por email" |
| **System Response** | Muestra modal de confirmación con preview del email, permite editar asunto/mensaje |
| **Pain Point** | Si no puede personalizar el mensaje, Carlos siente que pierde control |

#### Step 14: Confirmación de Envío

| Campo | Descripción |
|-------|-------------|
| **User Action** | Carlos confirma el envío |
| **System Response** | Envía email con PDF adjunto, muestra mensaje de éxito, actualiza estado a "Enviada" |
| **Pain Point** | Si no hay confirmación clara, Carlos duda si se envió |

### Expected Outcome

- Carlos tiene su cuenta configurada con datos de negocio
- Tiene su primer cliente en el sistema
- Su primera factura fue enviada exitosamente
- Puede ver la factura en el dashboard con estado "Enviada"

### Alternative Paths / Edge Cases

| Caso | Qué pasa |
|------|----------|
| Email ya registrado | Sistema muestra error claro "Este email ya tiene una cuenta" con link a login |
| Contraseña débil | Validación en tiempo real muestra requisitos faltantes |
| Upload de logo falla | Mensaje de error con formatos aceptados, opción de reintentar |
| Email del cliente inválido | Validación previene envío, sugiere revisar |
| Cliente no recibe email | Opción de reenviar, descargar PDF manualmente |

---

## Journey 2: Seguimiento y Cobro de Factura

### Metadata

| Campo | Valor |
|-------|-------|
| **Persona** | Valentina (Desarrolladora Internacional) |
| **Scenario** | Valentina envió una factura hace 35 días, está vencida, y quiere hacer seguimiento |
| **Goal** | Identificar factura vencida, enviar recordatorio, y registrar el pago cuando llegue |
| **Duration estimada** | 3-5 minutos |

### Steps

#### Step 1: Ver Dashboard

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina abre SoloQ y ve el dashboard |
| **System Response** | Muestra resumen con facturas por estado, destacando las vencidas en rojo/naranja |
| **Pain Point** | Si no es visualmente claro cuáles están vencidas, Valentina puede ignorarlas |

#### Step 2: Identificar Factura Vencida

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina ve la factura #INV-2024-015 marcada como "Vencida hace 5 días" |
| **System Response** | Muestra badge de estado, días de atraso, monto pendiente |
| **Pain Point** | Si no hay contexto de cuánto tiempo lleva vencida, no puede priorizar |

#### Step 3: Ver Detalle de Factura

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina hace click en la factura para ver detalle |
| **System Response** | Muestra factura completa con historial (enviada el X, vencía el Y, sin pago registrado) |
| **Pain Point** | Si tiene que navegar mucho para ver el historial, pierde tiempo |

#### Step 4: Enviar Recordatorio Manual (Free User)

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina hace click en "Reenviar factura" |
| **System Response** | Muestra modal con email pre-llenado (asunto: "Recordatorio: Factura #INV-2024-015 vencida") |
| **Pain Point** | Si el mensaje suena agresivo, Valentina querrá editarlo |

#### Step 5: Personalizar y Enviar

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina edita el mensaje para sonar más amigable y envía |
| **System Response** | Envía email, registra en historial "Recordatorio enviado", muestra confirmación |
| **Pain Point** | Si no puede personalizar, siente que pierde su "voz" |

#### Step 6: (Días después) Cliente Paga

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina recibe transferencia de su cliente y vuelve a SoloQ para registrar el pago |
| **System Response** | Dashboard muestra la misma factura, opción "Marcar como pagada" visible |
| **Pain Point** | Si tiene que buscar la factura, pierde tiempo |

#### Step 7: Registrar Pago

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina hace click en "Marcar como pagada" |
| **System Response** | Abre modal para registrar detalles: método (Wise), monto ($3,500), fecha (hoy), notas (opcional) |
| **Pain Point** | Si el monto no coincide con el facturado, necesita poder explicar |

#### Step 8: Confirmar Pago

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina completa los datos y confirma |
| **System Response** | Actualiza estado a "Pagada", muestra en historial, actualiza métricas del dashboard |
| **Pain Point** | Si no hay confirmación visual clara, duda si se guardó |

### Expected Outcome

- Valentina identificó rápidamente la factura vencida
- Envió un recordatorio personalizado
- Registró el pago con todos los detalles
- Su dashboard refleja correctamente la factura como pagada

### Alternative Paths / Edge Cases

| Caso | Qué pasa |
|------|----------|
| Cliente paga parcialmente | Opción de registrar pago parcial (monto menor al total) con nota |
| Valentina es Pro | Puede activar recordatorios automáticos en lugar de manuales |
| Factura ya tiene recordatorio programado | Muestra indicador y permite pausar |
| Cliente disputa la factura | Opción de agregar nota y marcar como "En disputa" |

---

## Journey 3: Configuración de Recordatorios Automáticos (Pro)

### Metadata

| Campo | Valor |
|-------|-------|
| **Persona** | Valentina (Desarrolladora Internacional) |
| **Scenario** | Valentina decide hacer upgrade a Pro para automatizar sus recordatorios |
| **Goal** | Suscribirse a Pro y configurar recordatorios automáticos |
| **Duration estimada** | 5-8 minutos |

### Steps

#### Step 1: Ver Limitación Free

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina intenta activar recordatorios automáticos para una factura |
| **System Response** | Muestra modal "Recordatorios automáticos es una feature Pro" con beneficios y CTA "Upgrade" |
| **Pain Point** | Si el modal es muy pushy, Valentina se molesta |

#### Step 2: Explorar Beneficios Pro

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina hace click en "Ver más sobre Pro" |
| **System Response** | Muestra página de pricing con comparativa Free vs Pro, testimonios |
| **Pain Point** | Si la información es confusa, no puede tomar decisión |

#### Step 3: Iniciar Upgrade

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina hace click en "Upgrade a Pro - $9.99/mes" |
| **System Response** | Redirige a checkout de Stripe para procesar pago |
| **Pain Point** | Si el checkout tiene muchos pasos, puede abandonar |

#### Step 4: Completar Pago

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina ingresa datos de tarjeta y confirma |
| **System Response** | Procesa pago, activa suscripción, redirige de vuelta a SoloQ con mensaje de éxito |
| **Pain Point** | Si el pago falla, necesita mensaje claro de qué salió mal |

#### Step 5: Configurar Recordatorios Globales

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina va a Configuración > Recordatorios |
| **System Response** | Muestra opciones: activar/desactivar, frecuencia (cada X días), máximo de recordatorios |
| **Pain Point** | Si las opciones son muy complejas, se confunde |

#### Step 6: Personalizar Mensaje

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina edita el template del recordatorio con su tono de voz |
| **System Response** | Editor simple con variables ({cliente}, {factura}, {monto}, {dias_vencido}), preview |
| **Pain Point** | Si no puede usar variables, los emails se ven genéricos |

#### Step 7: Activar para Facturas Existentes

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina decide activar recordatorios para sus 3 facturas vencidas actuales |
| **System Response** | Muestra lista de facturas vencidas con toggle para activar recordatorios |
| **Pain Point** | Si tiene que hacerlo una por una, pierde tiempo |

#### Step 8: Confirmación

| Campo | Descripción |
|-------|-------------|
| **User Action** | Valentina confirma la configuración |
| **System Response** | Guarda configuración, muestra próximos recordatorios programados |
| **Pain Point** | Si no sabe cuándo se enviarán, siente falta de control |

### Expected Outcome

- Valentina es ahora usuario Pro
- Tiene recordatorios automáticos configurados globalmente
- Sus facturas vencidas enviarán recordatorios automáticamente
- Puede ver el historial de recordatorios enviados

### Alternative Paths / Edge Cases

| Caso | Qué pasa |
|------|----------|
| Tarjeta rechazada | Mensaje claro con opción de probar otra tarjeta |
| Quiere probar antes de pagar | Opción de trial 7 días (si aplica) |
| Cliente paga antes del recordatorio | Sistema detecta pago y cancela recordatorio programado |
| Quiere pausar para un cliente específico | Opción de excluir factura de recordatorios automáticos |

---

## Journey 4: Edición de Factura (Edge Case)

### Metadata

| Campo | Valor |
|-------|-------|
| **Persona** | Andrés (Consultor Tradicional) |
| **Scenario** | Andrés creó una factura pero se dio cuenta que el monto está mal antes de enviarla |
| **Goal** | Corregir la factura antes de enviarla al cliente |
| **Duration estimada** | 2-3 minutos |

### Steps

#### Step 1: Detectar Error

| Campo | Descripción |
|-------|-------------|
| **User Action** | Andrés revisa la factura en preview y nota que puso $500 en lugar de $5,000 |
| **System Response** | Preview muestra el error claramente (el monto se ve) |
| **Pain Point** | Si el preview es pequeño o difícil de leer, el error pasa desapercibido |

#### Step 2: Volver a Edición

| Campo | Descripción |
|-------|-------------|
| **User Action** | Andrés hace click en "Editar factura" |
| **System Response** | Vuelve al formulario de edición con todos los datos pre-llenados |
| **Pain Point** | Si tiene que empezar de cero, pierde el trabajo |

#### Step 3: Corregir Item

| Campo | Descripción |
|-------|-------------|
| **User Action** | Andrés edita el precio del item de $500 a $5,000 |
| **System Response** | Recalcula subtotal y total automáticamente |
| **Pain Point** | Si el recálculo no es automático, puede haber inconsistencias |

#### Step 4: Verificar y Guardar

| Campo | Descripción |
|-------|-------------|
| **User Action** | Andrés verifica el nuevo total y guarda |
| **System Response** | Guarda cambios, actualiza preview, permite continuar al envío |
| **Pain Point** | Si no hay confirmación de que se guardó, duda si los cambios aplicaron |

### Expected Outcome

- Andrés corrigió el error antes de enviar
- La factura ahora tiene el monto correcto
- Puede enviarla con confianza

### Alternative Paths / Edge Cases

| Caso | Qué pasa |
|------|----------|
| Factura ya fue enviada | Puede editar y "Reenviar" (el cliente recibe versión actualizada) |
| Factura ya está pagada | No se puede editar (o requiere revertir el pago primero) |
| Quiere descartar y empezar de nuevo | Opción de eliminar borrador |

---

## Resumen de Journeys

| Journey | Persona | Escenario | Complejidad |
|---------|---------|-----------|-------------|
| J1: Registro y Primera Factura | Carlos | Happy path completo | Media |
| J2: Seguimiento y Cobro | Valentina | Factura vencida | Baja |
| J3: Upgrade y Recordatorios | Valentina | Conversión Free→Pro | Media |
| J4: Edición de Factura | Andrés | Corrección de error | Baja |

---

*Documento parte del PRD de SoloQ - Fase 2 Architecture*
