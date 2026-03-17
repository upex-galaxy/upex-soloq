# EPIC: Client Management

**Jira Key:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13)
**Priority:** Medium
**Status:** Backlog
**Total Story Points:** 51

---

## Description

## Description

Gestión de la base de datos de clientes del freelancer. Permite agregar, listar, editar y eliminar clientes, así como ver su historial de facturas.

## Business Value

Una base de clientes organizada es fundamental para el flujo de facturación. El freelancer necesita poder acceder rápidamente a la información de sus clientes para crear facturas y dar seguimiento a pagos.

## Acceptance Criteria

- Usuario puede agregar nuevos clientes con nombre y email
- Usuario puede ver lista de todos sus clientes
- Usuario puede editar datos de clientes existentes
- Usuario puede agregar información fiscal del cliente
- Usuario puede ver historial de facturas por cliente
- Usuario puede eliminar clientes (soft delete)

## Technical Considerations

- CRUD completo para clientes
- Soft delete para mantener historial de facturas
- Búsqueda y filtrado de clientes
- RLS policies para acceso solo a propios clientes

## Priority

HIGH

## Phase

Core Features (Sprint 2-3)

## 

## QA Test Strategy - Shift-Left Analysis

**Analysis Date:** 2026-01-27
**Status:** Test Plan Ready

### Critical Risks Identified

| ***Risk**** | ****Impact**** | ****Area*** |
| --- | --- | --- |
| RLS Policies - Data Isolation Failure | HIGH | Security |
| Unique Constraint per User (email duplicates) | MEDIUM | Database/Validation |
| Soft Delete Integrity (client-invoice relationship) | MEDIUM | Business Logic |

### Test Coverage Summary

- ***Total Estimated Test Cases:*** 53
- ***Integration Points:*** 6 API endpoints + DB + Auth
- ***Critical User Journeys:*** Add client from invoice flow, Client CRUD
- ***Test Complexity:*** Medium

### Critical Questions for Team

- Tax ID validation format per country?
- Client limits for Free vs Pro?
- Search behavior (case-insensitive, partial match)?

See detailed test plan in comments below.

### Test Strategy

- ***Levels:*** Unit, Integration, E2E, API
- ***Tools:*** Playwright, Vitest, Postman
- ***Timeline:*** ~1.5 sprints (3 weeks estimated)

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14) | Add New Client | 13 | Medium | QA Approved |
| [SQ-15](https://upexgalaxy65.atlassian.net/browse/SQ-15) | List All Clients | 5 | Medium | Ready For QA |
| [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16) | Edit Client Data | 5 | Medium | QA Approved |
| [SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17) | Add Client Tax Information | 13 | Medium | Ready For QA |
| [SQ-18](https://upexgalaxy65.atlassian.net/browse/SQ-18) | View Client Invoice History | 2 | Medium | Ready For QA |
| [SQ-19](https://upexgalaxy65.atlassian.net/browse/SQ-19) | Delete Client | 10 | Medium | Ready For QA |
| [SQ-68](https://upexgalaxy65.atlassian.net/browse/SQ-68) | As a user, I want the system to validate client email deliverability so that I avoid sending invoices to invalid addresses | 3 | Medium | Backlog |

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 1/27/2026
- **Reporter:** Ely
- **Assignee:** Unassigned
- **Labels:** test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:43.593Z_
