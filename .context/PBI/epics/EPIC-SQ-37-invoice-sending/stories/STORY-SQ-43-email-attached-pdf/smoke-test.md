# Smoke Test: STORY-SQ-43 - Incluir PDF adjunto en email

**Staging URL:** https://staging-upexsoloq.vercel.app/
**Fecha:** 2026-03-28
**QA:** TBD
**Duracion:** 5-10 minutos

---

## ✅ Smoke Test Checklist

### 1. Acceso Basico

- [ ] **Aplicacion carga sin errores 500**
  - URL: https://staging-upexsoloq.vercel.app/
  - Landing page debe cargar completamente

- [ ] **No hay errores en console (F12)**
  - Console tab no debe mostrar errores rojos
  - Advertencias amarillas son aceptables

- [ ] **Assets cargan correctamente**
  - [ ] CSS carga (pagina tiene estilos)
  - [ ] JavaScript carga (interacciones funcionan)
  - [ ] Imagenes cargan (no hay placeholders rotos)

---

### 2. Autenticacion (si aplica)

- [ ] **Login funciona**
  - Email: demo@soloq.app
  - Password: Demo123!
  - Debe redirigir a dashboard despues de login

- [ ] **Sesion persiste al refrescar**
  - Refrescar pagina (F5) → Sesion debe mantenerse

- [ ] **Logout funciona**
  - Click en logout → Debe redirigir a landing/login

---

### 3. Happy Path: Enviar factura con PDF adjunto

**Descripcion:** Enviar una factura draft y validar que el email incluye PDF adjunto con nombre correcto.

**Steps:**

1. [ ] **Abrir detalle de factura**
   - Accion: Ir a `/invoices` y abrir la factura `INV-2026-0042`
   - Validar: Se ve el detalle con items y boton de envio

2. [ ] **Enviar factura**
   - Accion: Click en `Enviar factura` y confirmar envio
   - Validar: Se muestra confirmacion de exito y estado cambia a `sent`

3. [ ] **Validar email con adjunto**
   - Accion: Abrir email en sandbox de Resend o inbox de prueba
   - Validar: El email tiene PDF adjunto

4. [ ] **Validar nombre del adjunto**
   - Accion: Inspeccionar el nombre del PDF
   - Validar: Nombre usa numero de factura (ej: `Invoice-INV-2026-0042.pdf`)

5. [ ] **Validar contenido del PDF**
   - Accion: Descargar y abrir el PDF
   - Validar: Muestra numero de factura, nombre de cliente, total y fecha de vencimiento

**Validacion visual:**

- [ ] UI se ve como en disenos
- [ ] No hay layouts rotos
- [ ] Loading states son claros

---

### 4. Integracion con Backend

**Network Tab Validation:**

- [ ] **API calls retornan 200 OK**
  - Abrir DevTools → Network tab
  - Ejecutar happy path
  - Validar requests:
    - POST `/api/invoices/{invoiceId}/send` → 200 OK
    - GET `/api/invoices/{invoiceId}/pdf` → 200 OK

- [ ] **Datos se guardan en DB (si aplica)**
  - Confirmar que el estado de la factura queda en `sent`
  - Verificar que `email_logs` registra el envio (si hay UI o log accesible)

- [ ] **Datos se recuperan correctamente**
  - Refrescar pagina y validar que la factura sigue en `sent`

---

## 📊 Resultado del Smoke Test

**Ejecutado por:** [Nombre]
**Fecha:** [Fecha]
**Duracion:** [Tiempo real]

### Resultado Final:

- [ ] **✅ PASSED:** Deployment funcional, continuar con exploratory testing
- [ ] **❌ FAILED:** Deployment roto, reportar bug critico inmediatamente

---

### Notas (si aplica):

[Cualquier observacion adicional]

---

### Si FAILED:

**Blocker:** [Descripcion del error que bloquea]

**Evidence:**

- Screenshot: [Adjuntar]
- Console errors: [Copiar]

**Proximo paso:**

- Reportar a Development inmediatamente
- NO continuar con exploratory testing hasta que se fixee
