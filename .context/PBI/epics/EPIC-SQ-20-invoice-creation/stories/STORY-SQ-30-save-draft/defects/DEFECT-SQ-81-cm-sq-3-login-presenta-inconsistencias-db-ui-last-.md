# DEFECT: CM | SQ-3 login presenta inconsistencias DB/UI: last_login_at no actualiza, business_profiles ausente (406) y gap onboarding

**Jira Key:** [SQ-81](https://upexgalaxy65.atlassian.net/browse/SQ-81)
**Related Story:** [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3) - User Login with Credentials
**Priority:** Highest
**Status:** Ready For QA
**Components:** None
**Severity:** Crítica
**Error Type:** Integration
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Contexto:
Defecto consolidado detectado durante exploratory testing de la US [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3) (Login) en staging, cruzando evidencia UI + DB.

Alcance afectado:

- Story: [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3) - User Login with Credentials
- Capas: Integración Auth/UI/DB

Hallazgos incluidos en este único defecto:

1) profiles.last*login*at no se actualiza tras login exitoso (16/16 perfiles con NULL).
2) Inconsistencia estructural profiles ↔ business*profiles: 16 perfiles, 0 business*profiles; en UI/network aparece 406 al consultar business_profiles.
3) Gap de modelo para onboarding: no existe onboarding_completed en public.profiles.
4) Señal de consistencia pendiente: profiles.email*verified*at en NULL para todos los perfiles actuales.

Resultado esperado:

- last*login*at actualizado en login exitoso.
- manejo robusto de business_profiles (autocreación o fallback sin 406).
- alineación AC/modelo para onboarding (campo existente o criterio redefinido).

Resultado actual:

- last*login*at no cambia.
- consulta business_profiles falla con 406 en flujo UI.
- onboarding_completed inexistente en profiles.

Impacto:

- Trazabilidad de login incompleta.
- Inestabilidad de bootstrap de perfil/sesión post-login.
- Riesgo de bloqueos/inconsistencias en validaciones de [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3).

Preconditions:

- Usuario con credenciales válidas en staging.
- Acceso de QA por SQL MCP (rol qa_team).

Repro Steps:

1. Iniciar sesión en staging con usuario válido.
2. Verificar en DB public.profiles que last*login*at no cambia (permanece NULL).
3. Cargar dashboard/login flow y observar request a business_profiles con respuesta 406.
4. Verificar schema de public.profiles y confirmar ausencia de onboarding_completed.

---

## 🐞 Actual Result

1) profiles.last*login*at no se actualiza (16/16 NULL).
2) GET business_profiles retorna 406 por ausencia total de registros (0 de 16 perfiles).
3) onboarding_completed no existe en public.profiles.
4) profiles.email*verified*at permanece NULL en los perfiles actuales.

---

## ✅ Expected Result

1) profiles.last*login*at debe actualizarse en cada login exitoso.
2) business_profiles debe responder 200 con registro o fallback controlado sin error 406.
3) Modelo de onboarding debe estar alineado con AC (campo o regla equivalente).
4) La consistencia de verificación de email debe reflejarse según diseño.

---

## 🔍 Root Cause

**Category:** Integration Error

---

## Related Issues

- blocks: [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3) - User Login with Credentials

---

## Metadata

- **Created:** 2/11/2026
- **Updated:** 2/17/2026
- **Reporter:** Joel Armando Ramírez Rodríguez
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** auth, db-testing, exploratory-testing, sq-3, staging

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.164Z_
