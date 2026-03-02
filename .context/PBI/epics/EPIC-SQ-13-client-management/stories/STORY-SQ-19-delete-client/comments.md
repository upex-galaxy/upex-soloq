# Comments for SQ-19

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-19)

---

### Ronny Toro - 1/30/2026, 9:56:11 AM

# Shift-Left Test Plan

### Scenario 1: Delete client without invoices

- ***Given:*** I have a client with no invoices
- ***When:*** I click delete and confirm
- ***Then:*** The client is removed from my list

### Scenario 2: Delete client with invoices (soft delete)

- ***Given:*** I have a client with existing invoices
- ***When:*** I click delete and confirm
- ***Then:*** The client is hidden from my list but invoices still reference them

### Scenario 3: Confirmation dialog

- ***Given:*** I click delete on a client
- ***When:*** The confirmation dialog appears
- ***Then:*** I must confirm before the client is deleted

### Scenario 4: Restore deleted client (future)

- ***Given:*** I accidentally deleted a client
- ***When:*** I go to "Deleted Clients"
- ***Then:*** I can restore them (v2 feature)

# Feature Test Plan – Delete Client

## 1. Feature Overview

***Feature:*** Delete Client

***Epic:*** EPIC-SQ-13 – Client Management

***User Story:*** STORY-SQ-19 – Delete Client

This feature allows a user to permanently delete a client from the system through the client management interface. The deletion flow includes a confirmation step, user feedback messages, and proper handling of edge cases such as concurrency, cancellation, and navigation interruptions.

The objective of this test plan is to validate that the Delete Client feature behaves correctly under normal, alternative, and error scenarios, and that it provides clear and accurate feedback to the user.

---

## 2. Preconditions & Assumptions

- The user is authenticated and authorized to manage clients.
- The client exists and is visible in the client list before deletion.
- The user is on a screen where the ***Delete Client*** action is available.
- Network connectivity is available unless otherwise stated in a test.
- Any business rules regarding client deletion (e.g., linked invoices) are enforced by backend validation.

---

## 3. In-Scope

- Delete action initiation
- Confirmation modal behavior
- Successful deletion flow
- Cancellation flow
- Concurrency handling
- User feedback (success and error messages)

## 4. Out of Scope

- Database-level validation beyond exposed API behavior
- Audit logging verification (unless surfaced in UI)
- Performance testing under load

---

## 5. Main Flow – Successful Deletion

### Scenario: User successfully deletes a client

***Steps:***

1. User navigates to the client list or client detail view.
2. User clicks on ***Delete Client***.
3. A confirmation modal is displayed.
4. User confirms the deletion.
5. System processes the deletion.
6. User is redirected back to the client list (or appropriate screen).

***Expected Results:***

- The client is removed from the client list.
- A success message is displayed including:
- The success message clearly indicates that the client was deleted.
- No further actions can be performed on the deleted client.

---

## 6. Alternative Flows & Edge Cases

### 6.1 Cancel Deletion

***Scenario:*** User cancels deletion from the confirmation modal

***Steps:***

1. User clicks ***Delete Client***.
2. Confirmation modal appears.
3. User clicks ***Cancel***.

***Expected Results:***

- The modal closes.
- The client is not deleted.
- No success or error message is displayed.
- The user remains on the same screen.

---

### 6.2 Navigate Back Before Confirmation

***Scenario:*** User navigates back before confirming deletion

***Steps:***

1. User clicks ***Delete Client***.
2. Confirmation modal appears.
3. User clicks browser back or navigates away without confirming.

***Expected Results:***

- Deletion is not executed.
- No partial or unintended deletion occurs.
- Client remains visible and unchanged.

---

### 6.3 Client Deleted by Another User (Concurrency)

***Scenario:*** Another user deletes the same client before confirmation

***Steps:***

1. User A opens the delete confirmation modal for a client.
2. User B deletes the same client successfully.
3. User A confirms deletion.

***Expected Results:***

- The system does not fail silently.
- User A receives a clear error or informational message indicating:
- The UI refreshes or redirects appropriately.
- The client does not appear in the list.

---

### 6.4 Repeated Deletion Attempt

***Scenario:*** User attempts to delete an already deleted client

***Expected Results:***

- System handles the request gracefully.
- An appropriate error or info message is shown.
- No application crash or inconsistent UI state occurs.

---

## 7. Negative Scenarios

### 7.1 Backend Error During Deletion

***Expected Results:***

- The client is not deleted.
- An error message is displayed to the user.
- The user can retry the action.

---

### 7.2 Network Failure During Deletion

***Expected Results:***

- The user is informed of the failure.
- The client remains unchanged.
- No misleading success message is displayed.

---

### 7.3 Unauthorized Deletion Attempt

***Expected Results:***

- The deletion is blocked.
- A permission-related error message is shown.

---

## 8. UX & Messaging Validation

- Confirmation modal clearly explains the action and its consequences.
- Success message includes ***Client ID + Client Name***.
- Error messages are user-friendly and actionable.
- Buttons show proper loading and disabled states during processing.

---

## 9. Traceability

| Acceptance Criteria  | Covered Sections  |
| --- | --- |

| ------------------------------  | ----------------  |
| --- | --- |

| Delete confirmation required  | 5, 6.1  |
| --- | --- |

| Client successfully deleted  | 5  |
| --- | --- |

| Cancel deletion  | 6.1  |
| --- | --- |

| Handle concurrent deletion  | 6.3  |
| --- | --- |

| User feedback on success/error  | 5, 7, 8  |
| --- | --- |

---

## 10. Notes

This Feature Test Plan is intended to be attached or referenced directly in Jira to complement the existing Acceptance Criteria and ensure full coverage of functional and edge-case behaviors for the Delete Client feature.

---

## 11. Test Cases – Delete Client

### 11.1 Main Flow

| ID  | Caso de Prueba  | Resultado Esperado  |
| --- | --- | --- |

| ---------  | -------------------------------------------------------------  | -------------------------------------------------------------------------------------------------------------------  |
| --- | --- | --- |

| TC-DC-001  | Eliminar cliente exitosamente confirmando la acción  | El cliente es eliminado del sistema y se muestra un mensaje de éxito indicando el ID y nombre del cliente eliminado  |
| --- | --- | --- |

| TC-DC-002  | Mostrar modal de confirmación al intentar eliminar un cliente  | Se muestra un modal solicitando confirmación antes de eliminar el cliente  |
| --- | --- | --- |

---

### 11.2 Cancelación & Navegación

| ID  | Caso de Prueba  | Resultado Esperado  |
| --- | --- | --- |

| ---------  | -----------------------------------------------  | ------------------------------------------------------------------------------------------  |
| --- | --- | --- |

| TC-DC-003  | Cancelar la eliminación desde el modal  | El modal se cierra y el cliente no es eliminado. El usuario permanece en la misma pantalla  |
| --- | --- | --- |

| TC-DC-004  | Navegar atrás antes de confirmar la eliminación  | No se elimina el cliente y no se muestra ningún mensaje de éxito  |
| --- | --- | --- |

---

### 11.3 Concurrencia

| ID  | Caso de Prueba  | Resultado Esperado  |
| --- | --- | --- |

| ---------  | -----------------------------------------------------------  | --------------------------------------------------------------------------------------------  |
| --- | --- | --- |

| TC-DC-005  | El cliente es eliminado por otro usuario antes de confirmar  | El sistema informa que el cliente ya no existe o fue eliminado previamente y actualiza la UI  |
| --- | --- | --- |

| TC-DC-006  | Reintentar eliminar un cliente ya eliminado  | El sistema maneja el caso de forma controlada sin errores críticos ni estados inconsistentes  |
| --- | --- | --- |

---

### 11.4 Escenarios Negativos

| ID  | Caso de Prueba  | Resultado Esperado  |
| --- | --- | --- |

| ---------  | ------------------------------------------------  | ------------------------------------------------------------------------  |
| --- | --- | --- |

| TC-DC-007  | Error de backend durante la eliminación  | Se muestra un mensaje de error y el cliente no es eliminado  |
| --- | --- | --- |

| TC-DC-008  | Fallo de red durante la eliminación  | El usuario es informado del fallo y el cliente permanece intacto  |
| --- | --- | --- |

| TC-DC-009  | Usuario sin permisos intenta eliminar un cliente  | La acción es bloqueada y se muestra un mensaje de permisos insuficientes  |
| --- | --- | --- |

---

### 11.5 UX & Mensajería

| ID  | Caso de Prueba  | Resultado Esperado  |
| --- | --- | --- |

| ---------  | ------------------------------------------------  | -------------------------------------------------------------------------------------  |
| --- | --- | --- |

| TC-DC-010  | Mensaje de éxito incluye ID y nombre del cliente  | El mensaje de confirmación muestra correctamente el ID y nombre del cliente eliminado  |
| --- | --- | --- |

| TC-DC-011  | Estado loading al confirmar eliminación  | El botón de confirmación muestra estado de carga y previene acciones duplicadas  |
| --- | --- | --- |

---

### Ely - 2/7/2026, 1:51:45 PM

🚀 ***Starting Implementation***

Beginning work on Delete Client feature following the Acceptance Test Plan (11 TCs) defined in Jira comments.

---

### Ely - 2/7/2026, 1:55:53 PM

📋 ***PR Created***

***PR:*** #28
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-19#icft=SQ-19](https://upexgalaxy65.atlassian.net/browse/SQ-19#icft=SQ-19)/delete-client → staging
***URL:*** [https://github.com/upex-galaxy/upex-soloq/pull/28](https://github.com/upex-galaxy/upex-soloq/pull/28)

***Implementation:***

- DELETE API endpoint with soft delete
- useDeleteClient hook with cache invalidation
- DeleteClientDialog component
- Delete button in clients table

Awaiting review and merge.

---

### Ely - 2/7/2026, 3:46:34 PM

Feature implementada y desplegada en staging.

***PR:*** [#28](https://github.com/upex-galaxy/upex-soloq/pull/28) (MERGED)

***Cambios:***

- DELETE endpoint con soft delete (deleted_at)
- Dialog de confirmación con loading state
- Botón de eliminar en tabla de clientes
- Toast de éxito con nombre del cliente

@Ronny Toro La funcionalidad está lista para pruebas en staging.

---

### Ronny Toro - 2/8/2026, 6:49:24 PM

Hola !
Consulta de ***SoloQ - Staging****, para la funcionalidad *****Crear Factura****, faltaria incluir algún campo para incluir items/registros/etc ? o no esta habilitado ese campo ? o no esta implementada esa parte ?
Nota: Queria asociar clientes a facturas, para hacer pruebas de "Eliminar Cliente  - Con facturas"
asi lo veo actualmente



---

### Arkaitz - 3/2/2026, 5:57:42 AM

*[Comentario eliminado - información incorrecta]*

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:47.459Z_
