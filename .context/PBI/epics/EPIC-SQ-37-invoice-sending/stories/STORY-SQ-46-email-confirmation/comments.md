# Comments for SQ-46

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-46)

---

### Miguel Millan - 2/7/2026, 3:23:09 PM

## Shift-Left Test Plan – Gherkin Format

### Feature: View Email Send Confirmation

Como usuario, quiero ver si el correo electrónico fue enviado exitosamente para tener certeza de que llegó.

---

### Background:

***Given*** el usuario ha iniciado sesión correctamente en la aplicación
***And*** se encuentra en la pantalla donde se envía un correo electrónico (por ejemplo, confirmación de pedido, restablecimiento de contraseña, etc.)

---

### Scenario: Visualizar confirmación de envío de correo electrónico

***Given*** el usuario ha completado correctamente el formulario de envío de correo electrónico
***And*** ha presionado el botón de “Enviar”
***When*** el sistema procesa la solicitud de envío de correo electrónico
***Then*** el sistema debe mostrar un mensaje de confirmación indicando que el correo fue enviado exitosamente
***And*** el usuario debe poder ver el estado de envío en el historial o registro de actividad
***And*** si el envío falla, debe mostrarse un mensaje de error explicativo

---

### Alternativo: Error en envío de correo

***Given*** el usuario ha intentado enviar un correo con datos incompletos o conexión inestable
***When*** el sistema intenta enviar el correo electrónico
***Then*** debe mostrarse un mensaje indicando que el envío falló
***And*** el usuario debe tener la opción de reenviar el correo

---

### Notas para QA:

- Validar que el mensaje de confirmación sea claro, visible y accesible (cumple criterios de accesibilidad WCAG si aplica)
- Verificar logs del backend para confirmar que el correo realmente fue enviado
- Comprobar visibilidad del estado del envío (en alguna parte del UI: icono, mensaje, historial, etc.)

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:54:00.421Z_
