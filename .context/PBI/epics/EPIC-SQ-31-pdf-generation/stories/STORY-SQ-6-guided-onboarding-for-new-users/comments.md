# Comments for SQ-6

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-6)

---

### Juan Leites - 2/17/2026, 8:59:55 AM

# ***Shift-Left Test Plan***



### Scenario 1: New user is redirected to onboarding after email verification

- ***Given:*** I just verified my email by clicking the link
- ***When:*** The verification is successful
- ***Then:*** I am redirected to the onboarding flow instead of the dashboard.

***Note:***   - Luego de hace click en el link, de ser negativa la verificación, se muestra un mensaje?, si es así, se debería mostrar el porque no se verifico el link (ej: link expirado) y la accion siguiente a realizar. Además se debe generar un mock para la UI de este mensaje.

De ser exitosa, se muestra algún mensaje con las instrucciones de como seguir o redirige automáticamente al onboarding? Si se muestra mensaje agregar mock para la UI del mismo.



### Scenario 2: Complete onboarding step by step

- ***Given:*** I am on the onboarding flow
- ***When:*** I complete each step (business name, contact info, payment methods)
- ***Then:*** I see a progress indicator, can navigate back/forward, and see helpful tips

***Note: - ***Que pasa si completo un campo y vuelvo hacia atrás, se borran los datos o permanecen? En mobile, si estoy en la pagina de métodos de pagos y llene todos los campos, al poner la app en segundo plano, se pueden ver los datos? Si no se pueden ver aclarar que es lo que se muestra. Que pasa cuando el onboarding es exitoso? se muestra algún mensaje o redirige al Dashboard? Si muestra mensaje aclarar texto y UI del  mismo. Aplicar mismo criterio para onboarding fallido.



### Scenario 3: Skip optional steps

- ***Given:*** I am on an optional step (like logo upload)
- ***When:*** I click "Skip for now"
- ***Then:*** I advance to the next step without filling that information

***Note: ***Que se muestra en el home si no se elige logo?



### Scenario 4: Complete onboarding and reach dashboard

- ***Given:*** I have completed all required onboarding steps
- ***When:*** I click "Get Started" on the final step
- ***Then:*** I am redirected to an empty dashboard with a CTA to create my first invoice



### Scenario 5: Resume incomplete onboarding

- ***Given:*** I started onboarding but closed the browser before completing
- ***When:*** I login again
- ***Then:*** I am taken back to the onboarding at the step where I left off

***Note: ***Los datos ingresados permanecen o son borrados?



# Feature Test Plan



# ***Feature Test Plan (FTP) – Onboarding guiado post-verificación de email***

***Jira Key:*** US-SQ- 6
***Epic:*** EPIC-SQ-31 – Onboarding
***Autor:*** QA Team
***Fecha:*** 2026-02-10

---

## 1. Objetivo

Validar que el flujo de onboarding posterior a la verificación de email funcione de manera correcta, consistente y resiliente, garantizando:

- correcta redirección del usuario
- navegación fluida entre pasos
- persistencia de datos
- manejo adecuado de errores
- protección contra estados inconsistentes
- experiencia de usuario clara

---

## 2. Alcance del Testing

| Tipo de prueba | Incluido |
| --- | --- |
| Pruebas funcionales | ✅ |
| Validaciones de datos | ✅ |
| Concurrencia | ✅ |
| UX / Usabilidad | ✅ |
| Persistencia | ✅ |
| Accesibilidad básica | ✅ |
| Carga / Stress | ❌ |
| Penetration testing | ❌ |
| Seguridad avanzada | ❌ |

---

## 3. Pruebas Funcionales (Happy Path)

### 3.1 Verificación exitosa y redirección

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-HP-01 | El usuario hace clic en el enlace de verificación y esta es exitosa. | El usuario es redirigido al onboarding (no al dashboard). |
| FTP-HP-02 | Tras la verificación exitosa. | Se muestra un mensaje con instrucciones o se realiza redirección automática al onboarding. |
| FTP-HP-03 | Completar todos los pasos y presionar ***“Get Started”***. | Redirección al dashboard inicial. |
| FTP-HP-04 | Acceder al dashboard luego del onboarding. | Se muestra un CTA claro para crear la primera factura (o equivalente). |

---

### 3.2 Completar onboarding paso a paso

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-ONB-01 | Navegar entre pasos (negocio, contacto, pagos). | El indicador de progreso refleja correctamente el avance. |
| FTP-ONB-02 | Usar “Atrás” y luego “Siguiente”. | La navegación funciona sin errores ni pérdida de estado. |
| FTP-ONB-03 | Revisar cada paso. | Se muestran tips o textos de ayuda relevantes. |
| FTP-ONB-04 | Completar los pasos obligatorios. | Se muestra mensaje de éxito o redirección automática al dashboard. |
| FTP-ONB-05 | Completar solo pasos obligatorios. | Se permite finalizar el onboarding correctamente. |
| FTP-ONB-06 | Recorrer el flujo completo. | El orden de pasos coincide con la especificación. |

---

### 3.3 Omitir pasos opcionales

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-OPT-01 | En un paso opcional (ej. subir logo), seleccionar ***“Skip for now”***. | Se avanza sin bloquear el flujo. |
| FTP-OPT-02 | Llegar al dashboard sin logo. | Se muestra placeholder, iniciales o icono por defecto sin errores visuales. |

---

### 3.4 Reanudar onboarding incompleto

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-RES-01 | Completar hasta un paso intermedio, cerrar navegador y volver a iniciar sesión. | El usuario retorna al último paso no completado. |
| FTP-RES-02 | Repetir el proceso cerrando en distintos pasos. | Siempre se reanuda correctamente sin inconsistencias. |
| FTP-RES-03 | Intentar acceder al onboarding tras haberlo completado. | Redirección al dashboard o mensaje “onboarding ya completado”. |

---

## 4. Pruebas de Validación

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-VAL-01 | Intentar avanzar sin completar campos obligatorios. | Se bloquea el avance y se muestran errores claros. |
| FTP-VAL-02 | Introducir formatos inválidos (email, teléfono, etc.). | Validación visible y bloqueo hasta corregir. |
| FTP-VAL-03 | Acceder por URL a un paso posterior sin completar previos. | Redirección al primer paso incompleto. |
| FTP-VAL-04 | Hacer doble clic en “Get Started”. | No se generan duplicados; comportamiento idempotente. |

---

## 5. Pruebas de Concurrencia

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-CON-01 | Usuario A y B realizan onboarding en paralelo. | Los datos no se mezclan entre usuarios. |
| FTP-CON-02 | Mismo usuario en dos navegadores. | Existe un único estado consistente del onboarding sin corrupción de datos. |

---

## 6. Pruebas de Persistencia

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-PER-01 | Completar un paso, avanzar y volver atrás. | Los datos permanecen guardados. |
| FTP-PER-02 | Reanudar tras cierre del navegador. | El progreso se conserva correctamente. |
| FTP-PER-03 | Interrupciones (cierre de pestaña, pérdida de red). | Persistencia acorde a la especificación. |
| FTP-PER-04 | En mobile, enviar la app a segundo plano. | No se exponen datos sensibles; comportamiento documentado. |

---

## 7. UX, Usabilidad y Manejo de Errores

| ID | Caso de prueba | Resultado esperado |
| --- | --- | --- |
| FTP-ERR-01 | Usar enlace de verificación inválido o expirado. | Mensaje claro con acción recomendada. |
| FTP-ERR-02 | Fallo al completar onboarding. | Mensaje amigable indicando cómo proceder. |
| FTP-ERR-03 | Simular caída de red/backend. | Error sin jerga técnica y opción de reintento. |
| FTP-ERR-04 | Sesión expirada durante onboarding. | Redirección al login y reanudación posterior. |
| FTP-ERR-05 | Errores genéricos (timeout, 500). | Mensaje controlado sin exponer detalles técnicos. |
| FTP-UX-01 | Usar botón “Atrás” del navegador. | Comportamiento definido sin estados inconsistentes. |
| FTP-UX-02 | Cerrar sesión durante el onboarding. | Al volver a iniciar sesión se aplica la regla de reanudación. |

---

## 8. Artefactos pendientes / Definiciones de UX

Se deberán definir o proveer mocks para:

- verificación fallida
- verificación exitosa
- onboarding completado
- onboarding fallido
- dashboard sin logo
- reglas explícitas de persistencia
- comportamiento multi-navegador

---

### Automation for Jira - 2/25/2026, 2:20:39 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Ely - 2/25/2026, 9:08:20 AM

## Feature implementada y desplegada en staging ✅

***PR:*** [#59](https://github.com/upex-galaxy/upex-soloq/pull/59) (MERGED)
***Branch:*** `feat/SQ-6/guided-onboarding`

### Resumen de implementación:

- Flujo de onboarding de 5 pasos (nombre, contacto, logo, pagos, resumen)
- Persistencia de progreso en DB (onboarding*step, onboarding*completed)
- Redirect automático desde auth callback
- Componentes reutilizables con validación Zod

@Juan Leites La funcionalidad está lista para pruebas en el ambiente de staging.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:55.183Z_
