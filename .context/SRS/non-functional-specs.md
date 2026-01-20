# Non-Functional Specifications - SoloQ

> **Software Requirements Specification**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## 1. Performance

### 1.1 Page Load Performance

| Métrica | Target | Herramienta de Medición |
|---------|--------|-------------------------|
| **LCP** (Largest Contentful Paint) | < 2.0s | Lighthouse, Web Vitals |
| **FID** (First Input Delay) | < 100ms | Lighthouse, Web Vitals |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse, Web Vitals |
| **TTI** (Time to Interactive) | < 3.0s | Lighthouse |
| **TTFB** (Time to First Byte) | < 600ms | Lighthouse |

### 1.2 API Response Time

| Endpoint Type | Target (p95) | Target (p99) |
|---------------|--------------|--------------|
| Auth endpoints | < 500ms | < 1000ms |
| CRUD operations | < 300ms | < 500ms |
| List/Search queries | < 500ms | < 1000ms |
| PDF generation | < 3000ms | < 5000ms |
| Email sending | < 2000ms | < 4000ms |

### 1.3 Database Performance

| Métrica | Target |
|---------|--------|
| Query time (simple) | < 50ms |
| Query time (complex/joins) | < 200ms |
| Connection pool size | 10-20 connections |
| Max query execution time | 30s (timeout) |

### 1.4 Concurrent Users

| Tier | Target MVP | Target Scale |
|------|------------|--------------|
| Concurrent sessions | 100 | 1,000 |
| Requests per second | 50 | 500 |
| Database connections | 20 | 100 |

---

## 2. Security

### 2.1 Authentication

| Requirement | Implementation |
|-------------|----------------|
| **Auth Provider** | Supabase Auth (built-in) |
| **Session Management** | JWT tokens, httpOnly cookies |
| **Token Expiration** | Access: 1 hour, Refresh: 7 days |
| **Password Hashing** | bcrypt (Supabase default) |
| **MFA** | Opcional (Supabase TOTP) - Post-MVP |

### 2.2 Authorization

| Requirement | Implementation |
|-------------|----------------|
| **Model** | Row Level Security (RLS) en PostgreSQL |
| **Roles** | `authenticated`, `anon` (Supabase default) |
| **Data Isolation** | Cada usuario solo accede a sus propios datos |
| **Policy Enforcement** | Database-level (no bypass desde API) |

**RLS Policies Requeridas:**

```sql
-- Ejemplo: clients table
CREATE POLICY "Users can only see their own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Similar para: invoices, payments, business_profiles, etc.
```

### 2.3 Data Protection

| Área | Medida |
|------|--------|
| **Encryption at Rest** | Supabase maneja automáticamente (AES-256) |
| **Encryption in Transit** | HTTPS/TLS 1.3 obligatorio |
| **Sensitive Data** | No almacenar datos de tarjetas (Stripe maneja) |
| **PII** | Mínimo necesario, soft-delete para retención |
| **Backups** | Daily backups automáticos (Supabase) |

### 2.4 Input Validation

| Layer | Tool | Validation Type |
|-------|------|-----------------|
| Client-side | Zod + React Hook Form | Schema validation |
| Server-side | Zod | Schema validation (duplicada) |
| Database | PostgreSQL constraints | Type + check constraints |

### 2.5 OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| **Injection (SQL)** | Supabase client usa prepared statements |
| **Broken Auth** | Supabase Auth con token validation |
| **Sensitive Data Exposure** | HTTPS only, no secrets in frontend |
| **XXE** | No XML parsing |
| **Broken Access Control** | RLS policies |
| **Security Misconfiguration** | Environment variables, no hardcoded secrets |
| **XSS** | React escaping, CSP headers |
| **Insecure Deserialization** | JSON only, Zod validation |
| **Components with Vulnerabilities** | Dependabot alerts, regular updates |
| **Logging/Monitoring** | Structured logging, error tracking |

### 2.6 Password Policy

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Require uppercase | Yes (1+) |
| Require lowercase | Yes (1+) |
| Require number | Yes (1+) |
| Require special char | No (opcional) |
| Max failed attempts | 5 (lockout 15 min) |

---

## 3. Scalability

### 3.1 Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Stateless API** | Next.js API routes sin estado en servidor |
| **Horizontal Scaling** | Vercel auto-scales, Supabase connection pooling |
| **Database Scaling** | Supabase Pro permite read replicas |
| **CDN** | Vercel Edge Network para assets estáticos |

### 3.2 Caching Strategy

| Layer | Tool | TTL |
|-------|------|-----|
| **Static Assets** | Vercel CDN | 1 year (immutable) |
| **API Responses** | Cache-Control headers | Varies by endpoint |
| **Database Queries** | No caching en MVP | Consider Redis post-MVP |
| **PDF Generation** | Supabase Storage | Indefinido (regenerar si data cambia) |

**Cache-Control por Endpoint:**

| Endpoint | Cache-Control |
|----------|---------------|
| `/api/auth/*` | `no-store` |
| `/api/invoices` (list) | `no-store` |
| `/api/invoices/:id` | `no-store` |
| `/api/invoices/:id/pdf` | `private, max-age=300` |
| Static assets | `public, max-age=31536000, immutable` |

### 3.3 Database Connection Pooling

| Setting | Value |
|---------|-------|
| **Pool Mode** | Transaction (Supabase default) |
| **Pool Size** | 15 (free tier), 50+ (pro) |
| **Statement Timeout** | 30s |
| **Idle Timeout** | 20s |

---

## 4. Accessibility (WCAG 2.1 Level AA)

### 4.1 Core Requirements

| Requirement | Target |
|-------------|--------|
| **WCAG Level** | AA compliance |
| **Keyboard Navigation** | 100% de funcionalidad accesible |
| **Screen Reader** | ARIA labels en elementos interactivos |
| **Color Contrast** | Mínimo 4.5:1 (texto normal), 3:1 (texto grande) |
| **Focus Indicators** | Visible en todos los elementos focusables |
| **Text Resize** | Funcional hasta 200% zoom |

### 4.2 Specific Requirements

| Elemento | Requisito |
|----------|-----------|
| **Forms** | Labels asociados, error messages accesibles |
| **Buttons** | `aria-label` si solo icono |
| **Modals** | Focus trap, escape to close |
| **Tables** | Headers con `scope`, caption cuando aplique |
| **Images** | Alt text descriptivo (logo, etc.) |
| **Alerts** | `role="alert"` para notificaciones |

### 4.3 Testing Tools

| Tool | Purpose |
|------|---------|
| axe-core | Automated accessibility testing |
| Lighthouse | Accessibility audit |
| NVDA/VoiceOver | Manual screen reader testing |
| Keyboard-only | Manual navigation testing |

---

## 5. Browser Support

### 5.1 Desktop Browsers

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome | Last 2 | Primary |
| Firefox | Last 2 | Primary |
| Safari | Last 2 | Primary |
| Edge | Last 2 | Secondary |

### 5.2 Mobile Browsers

| Browser | Versions | Priority |
|---------|----------|----------|
| iOS Safari | Last 2 | Primary |
| Chrome Android | Last 2 | Primary |
| Samsung Internet | Last 2 | Secondary |

### 5.3 Feature Requirements

| Feature | Polyfill/Fallback |
|---------|-------------------|
| ES2020+ | Next.js handles transpilation |
| CSS Grid/Flexbox | Native support in all targets |
| Fetch API | Native support |
| Web Crypto | Native support |

### 5.4 Not Supported

- Internet Explorer (any version)
- Browsers older than 2 versions back
- JavaScript disabled (graceful degradation for static content only)

---

## 6. Reliability

### 6.1 Availability

| Métrica | Target |
|---------|--------|
| **Uptime** | 99.9% (8.76 hours downtime/year) |
| **Planned Maintenance** | < 4 hours/month, off-peak hours |
| **RTO** (Recovery Time Objective) | < 1 hour |
| **RPO** (Recovery Point Objective) | < 1 hour (daily backups + WAL) |

### 6.2 Error Handling

| Área | Strategy |
|------|----------|
| **API Errors** | Structured error responses (code, message, details) |
| **Client Errors** | Toast notifications, form-level errors |
| **Server Errors** | Generic message to user, detailed logging |
| **Network Errors** | Retry with exponential backoff (3 attempts) |

### 6.3 Error Rate Targets

| Metric | Target |
|--------|--------|
| **5xx Error Rate** | < 0.1% of requests |
| **4xx Error Rate** | < 5% of requests (mostly validation) |
| **Unhandled Exceptions** | 0 in production |

### 6.4 Monitoring & Alerting

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Performance, errors, usage |
| **Supabase Dashboard** | Database health, API usage |
| **Sentry** (recomendado) | Error tracking, stack traces |
| **Uptime Robot** (recomendado) | Availability monitoring |

---

## 7. Maintainability

### 7.1 Code Quality

| Metric | Target |
|--------|--------|
| **Test Coverage (Unit)** | > 70% |
| **Test Coverage (Integration)** | > 50% |
| **TypeScript Strict Mode** | Enabled |
| **ESLint Errors** | 0 |
| **Prettier Formatting** | Enforced via pre-commit |

### 7.2 Documentation

| Artifact | Location | Maintained By |
|----------|----------|---------------|
| API Documentation | OpenAPI spec | Auto-generated |
| Architecture Diagrams | `.context/SRS/` | Manual |
| README | Root | Manual |
| Code Comments | In-code | As needed |

### 7.3 Code Standards

| Standard | Tool |
|----------|------|
| **Formatting** | Prettier |
| **Linting** | ESLint (Next.js config + custom rules) |
| **Type Checking** | TypeScript strict |
| **Import Sorting** | eslint-plugin-import |
| **Commit Messages** | Conventional Commits |

### 7.4 Dependency Management

| Policy | Implementation |
|--------|----------------|
| **Security Updates** | Dependabot alerts, patch within 72h |
| **Major Updates** | Monthly review, test before merge |
| **Lock File** | pnpm-lock.yaml committed |
| **Version Pinning** | Exact versions in package.json |

---

## 8. Internationalization (i18n)

### 8.1 MVP Scope

| Aspect | MVP Support |
|--------|-------------|
| **UI Language** | Spanish (LATAM) only |
| **Currency** | USD (display), configurable symbol |
| **Date Format** | DD/MM/YYYY (LATAM standard) |
| **Number Format** | 1,234.56 (US format for USD) |
| **Timezone** | User's browser timezone |

### 8.2 Future Considerations (Post-MVP)

- Multi-language support (English, Portuguese)
- Multi-currency with conversion
- Locale-specific date/number formatting
- RTL support (not prioritized)

---

## 9. Data Retention

### 9.1 Retention Policies

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| **User Accounts** | Indefinite (while active) | Business need |
| **Invoices** | 7 years | Legal/tax requirements |
| **Payments** | 7 years | Legal/tax requirements |
| **Audit Logs** | 1 year | Security/compliance |
| **Session Data** | 7 days | Security |
| **Deleted Records** | 30 days (soft delete) | Recovery |

### 9.2 Data Deletion

| Request Type | Process | Timeline |
|--------------|---------|----------|
| **Account Deletion** | Soft delete + anonymization | Within 30 days |
| **Data Export** | CSV/JSON export | On request |
| **Invoice Deletion** | Soft delete, maintain for 7 years | Immediate soft delete |

---

## 10. Compliance Considerations

### 10.1 In Scope (MVP)

| Regulation | Scope | Implementation |
|------------|-------|----------------|
| **Basic Privacy** | User data protection | Secure storage, access control |
| **Terms of Service** | User agreement | Required at signup |
| **Data Portability** | Export user data | CSV export feature |

### 10.2 Out of Scope (MVP)

- GDPR full compliance (EU focus)
- SOC 2 certification
- PCI-DSS (Stripe handles payment data)
- Facturación electrónica fiscal

---

*Documento parte del SRS de SoloQ - Fase 2 Architecture*
