# Comments for SQ-18

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-18)

---

### Rodrigo Godoy - 2/3/2026, 7:29:34 PM

# ***Shift-Left Test Plan***

### ***Scenario 1: View invoice list for client***

- ***Given: I am viewing a client's details***
- ***When: I click on "Invoice History"***
- ***Then: I see all invoices I've sent to this client.***

### ***Scenario 2: See invoice summary***

- ***Given: I am viewing a client's invoice history***
- ***When: I look at the list***
- ***Then: I see invoice number, date, amount, and status for each***

### ***Scenario 3: Navigate to invoice***

- ***Given: I am viewing a client's invoice history***
- ***When: I click on an invoice***
- ***Then: I am taken to the invoice details page***

### ***Scenario 4: See totals***

- ***Given: I am viewing a client's invoice history***
- ***When: I look at the summary***
- ***Then: I see total invoiced, total paid, and total pending***

***SUGERENCIA DE ESCENARIO EXTRA:***

***Sceneraio 5: Seguridad - Datos cruzados***

- ***Given: I am logged in as "User A"***
- ***And: "User B" has a client with ID*** `client-123`
- ***When: I try to force access to the history of**** `client-123` ****via URL/API***
- ***Then: I am redirected to a 404 Not Found (I cannot see data not owned by me***)

# ***Feature Test Plan (FTP) - SQ-18: View Client Invoice History***

Jira Key: [https://upexgalaxy65.atlassian.net/browse/SQ-18#icft=SQ-18](https://upexgalaxy65.atlassian.net/browse/SQ-18#icft=SQ-18) | Epic: [https://upexgalaxy65.atlassian.net/browse/SQ-13#icft=SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13#icft=SQ-13) (Client Management) | Autor: QA Team | Fecha: 2026-02-10

1. ***Alcance del Testing***

- ***✅ Incluido:*** Pruebas Funcionales, Validación de Totales, Seguridad (RLS), UX/Usabilidad, Paginación, Carga/Límites (50+ inv).
- ***❌ Excluido:*** Pruebas de performance a gran escala (Load Testing).

1. ***Pruebas Funcionales (Happy Path)***

***2.1 Visualización y Navegación***

- ***FTP-001:*** Ver historial con facturas existentes → Lista aparece ordenada por fecha descendente.
- ***FTP-002:*** Visualizar estados de factura → Badges con colores correctos según estado.
- ***FTP-003:*** Click en una factura de la lista → Redirección exitosa al detalle de la factura.
- ***FTP-004:*** Ver historial vacío → Mensaje "No hay facturas" y botón "Crear Factura".

**2.2 Lógica de Cálculos (Totale**s)

- ***FTP-005:*** Cálculo de "Total Invoiced" → Suma solo Sent + Paid + Overdue (Excluye Drafts/Cancelled).
- ***FTP-006:*** Cálculo de "Total Paid" → Suma exacta de montos recibidos.
- ***FTP-007:*** Cálculo de "Total Pending" → Diferencia correcta entre Invoiced y Paid.

1. ***Pruebas de Integridad y Seguridad***

- ***FTP-008:*** Acceso cruzado entre usuarios (RLS) → Usuario B no puede ver historial del Usuario A.
- ***FTP-009:*** Ver historial de cliente eliminado → El historial debe ser inaccesible o mostrarse como "solo lectura".
- ***FTP-010:*** Consistencia de moneda → Se muestra el símbolo ($/€) guardado en la factura.

1. ***Pruebas de Límites y Capacidad***

- ***FTP-011:*** Historial con +20 facturas → Paginación funcional presente.
- ***FTP-012:*** Carga de página con muchas facturas → Skeleton loader visible, carga < 1s.

1. ***Pruebas de UI/UX***

- ***FTP-013:*** Responsive design → Tabla se convierte en lista/cards en mobile.
- ***FTP-014:*** Tooltip en facturas canceladas → Explicación breve de por qué no suma al total.
- ***FTP-015:*** Hover effects → Filas resaltan al pasar el mouse para facilitar lectura.

1. ***Matriz de Prioridades***

- ***🔴 P0 - Blocker***: FTP-001, FTP-005, FTP-008 (Funcionalidad core y seguridad).
- ***🟠 P1 - Critical:*** FTP-003, FTP-004, FTP-011 (Navegación y listas vacías).
- ***🟡 P2 - Major:*** FTP-002, FTP-013, FTP-014 (Estética y usabilidad).

1. ***Notas Adicionales***

- Lógica de Negocio Crítica: Se confirmó que los Drafts (Borradores) NO deben inflar el "Total Facturado" del cliente para no generar falsas expectativas de ingreso.
- Sugerencia Técnica: Implementar el resumen de totales directamente en el componente de cabecera del historial para que sea lo primero que vea el usuario.

Documentation: Full test cases available at:

`.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-18-client-invoice-history/acceptance-test-plan.md`

---

### Rodrigo Godoy - 2/10/2026, 4:27:14 PM

# ***Actualización de Estimación (QA) - 2026-02-10***

### ***Nueva estimación: 2 SP (QA)***

Tras el análisis de Shift-Left Testing, se ha incrementado la estimación de 1 a 2 puntos por las siguientes razones:

1. ***Lógica de Cálculos Compleja:*** La validación de totales requiere inyectar y verificar estados mixtos (Sent, Paid, Draft,
Cancelled). Se debe asegurar que la lógica de exclusión de facturas borrador/canceladas sea precisa para la integridad
financiera.
2. ***Seguridad de Datos (RLS):*** Al manejar información de facturación, es crítico ejecutar pruebas de aislamiento para garantizar que ningún usuario acceda al historial de clientes ajenos.
3. ***Preparación de Escenarios (Data Seeding):*** Validar la paginación y los estados visuales diferenciados requiere un setup de datos

---

### Automation for Jira - 2/25/2026, 1:53:12 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2/25/2026, 1:54:16 AM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:47.047Z_
