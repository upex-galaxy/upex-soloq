# Comments for SQ-26

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-26)

---

### Marianela Portas - 2/2/2026, 8:19:32 AM

# Análisis de la US (Manual)

1. Escenario: ***Edit from preview***
2. Escenario: ***Send from preview***
3. La US dice que aparecerá un botón para visualizar la factura cuando esta tenga todos los datos completados. Que pasa con las otras facturas que quiza no tienen todos los datos completos (si es que este caso se puede dar): tendran el botón deshabilitado? 
4. Una vez que se envia la factura al cliente, se puede volver a visualizar mediante este botón? o queda deshabilitado?

# Casos de prueba que contemplaría:

1. Visualizar factura con 1 solo item
2. Visualizar factura con varios items o líneas
3. Visualizar factura con descuentos
4. Editar factura y volver a visualizarla
5. Enviar las diferentes facturas generadas
6. Visualizar una factura previamente visualizada pero que no fue enviada
7. Visualizar factura enviada. Es posible?

---

### Marianela Portas - 2/3/2026, 9:41:43 AM

# 🧪 Feature Test Plan: STORY-SQ-26 - Preview Invoice Before Sending                                               

**Analysis Date:** 2026-02-03                                                                                          
**Status:** Draft - Pending Team Review                                                                                
**Complexity:** Medium                                                                                                 
**Story Points:** 3                                                                                                    

---

## 📋 Test Summary                                                                                                  

| ***Type **** | ****Count *** |
| --- | --- |
| Positive  | 5  |
| Negative  | 3  |
| Boundary  | 2  |
| Integration  | 2  |
| **Total**  | **12**  |  |

---

### ✅ Positive Test Cases                                                                                           

| ***ID **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- |
| TC-001  | Open preview from invoice form  | High  |
| TC-002  | Preview shows all invoice data (business, client, items, totals, payment methods)  | Critical  |
| TC-003  | Return to edit from preview (data intact)  | High  |
| TC-004  | Send invoice from preview  | High  |
| TC-005  | Download PDF from preview  | High  |  |

---

### ❌ Negative Test Cases                                                                                           

| ***ID **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- |
| TC-006  | Preview incomplete invoice (no client or no items)  | Medium  |
| TC-007  | Preview invoice without permission (another user's invoice)  | High  |
| TC-008  | Preview with missing business profile  | Medium  |  |

---

### 🔲 Boundary Test Cases                                                                                           

| ***ID **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- |
| TC-009  | Preview invoice with many items (50 items)  | Medium  |
| TC-010  | Preview with very long text (notes 500 chars, terms 1000 chars)  | Low  |  |

---

### 🔗 Integration Test Cases                                                                                        

| ***ID **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- |
| TC-011  | Preview renders correct client data from database  | High  |
| TC-012  | Preview renders correct payment methods  | High  |  |

---

### 🚨 Critical Risks                                                                                                

# **Preview no muestra todos los datos** - Usuario podria enviar factura incorrecta

# **Perdida de datos al volver a editar** - UX frustrante, perdida de trabajo

# **PDF no coincide con preview** - Confusion del cliente final

---

### 🏷️ data-testid Requeridos                                                                                        

```                                                                                                               
preview-button                                                                                                       
preview-modal                                                                                                        
preview-edit-button                                                                                                  
preview-send-button                                                                                                  
preview-download-button                                                                                              
preview-business-info                                                                                                
preview-client-info                                                                                                  
preview-items-table                                                                                                  
preview-summary                                                                                                      
preview-payment-methods                                                                                              
preview-notes                                                                                                        
preview-terms                                                                                                        
```                                                                                                               

---

### 📊 Acceptance Criteria Coverage                                                                                  

| ***AC Scenario **** | ****Test Cases *** |
| --- | --- |
| 1. Open preview  | TC-001, TC-006  |
| 2. Preview shows all data  | TC-002, TC-011, TC-012  |
| 3. Return to edit  | TC-003  |
| 4. Send from preview  | TC-004  |
| 5. Download from preview  | TC-005  |  |

---

### 🎯 Automation Recommendation                                                                                     

**Automate:** TC-001, TC-002, TC-003, TC-006, TC-007, TC-011, TC-012                                                   
**Manual:** TC-005 (PDF verification), TC-009, TC-010 (visual checks)       

---

### Automation for Jira - 2/26/2026, 4:57:38 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Ely - 2/26/2026, 4:57:57 AM

## PR Creado

***PR:*** [https://github.com/upex-galaxy/upex-soloq/pull/60](https://github.com/upex-galaxy/upex-soloq/pull/60)

### Implementación completada:

- Utility `buildPreviewData` para transformar form data a preview
- Hook `useSendInvoice` para enviar facturas
- API endpoint `POST /api/invoices/[id]/send`
- Componente `InvoicePreviewDialog` con PDF preview
- Integración en páginas de crear y editar factura

### data-testid agregados:

- `preview-modal`
- `preview-edit-button`
- `preview-download-button`
- `preview-send-button`
- `preview-loading-state`
- `preview-ready-state`
- `preview-error-state`
- `pdf-preview-iframe`

**Pendiente QA: @Marianela Portas**

---

### Automation for Jira - 2/26/2026, 5:19:53 AM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:51.863Z_
