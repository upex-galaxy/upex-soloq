# Product Backlog - Epic Tree

## Overview

| Campo                  | Valor                                           |
| ---------------------- | ----------------------------------------------- |
| **Total Epics**        | 10                                              |
| **Total User Stories** | 57                                              |
| **Project Code**       | SQ                                              |
| **Jira Project**       | [SoloQ](https://upexqa.atlassian.net/browse/SQ) |

---

## Epic Hierarchy

### EPIC 1: User Authentication & Onboarding

**Jira Key:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1)
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

**Description:** Sistema de autenticación y configuración inicial del usuario. Incluye registro, login, recuperación de contraseña, logout seguro y onboarding guiado para nuevos usuarios.

**User Stories (5):**

1. [SQ-2](https://upexgalaxy64.atlassian.net/browse/SQ-2) - As a user, I want to register with email and password, so that I can create my SoloQ account
2. [SQ-3](https://upexgalaxy64.atlassian.net/browse/SQ-3) - As a user, I want to login with my credentials, so that I can access my account
3. [SQ-4](https://upexgalaxy64.atlassian.net/browse/SQ-4) - As a user, I want to recover my password via email, so that I don't lose access to my account
4. [SQ-5](https://upexgalaxy64.atlassian.net/browse/SQ-5) - As a user, I want to logout securely, so that I can protect my account on shared devices
5. [SQ-6](https://upexgalaxy64.atlassian.net/browse/SQ-6) - As a new user, I want to complete a guided onboarding, so that I can configure my business profile

---

### EPIC 2: Business Profile Management

**Jira Key:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7)
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

**Description:** Configuración del perfil de negocio del freelancer que aparecerá en las facturas. Incluye nombre de negocio, logo, datos de contacto, datos fiscales y métodos de pago.

**User Stories (5):**

1. [SQ-8](https://upexgalaxy64.atlassian.net/browse/SQ-8) - As a user, I want to configure my business name, so that it appears on my invoices
2. [SQ-9](https://upexgalaxy64.atlassian.net/browse/SQ-9) - As a user, I want to upload my logo, so that I can personalize my invoices
3. [SQ-10](https://upexgalaxy64.atlassian.net/browse/SQ-10) - As a user, I want to add my contact information, so that my clients can contact me
4. [SQ-11](https://upexgalaxy64.atlassian.net/browse/SQ-11) - As a user, I want to configure my tax ID (RFC/NIT/CUIT), so that it appears on my invoices
5. [SQ-12](https://upexgalaxy64.atlassian.net/browse/SQ-12) - As a user, I want to configure my accepted payment methods, so that my clients know how to pay me

---

### EPIC 3: Client Management

**Jira Key:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13)
**Priority:** HIGH
**Phase:** Core Features (Sprint 2-3)

**Description:** Gestión de la base de datos de clientes del freelancer. Permite agregar, listar, editar y eliminar clientes, así como ver su historial de facturas.

**User Stories (6):**

1. [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14) - As a user, I want to add a new client with name and email, so that I can invoice them
2. [SQ-15](https://upexgalaxy64.atlassian.net/browse/SQ-15) - As a user, I want to see the list of all my clients, so that I can quickly find who I need to invoice
3. [SQ-16](https://upexgalaxy64.atlassian.net/browse/SQ-16) - As a user, I want to edit client data, so that I can keep information up to date
4. [SQ-17](https://upexgalaxy64.atlassian.net/browse/SQ-17) - As a user, I want to add client tax information (RFC/NIT), so that I can include it in invoices
5. [SQ-18](https://upexgalaxy64.atlassian.net/browse/SQ-18) - As a user, I want to see a client's invoice history, so that I have context of our relationship
6. [SQ-19](https://upexgalaxy64.atlassian.net/browse/SQ-19) - As a user, I want to delete a client I no longer use, so that I can keep my list clean

---

### EPIC 4: Invoice Creation

**Jira Key:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 3-4)

**Description:** Creación y gestión de facturas. Incluye selección de cliente, líneas de items, cálculos automáticos, impuestos, descuentos, preview, numeración y fechas.

**User Stories (10):**

1. [SQ-21](https://upexgalaxy64.atlassian.net/browse/SQ-21) - As a user, I want to create a new invoice by selecting a client, so that I can start billing
2. [SQ-22](https://upexgalaxy64.atlassian.net/browse/SQ-22) - As a user, I want to add line items (description, quantity, unit price), so that I can detail my services
3. [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23) - As a user, I want the system to automatically calculate subtotal and total, so that I avoid calculation errors
4. [SQ-24](https://upexgalaxy64.atlassian.net/browse/SQ-24) - As a user, I want to add taxes (VAT/percentage), so that I can comply with tax requirements
5. [SQ-25](https://upexgalaxy64.atlassian.net/browse/SQ-25) - As a user, I want to add discounts (percentage or fixed amount), so that I can offer promotions to clients
6. [SQ-26](https://upexgalaxy64.atlassian.net/browse/SQ-26) - As a user, I want to preview the invoice before sending, so that I can verify everything is correct
7. [SQ-27](https://upexgalaxy64.atlassian.net/browse/SQ-27) - As a user, I want to assign a unique invoice number, so that I can keep track of my numbering
8. [SQ-28](https://upexgalaxy64.atlassian.net/browse/SQ-28) - As a user, I want to set a due date, so that I can define when I expect payment
9. [SQ-29](https://upexgalaxy64.atlassian.net/browse/SQ-29) - As a user, I want to add notes or terms and conditions, so that I can communicate additional information
10. [SQ-30](https://upexgalaxy64.atlassian.net/browse/SQ-30) - As a user, I want to save an invoice as draft, so that I can finish it later

---

### EPIC 5: PDF Generation & Download

**Jira Key:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 4-5)

**Description:** Generación de facturas en formato PDF profesional. Incluye diseño con logo, datos del negocio, métodos de pago y opción de descarga.

**User Stories (5):**

1. [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32) - As a user, I want to generate a PDF of my invoice with professional design, so that I can send it to my client
2. [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33) - As a user, I want the PDF to include my logo and business data, so that I project professionalism
3. [SQ-34](https://upexgalaxy64.atlassian.net/browse/SQ-34) - As a user, I want the PDF to include my configured payment methods, so that the client knows how to pay me
4. [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35) - As a user, I want to download the PDF to my device, so that I can save it or send it manually
5. [SQ-36](https://upexgalaxy64.atlassian.net/browse/SQ-36) - As a Pro user, I want to choose between different invoice templates, so that I can customize my style

---

### EPIC 6: Invoice Sending

**Jira Key:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 5)

**Description:** Envío de facturas por email. Incluye PDF adjunto, datos de pago en el email, personalización del mensaje y confirmación de envío.

**User Stories (5):**

1. [SQ-42](https://upexgalaxy64.atlassian.net/browse/SQ-42) - As a user, I want to send the invoice by email to the client with one click, so that I can save time
2. [SQ-43](https://upexgalaxy64.atlassian.net/browse/SQ-43) - As a user, I want the email to include the attached PDF, so that the client has the invoice
3. [SQ-44](https://upexgalaxy64.atlassian.net/browse/SQ-44) - As a user, I want the email to include my payment data, so that I can facilitate collection
4. [SQ-45](https://upexgalaxy64.atlassian.net/browse/SQ-45) - As a user, I want to customize the subject and message of the email, so that I can communicate better with my client
5. [SQ-46](https://upexgalaxy64.atlassian.net/browse/SQ-46) - As a user, I want to see if the email was sent successfully, so that I have certainty it arrived

---

### EPIC 7: Invoice Dashboard & Tracking

**Jira Key:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38)
**Priority:** HIGH
**Phase:** Core Features (Sprint 5-6)

**Description:** Panel de control para visualizar y gestionar el estado de las facturas. Incluye filtros, totales pendientes, facturas vencidas destacadas y búsqueda.

**User Stories (6):**

1. [SQ-47](https://upexgalaxy64.atlassian.net/browse/SQ-47) - As a user, I want to see a dashboard with all my invoices, so that I have a general view
2. [SQ-48](https://upexgalaxy64.atlassian.net/browse/SQ-48) - As a user, I want to filter invoices by status (draft, sent, paid, overdue), so that I can find the ones I need
3. [SQ-49](https://upexgalaxy64.atlassian.net/browse/SQ-49) - As a user, I want to see the total pending amount, so that I know my financial situation
4. [SQ-50](https://upexgalaxy64.atlassian.net/browse/SQ-50) - As a user, I want to see overdue invoices highlighted, so that I can prioritize follow-up
5. [SQ-51](https://upexgalaxy64.atlassian.net/browse/SQ-51) - As a user, I want to search invoices by client or number, so that I can find a specific one
6. [SQ-52](https://upexgalaxy64.atlassian.net/browse/SQ-52) - As a user, I want to see a summary of monthly income, so that I can track my progress

---

### EPIC 8: Payment Tracking

**Jira Key:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39)
**Priority:** HIGH
**Phase:** Core Features (Sprint 6)

**Description:** Registro de pagos recibidos y actualización de estado de facturas. Incluye método de pago, monto, fecha, notas y posibilidad de revertir.

**User Stories (6):**

1. [SQ-53](https://upexgalaxy64.atlassian.net/browse/SQ-53) - As a user, I want to mark an invoice as paid, so that I can update its status
2. [SQ-54](https://upexgalaxy64.atlassian.net/browse/SQ-54) - As a user, I want to record the payment method used, so that I have a record
3. [SQ-55](https://upexgalaxy64.atlassian.net/browse/SQ-55) - As a user, I want to record the amount received, so that I can verify against the invoiced total
4. [SQ-56](https://upexgalaxy64.atlassian.net/browse/SQ-56) - As a user, I want to add notes to the payment, so that I have context
5. [SQ-57](https://upexgalaxy64.atlassian.net/browse/SQ-57) - As a user, I want to record the payment date, so that I have accurate history
6. [SQ-58](https://upexgalaxy64.atlassian.net/browse/SQ-58) - As a user, I want to revert an invoice from "paid" to "pending", so that I can correct errors

---

### EPIC 9: Automatic Reminders (Pro Feature)

**Jira Key:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40)
**Priority:** MEDIUM
**Phase:** Pro Features (Sprint 7)

**Description:** Sistema de recordatorios automáticos para facturas vencidas. Feature exclusiva para usuarios Pro. Incluye configuración de frecuencia, personalización de mensaje y historial.

**User Stories (5):**

1. [SQ-59](https://upexgalaxy64.atlassian.net/browse/SQ-59) - As a Pro user, I want the system to send automatic reminders for overdue invoices, so that I don't have to do it manually
2. [SQ-60](https://upexgalaxy64.atlassian.net/browse/SQ-60) - As a Pro user, I want to configure reminder frequency (every X days), so that I can adjust to my needs
3. [SQ-61](https://upexgalaxy64.atlassian.net/browse/SQ-61) - As a Pro user, I want to customize the reminder message, so that I maintain my communication tone
4. [SQ-62](https://upexgalaxy64.atlassian.net/browse/SQ-62) - As a Pro user, I want to pause reminders for a specific invoice, so that I can handle clients with special arrangements
5. [SQ-63](https://upexgalaxy64.atlassian.net/browse/SQ-63) - As a Pro user, I want to see the history of sent reminders, so that I know how many times I've contacted the client

---

### EPIC 10: Subscription Management

**Jira Key:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41)
**Priority:** MEDIUM
**Phase:** Pro Features (Sprint 7-8)

**Description:** Gestión de la suscripción del usuario (Free vs Pro). Incluye visualización de features Pro, upgrade, gestión de suscripción e historial de pagos.

**User Stories (4):**

1. [SQ-64](https://upexgalaxy64.atlassian.net/browse/SQ-64) - As a Free user, I want to see which features are limited to Pro, so that I understand the value of upgrading
2. [SQ-65](https://upexgalaxy64.atlassian.net/browse/SQ-65) - As a Free user, I want to easily upgrade to Pro, so that I can access automatic reminders
3. [SQ-66](https://upexgalaxy64.atlassian.net/browse/SQ-66) - As a Pro user, I want to manage my subscription (see renewal date, cancel), so that I have control
4. [SQ-67](https://upexgalaxy64.atlassian.net/browse/SQ-67) - As a Pro user, I want to see my subscription payment history, so that I have records

---

## Epic Prioritization

### Phase 1: Foundation (Sprint 1-2)

| Order | Epic                                      | Reason                    |
| ----- | ----------------------------------------- | ------------------------- |
| 1     | EPIC 1 - User Authentication & Onboarding | Base para todo el sistema |
| 2     | EPIC 2 - Business Profile Management      | Requerido para facturas   |

### Phase 2: Core Features (Sprint 2-6)

| Order | Epic                          | Reason                        |
| ----- | ----------------------------- | ----------------------------- |
| 3     | EPIC 3 - Client Management    | Necesario para crear facturas |
| 4     | EPIC 4 - Invoice Creation     | Core del producto             |
| 5     | EPIC 5 - PDF Generation       | Entregable al cliente         |
| 6     | EPIC 6 - Invoice Sending      | Completar flujo principal     |
| 7     | EPIC 7 - Dashboard & Tracking | Visibilidad del estado        |
| 8     | EPIC 8 - Payment Tracking     | Cierre del ciclo              |

### Phase 3: Pro Features (Sprint 7-8)

| Order | Epic                              | Reason            |
| ----- | --------------------------------- | ----------------- |
| 9     | EPIC 9 - Automatic Reminders      | Diferenciador Pro |
| 10    | EPIC 10 - Subscription Management | Monetización      |

---

## Summary

| Metric                             | Value |
| ---------------------------------- | ----- |
| **Must Have Stories**              | 37    |
| **Should Have Stories**            | 15    |
| **Could Have Stories**             | 3     |
| **Pro Feature Stories**            | 6     |
| **Total Story Points (estimated)** | ~175  |

---

## Next Steps

1. ~~Run Fase 4 prompt specifying EPIC 1 to create it incrementally~~ ✅
2. ~~Continue with EPIC 2, EPIC 3, etc.~~ ✅
3. Proceed to Fase 5 (Test Cases) and Fase 6 (Implementation Plans)

---

## Jira ID Summary

| Type        | Range                                                              | Count |
| ----------- | ------------------------------------------------------------------ | ----- |
| **Epics**   | SQ-1, SQ-7, SQ-13, SQ-20, SQ-31, SQ-37, SQ-38, SQ-39, SQ-40, SQ-41 | 10    |
| **Stories** | SQ-2 to SQ-67                                                      | 57    |

---

_Documento parte del PBI de SoloQ - Fase 4 Specification_
_Última actualización: 2026-01-20_
