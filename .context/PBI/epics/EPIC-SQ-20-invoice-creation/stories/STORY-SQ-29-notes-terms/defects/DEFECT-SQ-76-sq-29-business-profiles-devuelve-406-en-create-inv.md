# DEFECT: SQ-29 | Business_profiles devuelve 406 en create invoice e impide validar prefill de términos

**Jira Key:** [SQ-76](https://upexgalaxy65.atlassian.net/browse/SQ-76)
**Related Story:** [SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29) - Add Notes and Terms to Invoice
**Priority:** Medium
**Status:** Ready For QA
**Components:** None
**Error Type:** Integration
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

## Contexto

Detectado durante exploratory testing de la US [https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29) en ambiente de staging.

- Story: [https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29)
- URL: [https://staging-upexsoloq.vercel.app/invoices/create](https://staging-upexsoloq.vercel.app/invoices/create)
- Capa: UI + Network

## Pasos para reproducir:

1. Iniciar sesión con un usuario válido en staging.
2. Navegar a **/invoices/create**.
3. Abrir DevTools/Network.
4. Observar la request a Supabase para business profile.

## Resultado esperado

La consulta de business profile debería responder **200** y retornar el registro del usuario (o payload vacío controlado), permitiendo evaluar/usar **default_terms** para prefill.

## Resultado actual

La request falla con **406**:

```java
GET /rest/v1/business*profiles?select=*&user*id=eq.[user_id] -> 406
```

Esto bloquea la validación del AC de prefill de términos en [https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29).

## Impacto

- No se puede validar completamente el AC de prefill de términos.
- Riesgo de que el prefill no funcione para usuarios reales.

## Evidencia

Requests observadas en sesión:

- POST /auth/v1/token?grant_type=password -> 200
- GET /rest/v1/business_profiles?... -> 406 (repetido)
- POST /api/invoices -> 201

## Notas

Comentario de ejecución QA agregado en [https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29#icft=SQ-29) con el detalle de test cases y resultados.

---

## ✅ Expected Result

## 

---

## 🔍 Root Cause

**Category:** Integration Error

---

## Related Issues

- relates to: [SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29) - Add Notes and Terms to Invoice

---

## Metadata

- **Created:** 2/10/2026
- **Updated:** 2/25/2026
- **Reporter:** Ximena Quintana
- **Assignee:** Ximena Quintana
- **Labels:** exploratory-testing, qa, sq-29, staging

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.163Z_
