# Implementation Plan: STORY-SQ-4 - Password Recovery via Email

## Overview

Implementar funcionalidad de recuperación de contraseña que permita a usuarios solicitar un link de reset por email y establecer una nueva contraseña de forma segura.

**Acceptance Criteria a cumplir:**

- AC1: Solicitar reset con email registrado → mensaje genérico + email enviado
- AC2: Solicitar reset con email no registrado → mismo mensaje genérico (prevenir enumeración)
- AC3: Reset con token válido y password fuerte → actualizar password, invalidar sesiones, redirect a login
- AC4: Reset con token expirado (>1hr) → error + opción de solicitar nuevo link
- AC5: Reset con password débil → validación en tiempo real con errores específicos

---

## Test Cases Coverage (Jira Comments - Maxe Aguilera)

### Recovery Request Flow

| TC ID      | Descripción                                      | Step   |
| ---------- | ------------------------------------------------ | ------ |
| FT-SQ4-01  | Happy Path: request con email registrado         | Step 2 |
| FT-SQ4-02  | Security: request con email no registrado        | Step 2 |
| FT-SQ4-03  | Validation: email formato inválido               | Step 1 |
| FT-SQ4-04  | Security: response idéntica para ambos emails    | Step 2 |
| FT-SQ4-05a | Rate Limit: >20 req/min por IP                   | Step 2 |
| FT-SQ4-05b | Rate Limit: >3 req/hora por email                | Step 2 |
| FT-SQ4-17  | UX/UI: mostrar email enmascarado en confirmación | Step 1 |
| FT-SQ4-18  | UX/UI: link "Back to Login" funcional            | Step 1 |

### Password Reset Flow

| TC ID     | Descripción                                           | Step   |
| --------- | ----------------------------------------------------- | ------ |
| FT-SQ4-06 | Happy Path: reset con token válido + password fuerte  | Step 4 |
| FT-SQ4-07 | Validation: password no cumple requisitos (real-time) | Step 3 |
| FT-SQ4-08 | Validation: passwords no coinciden                    | Step 3 |
| FT-SQ4-09 | Security: token expirado (>1 hora)                    | Step 4 |
| FT-SQ4-10 | Security: token ya usado                              | Step 4 |
| FT-SQ4-11 | Security: token inválido/alterado                     | Step 4 |
| FT-SQ4-12 | UX/UI: form disabled + modal en token expirado        | Step 3 |
| FT-SQ4-13 | UX: desde modal, solicitar nuevo email                | Step 3 |
| FT-SQ4-19 | UX/UI: requisitos de password siempre visibles        | Step 3 |

### Post-Reset Flow

| TC ID     | Descripción                                       | Step   |
| --------- | ------------------------------------------------- | ------ |
| FT-SQ4-14 | Security: token invalidado inmediatamente         | Step 4 |
| FT-SQ4-15 | Security: todas las sesiones invalidadas (global) | Step 4 |
| FT-SQ4-16 | Happy Path: redirect a login con mensaje éxito    | Step 4 |

---

## Technical Approach

**Chosen approach:** Supabase Auth con `resetPasswordForEmail()` y `updateUser()` + manejo de evento `PASSWORD_RECOVERY` en `onAuthStateChange`.

**Why this approach:**

- ✅ Supabase maneja tokens, expiración y seguridad automáticamente
- ✅ `signOut({ scope: 'global' })` invalida todas las sesiones
- ✅ Evento `PASSWORD_RECOVERY` permite detectar cuando usuario viene del email
- ❌ Trade-off: Rate limiting debe implementarse en API route (no en cliente)

**Alternatives considered:**

- Custom tokens en DB: Mayor control pero más código y riesgos de seguridad
- Magic links: No cumple el requisito de cambiar password

---

## UI/UX Design

**Design System:** `.context/design-system.md` - Estilo Moderno/Bold

### Componentes del Design System a usar:

- ✅ `Card` → Contenedor principal de formularios
- ✅ `Button` → Submit actions
- ✅ `Input` → Email y password fields
- ✅ `Label` → Form labels
- ✅ `Alert` → Mensajes de error/éxito
- ✅ `Dialog` → Modal para token expirado (FT-SQ4-12, FT-SQ4-13)

### Componentes custom a crear:

- 🆕 `PasswordStrengthIndicator`
  - **Propósito:** Mostrar requisitos de password en tiempo real
  - **Props:** `password: string`, `showRequirements: boolean`
  - **Ubicación:** `components/auth/password-strength-indicator.tsx`

### Wireframes/Layout:

**Forgot Password Page (`/forgot-password`):**

```
┌──────────────────────────────────────┐
│ [Logo SoloQ]                         │
├──────────────────────────────────────┤
│ Recuperar Contraseña                 │
│ Ingresa tu email para recibir link   │
├──────────────────────────────────────┤
│ Email: [________________]            │
│                                      │
│ [    Enviar Link de Reset    ]       │
│                                      │
│ ← Volver a Iniciar Sesión            │
└──────────────────────────────────────┘
```

**Confirmation Page (después de submit):**

```
┌──────────────────────────────────────┐
│ [✓ Icono Check]                      │
├──────────────────────────────────────┤
│ Revisa tu Email                      │
│ Si existe una cuenta para            │
│ j***@example.com, enviamos un link   │
├──────────────────────────────────────┤
│ [    Volver a Login    ]             │
└──────────────────────────────────────┘
```

**Reset Password Page (`/reset-password`):**

```
┌──────────────────────────────────────┐
│ [Logo SoloQ]                         │
├──────────────────────────────────────┤
│ Nueva Contraseña                     │
│ Ingresa tu nueva contraseña          │
├──────────────────────────────────────┤
│ Nueva contraseña: [___________]      │
│ ┌──────────────────────────────┐     │
│ │ ✓ Mínimo 8 caracteres        │     │
│ │ ✗ 1 mayúscula                │     │
│ │ ✗ 1 minúscula                │     │
│ │ ✗ 1 número                   │     │
│ └──────────────────────────────┘     │
│ Confirmar: [___________]             │
│                                      │
│ [    Actualizar Contraseña    ]      │
└──────────────────────────────────────┘
```

**Modal Token Expirado:**

```
┌──────────────────────────────────────┐
│ [X]          Link Expirado           │
├──────────────────────────────────────┤
│ Este link de recuperación ha         │
│ expirado. Solicita uno nuevo.        │
│                                      │
│ Email: j***@example.com (readonly)   │
│                                      │
│ [  Enviar Nuevo Link  ]  [Cancelar]  │
└──────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Spinner en botón submit
- **Success:** Página de confirmación con email enmascarado
- **Error (validation):** Inline errors en campos
- **Error (token expired):** Modal con opción de reenvío
- **Error (token invalid):** Redirect a forgot-password con mensaje

### Validaciones visuales:

- **Email:** formato válido → "Por favor ingresa un email válido"
- **Password:** requisitos en tiempo real (FT-SQ4-07, FT-SQ4-19)
- **Confirm Password:** match → "Las contraseñas no coinciden" (FT-SQ4-08)

---

## Implementation Steps

### **Step 1: Forgot Password Page**

**Task:** Crear página `/forgot-password` con formulario de solicitud

**Files:**

- `src/app/(auth)/forgot-password/page.tsx`

**Details:**

- Formulario con campo email + validación Zod
- Submit llama a API route (no directamente a Supabase)
- Loading state durante request
- Link "Volver a Iniciar Sesión" (FT-SQ4-18)
- Mostrar confirmación con email enmascarado (FT-SQ4-17)
- Reutilizar layout de auth existente

**Validations:**

- Email formato válido (FT-SQ4-03)
- Campo requerido

**Testing:**

- FT-SQ4-03: Validación email inválido
- FT-SQ4-17: Email enmascarado visible
- FT-SQ4-18: Link back to login funcional

**Estimated time:** 1.5h

---

### **Step 2: Forgot Password API Route**

**Task:** Crear API route `POST /api/auth/forgot-password`

**File:** `src/app/api/auth/forgot-password/route.ts`

**Logic:**

1. Validar email con Zod
2. **Rate limiting** (FT-SQ4-05a, FT-SQ4-05b):
   - Check límite por IP (20 req/min)
   - Check límite por email (3 req/hora)
3. Llamar `supabase.auth.resetPasswordForEmail()` con `redirectTo`
4. **SIEMPRE** retornar mensaje genérico (FT-SQ4-01, FT-SQ4-02, FT-SQ4-04)
5. Mismo response time para ambos casos (prevenir timing attacks)

**Security:**

- Mensaje genérico: "Si existe una cuenta con este email, enviamos un link"
- NO revelar si email existe (FT-SQ4-04)
- Rate limiting dual-layer (FT-SQ4-05a, FT-SQ4-05b)

**Response:**

```typescript
{ success: true, message: "Si existe una cuenta..." }
// Mismo response siempre, independiente si email existe
```

**Testing:**

- FT-SQ4-01: Email registrado → success
- FT-SQ4-02: Email no registrado → mismo success
- FT-SQ4-04: Response idéntica
- FT-SQ4-05a: Rate limit IP
- FT-SQ4-05b: Rate limit email

**Estimated time:** 2h

---

### **Step 3: Reset Password Page + Components**

**Task:** Crear página `/reset-password` con validación en tiempo real

**Files:**

- `src/app/(auth)/reset-password/page.tsx`
- `src/components/auth/password-strength-indicator.tsx`

**Details:**

**PasswordStrengthIndicator:**

```typescript
interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

// Requirements (mismos que signup):
// - Mínimo 8 caracteres
// - 1 mayúscula
// - 1 minúscula
// - 1 número
```

**Reset Password Page:**

- Extraer token de URL (Supabase usa hash fragment o query params)
- Detectar evento `PASSWORD_RECOVERY` en auth state
- Campos: nueva password + confirmar password
- `PasswordStrengthIndicator` siempre visible (FT-SQ4-19)
- Validación en tiempo real mientras usuario escribe (FT-SQ4-07)
- Validar match de passwords (FT-SQ4-08)
- Modal para token expirado (FT-SQ4-12, FT-SQ4-13)
- Form deshabilitado si token inválido/expirado

**Modal Token Expirado:**

- Detectar error de Supabase ("Token has expired")
- Mostrar modal con email pre-rellenado (readonly)
- Botón "Enviar Nuevo Link" → llama API forgot-password
- Botón "Cancelar" → redirect a login

**Edge cases:**

- Token expirado → Modal (FT-SQ4-12)
- Token inválido → Redirect a forgot-password con error
- Token ya usado → Mismo comportamiento que expirado

**Testing:**

- FT-SQ4-07: Password no cumple requisitos
- FT-SQ4-08: Passwords no coinciden
- FT-SQ4-12: Form disabled + modal en expirado
- FT-SQ4-13: Reenvío desde modal
- FT-SQ4-19: Requisitos siempre visibles

**Estimated time:** 3h

---

### **Step 4: Reset Password Logic + Session Invalidation**

**Task:** Implementar lógica de reset con Supabase Auth

**Files:**

- `src/app/(auth)/reset-password/page.tsx` (update)
- `src/contexts/auth-context.tsx` (update)

**Details:**

**Auth Context Update:**

- Agregar handler para evento `PASSWORD_RECOVERY` en `onAuthStateChange`
- Cuando detecte `PASSWORD_RECOVERY`:
  - Setear flag `isPasswordRecoveryMode: true`
  - Almacenar email del usuario para mostrar en UI

**Reset Password Submit:**

1. Validar password cumple requisitos
2. Validar passwords coinciden
3. Llamar `supabase.auth.updateUser({ password: newPassword })`
4. Si éxito:
   - Llamar `supabase.auth.signOut({ scope: 'global' })` → invalida TODAS las sesiones (FT-SQ4-15)
   - Token queda invalidado automáticamente por Supabase (FT-SQ4-14)
   - Redirect a `/login?reset=success` (FT-SQ4-16)
5. Si error:
   - Token expirado → Mostrar modal (FT-SQ4-09)
   - Token ya usado → Mostrar modal (FT-SQ4-10)
   - Token inválido → Redirect a forgot-password (FT-SQ4-11)

**Success Message en Login:**

- Detectar query param `?reset=success`
- Mostrar alert: "Contraseña actualizada. Inicia sesión con tu nueva contraseña."

**Testing:**

- FT-SQ4-06: Happy path completo
- FT-SQ4-09: Token expirado
- FT-SQ4-10: Token ya usado
- FT-SQ4-11: Token inválido
- FT-SQ4-14: Token invalidado
- FT-SQ4-15: Todas las sesiones invalidadas
- FT-SQ4-16: Redirect a login con mensaje

**Estimated time:** 2.5h

---

### **Step 5: Update Login Page**

**Task:** Agregar soporte para mensaje de éxito post-reset

**File:** `src/app/(auth)/login/page.tsx` (update)

**Details:**

- Detectar query param `?reset=success`
- Mostrar Alert de éxito: "Tu contraseña ha sido actualizada correctamente."
- Limpiar query param después de mostrar

**Estimated time:** 0.5h

---

### **Step 6: Integration & Testing**

**Task:** Verificar flujo completo E2E

**Flow completo:**

1. Usuario va a `/login` → click "¿Olvidaste tu contraseña?"
2. `/forgot-password` → ingresa email → submit
3. Página de confirmación con email enmascarado
4. Usuario recibe email → click link
5. `/reset-password` con token → ingresa nueva password
6. Validación en tiempo real de requisitos
7. Submit → password actualizado
8. Todas las sesiones cerradas
9. Redirect a `/login?reset=success`
10. Usuario ve mensaje de éxito
11. Login con nueva password → acceso concedido

**Testing:**

- Todos los test cases FT-SQ4-01 a FT-SQ4-19
- Smoke test manual

**Estimated time:** 1h

---

## Technical Decisions

### Decision 1: Rate Limiting Strategy

**Chosen:** Dual-layer (IP + Email) implementado en API route

**Reasoning:**

- ✅ Layer 1 (IP): 20 req/min - bloquea ataques volumétricos
- ✅ Layer 2 (Email): 3 req/hora - previene harassment
- ✅ Implementación simple con Map en memoria (suficiente para MVP)
- ❌ Trade-off: No persistente (se resetea si server reinicia)

### Decision 2: Token Handling

**Chosen:** Usar flujo nativo de Supabase con `PASSWORD_RECOVERY` event

**Reasoning:**

- ✅ Supabase maneja expiración automáticamente (1 hora)
- ✅ Token se invalida después de uso exitoso
- ✅ Menos código, más seguro
- ❌ Trade-off: Menos control sobre UI de error específico

### Decision 3: Session Invalidation

**Chosen:** `signOut({ scope: 'global' })` después de update exitoso

**Reasoning:**

- ✅ Invalida TODAS las sesiones del usuario
- ✅ Fuerza re-login en todos los dispositivos
- ✅ Cumple requisito de seguridad (FT-SQ4-15)

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Supabase Auth configurado
- [x] Auth context funcionando (signIn, signOut, etc.)
- [x] Email delivery configurado en Supabase
- [x] Rutas de auth existentes (/login, /signup)

---

## Risks & Mitigations

**Risk 1:** Email delivery delays (>2 min)

- **Impact:** Medium
- **Mitigation:** Mensaje de UI indica "puede tardar unos minutos"

**Risk 2:** Rate limiting no persistente

- **Impact:** Low (MVP)
- **Mitigation:** Para producción, usar Redis/DB

**Risk 3:** Usuario no encuentra email (spam folder)

- **Impact:** Medium
- **Mitigation:** Instrucciones en UI de revisar spam

---

## Estimated Effort

| Step                                   | Time      |
| -------------------------------------- | --------- |
| 1. Forgot Password Page                | 1.5h      |
| 2. Forgot Password API + Rate Limiting | 2h        |
| 3. Reset Password Page + Components    | 3h        |
| 4. Reset Logic + Session Invalidation  | 2.5h      |
| 5. Update Login Page                   | 0.5h      |
| 6. Integration & Testing               | 1h        |
| **Total**                              | **10.5h** |

**Story points:** 5 (actualizado según Shift-Left QA)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Test Cases de Jira cubiertos:**
  - [ ] FT-SQ4-01: Happy path request
  - [ ] FT-SQ4-02: Email no registrado (mismo mensaje)
  - [ ] FT-SQ4-03: Validación email inválido
  - [ ] FT-SQ4-04: Response idéntica (seguridad)
  - [ ] FT-SQ4-05a: Rate limit IP
  - [ ] FT-SQ4-05b: Rate limit email
  - [ ] FT-SQ4-06: Happy path reset
  - [ ] FT-SQ4-07: Password no cumple requisitos
  - [ ] FT-SQ4-08: Passwords no coinciden
  - [ ] FT-SQ4-09: Token expirado
  - [ ] FT-SQ4-10: Token ya usado
  - [ ] FT-SQ4-11: Token inválido
  - [ ] FT-SQ4-12: Modal token expirado
  - [ ] FT-SQ4-13: Reenvío desde modal
  - [ ] FT-SQ4-14: Token invalidado post-reset
  - [ ] FT-SQ4-15: Todas las sesiones invalidadas
  - [ ] FT-SQ4-16: Redirect a login con mensaje
  - [ ] FT-SQ4-17: Email enmascarado
  - [ ] FT-SQ4-18: Link back to login
  - [ ] FT-SQ4-19: Requisitos password visibles
- [ ] **Tipos del backend usados correctamente**
- [ ] **Personalidad UI/UX aplicada (Moderno/Bold)**
  - [ ] Bordes rounded-lg
  - [ ] Sombras shadow-lg
  - [ ] Espaciado generoso
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual smoke test

---

**Creado:** 2026-02-12
**Autor:** Claude Code
**US:** SQ-4 - Password Recovery via Email
