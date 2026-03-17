# BUG: Database: Schema: Faltan Foreign Key constraints críticas (invoices, items, payments)

**Jira Key:** [SQ-109](https://upexgalaxy65.atlassian.net/browse/SQ-109)
**Priority:** High
**Status:** Enhancement
**Components:** None
**Severity:** Mayor
**Error Type:** Data
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

*RESUMEN*

Durante la auditoría del schema de base de datos de SoloQ, se detectó que NO existen Foreign Key constraints explícitas en las relaciones críticas de facturación, a pesar de que las relaciones lógicas están implementadas en el código. Esto permite la creación de datos huérfanos y compromete la integridad referencial de la base de datos.

**Verificación realizada:** Se ejecutaron queries de validación y NO se encontraron datos huérfanos actualmente (0 registros corruptos). Sin embargo, la ausencia de FKs representa un riesgo alto para migraciones futuras, accesos directos a DB, y la correcta implementación de SQ-19 (Delete Client).

---

*STEPS TO REPRODUCE*

#### Conectarse a la base de datos Supabase del proyecto SoloQ (czuusjchqpgvanvbdrnz)

#### Ejecutar query para verificar foreign keys existentes:

```

SELECT constraint*name, table*name, constraint_type

FROM information*schema.table*constraints

WHERE constraint_type = 'FOREIGN KEY'

  AND table_schema = 'public'

  AND table*name IN ('invoices', 'invoice*items', 'payments');

```

#### Observar que el resultado está vacío (0 rows)

#### Intentar insertar factura con cliente inexistente para demostrar la vulnerabilidad:

```

INSERT INTO invoices (user*id, client*id, invoice*number, due*date) 

VALUES (

  (SELECT user_id FROM profiles LIMIT 1),

  '99999999-9999-9999-9999-999999999999',

  'TEST-999', 

  CURRENT_DATE

);

```

#### Observar que el INSERT se ejecuta exitosamente sin error (debería rechazarse con FK violation)

---

*TECHNICAL ANALYSIS*

- *Base de Datos:* PostgreSQL (Supabase: czuusjchqpgvanvbdrnz)
- *Tablas Afectadas:* invoices, invoice_items, payments, clients
- *Network:* N/A (problema de schema en DB)
- *Console:* N/A

**FKs Faltantes:**

1. invoices.client_id → clients.id (NO enforced)
2. invoices.user*id → profiles.user*id (NO enforced)
3. invoice*items.invoice*id → invoices.id (NO enforced)
4. payments.invoice_id → invoices.id (NO enforced)

---

*IMPACTO*

- Datos huérfanos potenciales
- Inconsistencia financiera
- Riesgo en migraciones
- SQ-19 bloqueado sin FK RESTRICT

**Estado actual (verificado 2026-03-02):**

• Facturas huérfanas: 0

• Items huérfanos: 0

• Pagos huérfanos: 0

---

*RELATED STORIES*

- Parent: SQ-19 (Delete Client)
- Similar: SQ-87 (CHECK constraint faltante)

---

## 🐞 Actual Result

La base de datos permite la creación de registros con referencias a entidades inexistentes. Se puede crear una factura con client*id que no existe en clients, insertar invoice*items con invoice*id inválido, y registrar payments con invoice*id inexistente. El INSERT se ejecuta exitosamente sin restricciones. Actualmente NO hay datos corruptos (verificado: 0 registros huérfanos), pero la ausencia de FKs deja vulnerable el sistema.

---

## ✅ Expected Result

La base de datos debería rechazar con error de constraint violation cualquier intento de insertar/actualizar un registro que referencie una entidad inexistente. Ejemplo: ERROR: insert or update on table invoices violates foreign key constraint fk*invoices*client. Las FKs deben tener reglas de cascada: RESTRICT para invoices-clients (proteger [https://upexgalaxy65.atlassian.net/browse/SQ-19#icft=SQ-19](https://upexgalaxy65.atlassian.net/browse/SQ-19#icft=SQ-19)), RESTRICT para invoices-profiles, CASCADE para invoice_items-invoices, RESTRICT para payments-invoices.

---

## 🔍 Root Cause

**Category:** Code Error

---

## 🚩 Workaround

Temporal: Mantener validaciones estrictas en capa de aplicación (ya funcionando) y auditar regularmente con queries: SELECT COUNT:yellow*star: FROM invoices i LEFT JOIN clients c ON i.client*id = c.id WHERE c.id IS NULL. Esto NO previene inserts directos vía SQL o migraciones mal escritas.

---

## Metadata

- **Created:** 3/2/2026
- **Updated:** 3/2/2026
- **Reporter:** Arkaitz
- **Assignee:** Arkaitz
- **Labels:** bug, database, integrity, schema, technical-debt

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.961Z_
