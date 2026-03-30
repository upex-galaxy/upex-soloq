# Testing Guide: SoloQ

╔══════════════════════════════════════════════════════════════════════════════╗
║ GUÍA DE TESTING                                                              ║
║ "Qué validar y por qué importa"                                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

> Este documento asume que ya leíste `.context/business-data-map.md` para entender los flujos. Aquí te explico qué deberías testear y qué considerar.

## Visión General

Si tuviera que priorizar qué testear primero, me enfocaría en:

1. **Autenticación y onboarding** - Porque sin cuenta no existe el resto del producto.
2. **Facturación y totales** - Porque ahí se juega la confianza financiera.
3. **Envío de factura y PDF** - Porque es el paso que convierte datos en cobro real.
4. **Tracking de pagos** - Porque cierra el ciclo de negocio.
5. **Recordatorios Pro** - Porque es una parte sensible del producto pago.

## Dependencias entre flujos

    Registro/Login
         │
         ▼
    Perfil de negocio ─────► PDF y Email
         │                       │
         ▼                       ▼
    Clientes ───────────────► Facturas ─────────────► Pagos
                                     │                  │
                                     ▼                  ▼
                               Dashboard            Recordatorios Pro

Esto significa que si algo falla en la base de cuenta o en los datos del negocio, casi todo lo demás se ve afectado.

## Qué testear por flujo

### Autenticación y onboarding

Este flujo es crítico porque desbloquea el resto de la experiencia.

Lo básico que debería funcionar es:
- Crear cuenta.
- Iniciar sesión.
- Recuperar acceso.
- Completar el perfil inicial.

Escenarios que podrían romperse:
- Emails no verificados.
- Sesiones expiradas o inconsistentes.
- Onboarding incompleto que deja al usuario a medias.

Reglas a validar:
- Solo el propietario debe ver sus datos.
- El perfil de negocio debe quedar listo para reutilizarse en facturas.

### Perfil de negocio

Este flujo importa porque define la identidad visual y fiscal de la factura.

Lo que conviene revisar:
- Guardado correcto de nombre, logo y datos fiscales.
- Persistencia de métodos de pago.
- Que los cambios impacten en PDF y emails.

Escenarios preocupantes:
- Logo inválido o ausente.
- Datos fiscales mal formateados.
- Método de pago principal no definido.

### Clientes

Es clave porque el usuario no debería volver a escribir lo mismo cada vez.

Validar:
- Alta, edición y listado.
- Búsqueda simple.
- Evitar duplicados obvios.
- Qué pasa si intento borrar un cliente con historial.

### Facturas

Este es el flujo más delicado del producto.

Validar:
- Selección de cliente.
- Agregado de items.
- Cálculo de subtotal, impuestos, descuentos y total.
- Numeración única.
- Vencimiento.
- Borrador vs enviada.

Escenarios que podrían romperse:
- Totales inconsistentes.
- Items vacíos o con valores extremos.
- Edición de una factura ya enviada.
- Numeración duplicada o fuera de secuencia.

### PDF y envío por email

Esto importa porque el cliente final ve esta salida, no la base de datos.

Validar:
- Que el PDF refleje exactamente lo guardado.
- Que el logo y datos del negocio aparezcan bien.
- Que el email lleve la factura correcta y los métodos de pago.

Escenarios a mirar con lupa:
- PDFs que cambian cuando cambian los datos del negocio.
- Emails enviados sin adjunto o con datos desalineados.
- Falla de proveedor externo.

### Dashboard y tracking

El dashboard debe contar la verdad financiera del usuario.

Validar:
- Totales pendientes, vencidos y pagados.
- Filtros por estado y cliente.
- Que las métricas coincidan con el estado de las facturas.

Escenarios de riesgo:
- Facturas con estados incoherentes.
- Datos agregados que no coinciden con el detalle.

### Registro de pagos

Convierte una promesa de cobro en ingreso real.

Validar:
- Cambio correcto de estado.
- Registro de método, monto y fecha.
- Posibilidad de revertir pagos si el negocio lo permite.

Escenarios que podrían romperse:
- Marcar como pagada una factura ya pagada.
- Montos parciales o inconsistentes.
- Reversión que deje el estado mal restaurado.

### Recordatorios automáticos

Este flujo es sensible porque es automatización orientada a negocio.

Validar:
- Solo aplica a Pro.
- Respeta frecuencia y máximo de recordatorios.
- Solo toca facturas vencidas elegibles.
- Registra historial correctamente.

Escenarios preocupantes:
- Duplicación de recordatorios.
- Recordatorios enviados fuera de frecuencia.
- Facturas pagadas que siguen recibiendo emails.

### Suscripción

Esto define quién puede usar qué.

Validar:
- Upgrade a Pro.
- Sincronización del estado real.
- Comportamiento ante cancelación o pago fallido.

## Máquinas de estado

Las máquinas de estado son críticas. Si una transición inválida es posible, el sistema puede quedar en un estado inconsistente.

### Invoice

- `draft` → `sent`.
- `sent` → `overdue`.
- `sent/overdue` → `paid`.
- `draft/sent` → `cancelled`.

También hay que validar que no ocurran transiciones inválidas:
- saltar estados intermedios,
- pagar dos veces,
- reactivar una cancelada sin regla clara.

### Subscription

Validar que el acceso a Pro cambie según el estado real del proveedor, no solo por UI.

## Procesos automáticos

### Verificación de email
- Verificar que se dispare al registrar cuenta.
- Verificar comportamiento si el token expira.

### Generación de PDF
- Revisar que no cambie contenido entre pantalla y archivo.
- Verificar que con datos faltantes no se rompa silenciosamente.

### Recordatorios programados
- Revisar frecuencia, idempotencia y límites.
- Verificar comportamiento si hay muchas facturas vencidas.

### Webhooks externos
- Verificar duplicados.
- Verificar payloads incompletos.
- Verificar reintentos y sincronización de estado.

## Integraciones externas

### Supabase
- Login, sesiones, RLS y persistencia.

### Resend
- Entrega de emails y adjuntos.

### Stripe
- Upgrade/downgrade y webhooks.

## Escenarios de integración

Hay casos donde un flujo afecta a otro y conviene probarlos juntos:

- Crear cliente → crear factura → enviar email → registrar pago.
- Actualizar perfil de negocio → regenerar PDF → reenviar factura.
- Vencimiento de factura → recordatorio → pago → dashboard actualizado.

## Edge cases que valen la pena

- Campos vacíos, largos o con caracteres especiales.
- Datos financieros en límites extremos.
- Zonas horarias y cambios de fecha.
- Estados concurrentes o acciones dobles.
- Falla temporal de servicios externos.

## Prioridad sugerida

Si el tiempo es limitado, yo priorizaría:

1. **Crítico:** login, crear factura, enviar factura, registrar pago.
2. **Alto:** PDF, dashboard, recordatorios Pro.
3. **Medio:** edición de perfil, búsqueda, filtros.
4. **Bajo:** mejoras visuales y casos muy raros.

## Qué revisar antes de un release

- ¿Los flujos principales funcionan?
- ¿Las transiciones de estado son correctas?
- ¿Los procesos automáticos siguen corriendo?
- ¿Las integraciones externas responden?

**Basado en:** `.context/business-data-map.md`

**Última actualización:** 2026-03-23
