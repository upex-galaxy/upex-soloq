# EPIC: Client Management

**Jira Key:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13)
**Priority:** HIGH
**Phase:** Core Features (Sprint 2-3)
**Total Story Points:** 15

---

## Description

Gestión de la base de datos de clientes del freelancer. Permite agregar, listar, editar y eliminar clientes, así como ver su historial de facturas.

## Business Value

Una base de clientes organizada es fundamental para el flujo de facturación. El freelancer necesita poder acceder rápidamente a la información de sus clientes para crear facturas y dar seguimiento a pagos.

---

## Acceptance Criteria

- Usuario puede agregar nuevos clientes con nombre y email
- Usuario puede ver lista de todos sus clientes
- Usuario puede editar datos de clientes existentes
- Usuario puede agregar información fiscal del cliente
- Usuario puede ver historial de facturas por cliente
- Usuario puede eliminar clientes (soft delete)

---

## User Stories (6)

| Key                                                      | Story                       | Points | Priority |
| -------------------------------------------------------- | --------------------------- | ------ | -------- |
| [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14) | Add New Client              | 3      | High     |
| [SQ-15](https://upexgalaxy64.atlassian.net/browse/SQ-15) | List All Clients            | 3      | High     |
| [SQ-16](https://upexgalaxy64.atlassian.net/browse/SQ-16) | Edit Client Data            | 2      | Medium   |
| [SQ-17](https://upexgalaxy64.atlassian.net/browse/SQ-17) | Add Client Tax Information  | 2      | Medium   |
| [SQ-18](https://upexgalaxy64.atlassian.net/browse/SQ-18) | View Client Invoice History | 3      | Medium   |
| [SQ-19](https://upexgalaxy64.atlassian.net/browse/SQ-19) | Delete Client               | 2      | Low      |

---

## Technical Considerations

### Database Tables

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  tax_id VARCHAR(20),
  tax_id_type VARCHAR(10),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);
```

### RLS Policies

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL
  USING (auth.uid() = user_id);
```

### API Endpoints

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/clients`              | List all clients             |
| POST   | `/api/clients`              | Add new client               |
| GET    | `/api/clients/:id`          | Get client details           |
| PUT    | `/api/clients/:id`          | Update client                |
| DELETE | `/api/clients/:id`          | Soft delete client           |
| GET    | `/api/clients/:id/invoices` | Get client's invoice history |

---

## Dependencies

### Blocked By

- SQ-1 (Epic: User Auth) - needs authenticated users

### Blocks

- EPIC 4 (Invoice Creation) - needs clients to create invoices

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 3)
- **SRS:** `.context/SRS/functional-specs.md` (FR-012 to FR-017)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
