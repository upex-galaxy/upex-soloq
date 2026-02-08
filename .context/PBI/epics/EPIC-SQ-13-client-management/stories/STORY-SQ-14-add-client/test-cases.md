# Shift-Left Test Plan - Gherkin Format

## Feature: Add New Client

**Jira Key:** [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Autor:** Gemini CLI (AI Agent)
**Fecha:** 2026-02-07

---

### Background:

Given el usuario ha iniciado sesión correctamente en la aplicación
And se encuentra en la página "Agregar cliente" (`/clients/create`)
And tiene permisos para crear clientes

### Scenario: Crear cliente con información básica (Happy Path)

Given el usuario está en la página "Agregar cliente"
When el usuario rellena el campo "Nombre" con "Nuevo Cliente"
And el usuario rellena el campo "Email" con "nuevo@cliente.com"
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de confirmación "Cliente guardado correctamente"
And el sistema debe redirigir al usuario a la página `/clients`
And "Nuevo Cliente" debe aparecer en la lista de clientes del usuario

### Scenario: Validar formato de correo electrónico inválido

Given el usuario está en la página "Agregar cliente"
When el usuario rellena el campo "Nombre" con "Cliente Inválido"
And el usuario rellena el campo "Email" con "email-invalido"
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de error "Ingresa un email válido" debajo del campo "Email"
And el cliente no debe ser guardado

### Scenario: Prevenir la creación de clientes duplicados por email

Given un cliente con el correo electrónico "duplicado@cliente.com" ya existe para el usuario actual
And el usuario está en la página "Agregar cliente"
When el usuario rellena el campo "Nombre" con "Otro Cliente"
And el usuario rellena el campo "Email" con "duplicado@cliente.com"
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de error "Ya existe un cliente con este email" (en un toast destructivo)
And el cliente no debe ser guardado

### Scenario: Crear cliente con todos los campos opcionales

Given el usuario está en la página "Agregar cliente"
When el usuario rellena el campo "Nombre" con "Cliente Completo"
And el usuario rellena el campo "Email" con "completo@cliente.com"
And el usuario rellena el campo "Empresa" con "Empresa S.A."
And el usuario rellena el campo "Teléfono" con "+52 55 1234 5678"
And el usuario rellena el campo "Dirección" con "Calle Falsa 123, Ciudad, País"
And el usuario rellena el campo "Notas" con "Notas internas para el cliente completo"
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de confirmación "Cliente guardado correctamente"
And el sistema debe redirigir al usuario a la página `/clients`
And el cliente "Cliente Completo" debe aparecer en la lista de clientes con toda la información proporcionada

### Scenario: Validación de campo "Nombre" requerido

Given el usuario está en la página "Agregar cliente"
When el usuario deja el campo "Nombre" vacío
And el usuario rellena el campo "Email" con "valido@cliente.com"
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de error "El nombre debe tener al menos 2 caracteres" debajo del campo "Nombre"
And el cliente no debe ser guardado

### Scenario: Error interno del servidor durante la creación del cliente

Given el usuario está en la página "Agregar cliente"
And ocurre un error inesperado en el servidor al intentar guardar el cliente (simulado o forzado)
When el usuario rellena los campos requeridos con datos válidos
And el usuario hace clic en el botón "Guardar cliente" (`data-testid="client-form-submit"`)
Then el sistema debe mostrar un mensaje de error "Error al guardar el cliente. Intenta de nuevo." (en un toast destructivo)
And el cliente no debe ser guardado

---

## Notas para QA:

- **Accesibilidad (A11y):** Validar que el formulario y sus mensajes de error cumplen con los criterios de accesibilidad (ej. navegación por teclado, contraste de colores, lectores de pantalla).
- **Estados de UI:** Verificar que el botón "Guardar cliente" muestra un spinner y se deshabilita durante el envío del formulario (`isLoading`).
- **Responsividad:** Comprobar que el formulario se adapta correctamente a diferentes tamaños de pantalla (móvil y escritorio).
- **Validación:** Asegurarse de que los mensajes de error son claros y específicos para cada validación fallida.
- **Vacío y Nulo:** Asegurarse de que los campos opcionales se guardan correctamente si se dejan vacíos.
- **Carga inicial:** Si el formulario se precarga con datos (en edición), asegurarse de que los campos se muestran correctamente.
- **data-testid:** Verificar que los atributos `data-testid` están presentes en los elementos interactivos clave para la automatización de pruebas.
- **Integridad de datos:** Asegurarse de que los datos introducidos se reflejan exactamente como se espera después de guardar.
- **Mensajes de error:** Comprobar que los mensajes de error específicos (ej. duplicados) se muestran correctamente.
- **Comportamiento de redirección:** Verificar que después de un guardado exitoso, la redirección a `/clients` ocurre como se espera.
- **Manejo de caracteres:** Probar con caracteres especiales, acentos, y longitudes máximas de texto en los campos para asegurar que no se produzcan errores o truncamientos.
