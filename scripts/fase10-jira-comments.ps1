$comments = @{}

$comments["SQ-47"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-47

### UI
- Validado empty-state real con usuario `fernando.j.masci@gmail.com` (sin facturas activas).
- Se muestra `No tienes facturas aun` + CTA `Crear primera factura`.
- CTA navega correctamente a `/invoices/create`.

### API
- `GET /api/invoices?page=1&limit=20&sortBy=created_at&sortOrder=desc` -> 200.
- Contrato validado: `dataLen=0`, `pagination.total=0`, `totalPages=0`.

### DB
- Dataset validado para `user_id=0c1fe098-7292-4ba4-ad3e-adc44f58bb42`.
- `active_invoices=0` (`deleted_at is null`).
- `soft_deleted_invoices=5` (limpieza de datos de prueba autorizada).

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Empty-state + CTA OK |
| API | PASS | Lista vacia y paginacion consistente |
| DB | PASS | 0 activas confirmado |
| Overall | PASS | AC-4 cubierto, story lista |

### Defect Linkage
- N/A
"@

$comments["SQ-48"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-48

### UI
- El filtro por tabs cambia el listado correctamente.
- La URL no persiste `?status=...`; al recargar vuelve a `Todas`.

### API
- Request filtrada correcta observada: `GET /api/invoices?status=paid&page=1&limit=20&sortBy=created_at&sortOrder=desc` -> 200.

### DB
- Datos por estado consistentes; sin inconsistencia de persistencia en tablas.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | FAIL | No persiste filtro en URL/reload |
| API | PASS | Filtro aplicado por query |
| DB | PASS | Sin inconsistencia de datos |
| Overall | FAIL | Requiere fix en persistencia de estado |

### Defect Linkage
- `SQ-177` (nuevo, relacionado a SQ-48)
"@

$comments["SQ-49"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-49

### UI
- Total pendiente visible y reactivo al cambio de estado de factura.

### API
- `/api/invoices/dashboard` consistente con agregacion de pendientes y conteos.

### DB
- `pending_total` validado contra `SUM(total)` de `status in ('sent','overdue')`.
- Reconciliacion correcta tras pago (`sent` baja, `paid` sube).

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Reactividad correcta |
| API | PASS | Agregacion consistente |
| DB | PASS | Suma/estados validados |
| Overall | PASS | Sin defecto nuevo |

### Defect Linkage
- N/A
"@

$comments["SQ-50"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-50

### UI
- Se mantiene inconsistencia de semantica overdue ya observada.

### API
- Dashboard/API no alinea `overdue_count/overdue_total` con escenario observado.

### DB
- Regla base y datos de soporte validados; desalineacion persiste entre capas.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | FAIL | Inconsistencia overdue |
| API | FAIL | Metricas overdue no alineadas |
| DB | PASS | Datos base validos |
| Overall | FAIL | Pendiente fix funcional |

### Defect Linkage
- `SQ-176` (vigente)
"@

$comments["SQ-51"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-51

### UI
- Busqueda funcional, pero en no-results muestra copy de empty-account en `Todas`.

### API
- Queries de busqueda responden 200 y retornan 0 en no-match.

### DB
- Sin hallazgos de integridad en este alcance.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | FAIL | No-results vs empty-state no diferenciado |
| API | PASS | Contrato busqueda correcto |
| DB | PASS | Sin discrepancias relevantes |
| Overall | FAIL | Pendiente correccion UX/state |

### Defect Linkage
- `SQ-169` (vigente)
"@

$comments["SQ-52"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-52

### UI
- Reactividad post-pago visible, semantica historica mensual sigue desalineada.

### API
- `/api/invoices/dashboard` agrega pagadas del mes por status/total observado.

### DB
- En registros evaluados `invoices.status='paid'` con `paid_at = null`; desalinea criterio esperado por `paid_at`.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PARTIAL | Reactividad OK, semantica no |
| API | FAIL | Desalineacion semantica |
| DB | FAIL | `paid_at` no acompana criterio |
| Overall | FAIL | Pendiente fix semantico |

### Defect Linkage
- `SQ-175` (vigente)
"@

$comments["SQ-53"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-53

### UI
- Flujo mark-as-paid funcional (modal, confirmacion, cambio de estado).

### API
- Estado y conteos de dashboard/listado se actualizan de forma consistente.

### DB
- Se crea `payments` correctamente.
- Observacion funcional: `invoices.paid_at` permanece null en casos evaluados.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Flujo principal correcto |
| API | PASS | Estado/conteos consistentes |
| DB | PARTIAL | Observacion sobre `paid_at` |
| Overall | IN TEST | Cerrar criterio final `paid_at` |

### Defect Linkage
- Relacionado con linea semantica de `SQ-175`
"@

$comments["SQ-54"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-54

### UI
- Opciones visibles y seleccionables: Transferencia, PayPal, Mercado Pago, Efectivo, Otro.

### API
- Flujo de registro de pago estable.

### DB
- Persistencia correcta en `payments.payment_method`.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Dropdown/seleccion correctos |
| API | PASS | Flujo estable |
| DB | PASS | Persistencia correcta |
| Overall | PASS | QA Approved |

### Defect Linkage
- N/A
"@

$comments["SQ-56"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-56

### UI
- Campo notas opcional operativo y contador visible.

### API
- Registro de pago con notas sin romper flujo.

### DB
- Persistencia correcta en `payments.notes`.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Input/counter correctos |
| API | PASS | Flujo estable |
| DB | PASS | Persistencia correcta |
| Overall | PASS | QA Approved |

### Defect Linkage
- N/A
"@

$comments["SQ-57"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-57

### UI
- Flujo principal con fecha valida OK; intento con fecha futura no concreto pago.

### API
- Comportamiento consistente con restriccion efectiva en flujo evaluado.

### DB
- `payments.payment_date` persistida en caso valido; en fecha futura no se inserto pago ni cambio estado.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Restriccion efectiva observada |
| API | PASS | Comportamiento consistente |
| DB | PASS | Persistencia/no persistencia correctas |
| Overall | PASS | QA Approved |

### Defect Linkage
- N/A
"@

$comments["SQ-58"] = @"
@Ely QA Fase 10 Exploratory Trifuerza (UI + API + DB) - SQ-58

### UI
- Revertir pago con confirm dialog funcional; ciclo paid -> sent y re-pago validado.

### API
- Estado de factura refleja reversa correctamente.

### DB
- Soft delete validado en `payments.deleted_at`; estado final consistente con `due_date`.

### Decision Matrix
| Capa | Resultado | Nota breve |
|---|---|---|
| UI | PASS | Flujo completo correcto |
| API | PASS | Estado consistente |
| DB | PASS | Soft delete/estado correctos |
| Overall | PASS | QA Approved |

### Defect Linkage
- N/A
"@

foreach ($issue in $comments.Keys | Sort-Object) {
  Write-Host "Posting comment for $issue..."
  bun run jira:comment $issue --body $comments[$issue]
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed on $issue" -ForegroundColor Red
    exit 1
  }
}

Write-Host "Done." -ForegroundColor Green
