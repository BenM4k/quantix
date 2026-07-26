# ERP Implementation Plan (v2 — Full Scope)

Architecture reminder: every module below follows the same layering —
`UI → Action → Service → DAL → Database`, living under `features/<module>/` and `dal/<module>/`.

This version fills in the gaps from v1: platform/identity, org structure, and full depth per business module.

---

## Phase 0 — Foundation & Tooling

- [x] Init Next.js app (App Router) + TypeScript strict mode
- [x] Drizzle ORM + PostgreSQL (`services/drizzle/`)
- [x] Better Auth (`services/better-auth/`)
- [-] BullMQ + Redis (`services/bullmq/`)
- [-] Logger (`lib/logger/`) — `info` / `error` / `audit`
- [x] Zod as shared validation library
- [x] Shared `Ok<T>` / `Err<E>` result type
- [-] File storage service (S3-compatible) for documents/attachments
- [x] Email service (transactional — invoices, payslips, notifications)
- [-] CI pipeline: typecheck, lint, migrations check, seed data

---

## Phase 1 — Platform Core (blocks everything else)

This is the part v1 skipped. Every module below depends on this existing first.

### 1.1 Multi-tenancy / Company structure

- [ ] Company / Organization entity (single-tenant vs multi-company support — decide now)
- [ ] Legal entities (if one org has multiple registered companies, e.g. for consolidated accounting)
- [ ] Branches / Locations
- [ ] Fiscal year & accounting period configuration per company

### 1.2 Department & Org Chart Management

- [ ] Department entity (hierarchical — parent/child departments)
- [ ] Position / Job Title entity
- [ ] Org chart (department → positions → employees), including manager/reports-to links
- [ ] Cost center mapping (departments tie into accounting cost centers)

### 1.3 User & Identity Management

- [ ] User entity (distinct from Employee — a user is a login; an employee is an HR record; they link but aren't the same thing)
- [ ] User invitation / onboarding flow
- [ ] Password reset, email verification, MFA (via Better Auth)
- [ ] User profile (avatar, locale, timezone, notification preferences)
- [ ] User status lifecycle (active, suspended, deactivated)
- [ ] Session/device management (view & revoke active sessions)

### 1.4 Roles & Permissions (RBAC/ABAC)

- [ ] Role entity (Admin, Accountant, Sales Rep, Warehouse Clerk, etc.) — configurable, not hardcoded
- [ ] Permission entity (granular: `invoice:create`, `payroll:view`, `journal:post`, etc.)
- [ ] Role–Permission mapping, stored in DB (not just code constants)
- [ ] User–Role assignment (supports multiple roles per user)
- [ ] Scoped permissions (e.g. "can approve purchase orders **up to $5,000**", "can view payroll **only for own department**")
- [ ] `lib/permissions/` helper pattern: `canX(user, resource)`
- [ ] Permission checks enforced at the Service layer, not just UI hiding

### 1.5 Workflow & Approvals Engine

- [ ] Generic approval-chain model (so it's reusable across PO approval, expense approval, leave approval, journal approval — not rebuilt per module)
- [ ] Multi-step approval (sequential and parallel)
- [ ] Approval delegation (out-of-office reassignment)
- [ ] Rejection + comment trail

### 1.6 Notifications

- [ ] In-app notification center
- [ ] Email notification templates
- [ ] Notification preferences per user/event type
- [ ] Real-time delivery (websocket/SSE or polling — decide)

### 1.7 Document Management

- [ ] Generic attachment system (attach files to any entity: invoice, employee, PO, asset)
- [ ] Versioning for uploaded documents
- [ ] Access control on documents (tied into RBAC)

### 1.8 System Settings & Localization

- [ ] Company-wide settings (currency, date format, number format, fiscal year start)
- [ ] Multi-currency support (exchange rates, rate source, historical rates)
- [ ] Multi-language / i18n
- [ ] Tax jurisdiction configuration (VAT/GST rates, tax rules per region)
- [ ] Numbering sequences (invoice #, PO #, employee ID — configurable per company, per branch)

### 1.9 Audit & Compliance

- [ ] Global audit log (who changed what, when, before/after values) — not just `logger.audit()` calls sprinkled in, but a queryable audit trail table
- [ ] Data retention policy support
- [ ] Field-level change history for sensitive records (salary changes, GL account edits)

---

## Phase 2 — HR Module (full depth)

v1 had "HR" as a single unchecked box. Actual scope:

- [ ] Employee master record (personal info, employment history, documents)
- [ ] Employment contracts (type, start/end date, probation, renewal tracking)
- [ ] Onboarding/offboarding checklists
- [ ] Attendance tracking (clock in/out, shift schedules)
- [ ] Leave management (leave types, balances, accrual rules, requests → approval workflow)
- [ ] Performance reviews / appraisal cycles
- [ ] Recruitment / applicant tracking (job postings, candidates, interview stages) — optional depending on scope
- [ ] Employee self-service portal (view payslip, request leave, update info)
- [ ] Org chart visualization (built on Phase 1.2 data)

---

## Phase 3 — Payroll Module (full depth)

- [ ] Salary structure (base pay, allowances, deductions — configurable components)
- [ ] Payroll run (batch processing per pay period)
- [ ] Tax withholding calculation (jurisdiction-aware, ties into Phase 1.8)
- [ ] Benefits & deductions (insurance, retirement contributions, loans)
- [ ] Payslip generation (PDF, via background job)
- [ ] Payroll → Accounting integration (auto-post payroll journal entries)
- [ ] Statutory reporting (varies by country — flag this as a research spike, not just a checkbox)

---

## Phase 4 — Accounting & Finance Module (full depth)

v1 had journal entries + GL. Real scope:

- [ ] Chart of Accounts (hierarchical, account types: asset/liability/equity/revenue/expense)
- [ ] Journal Entry service (immutable, double-entry enforced at the Service layer)
- [ ] General Ledger
- [ ] Accounts Receivable (customer invoices, payment matching, aging report)
- [ ] Accounts Payable (vendor bills, payment runs, aging report)
- [ ] Bank & Cash management (bank accounts, reconciliation, statement import)
- [ ] Fixed Assets (asset register, depreciation schedules, disposal)
- [ ] Multi-currency accounting (realized/unrealized FX gain-loss)
- [ ] Tax management (input/output tax, tax returns prep)
- [ ] Budgeting (budget vs actual per cost center/department)
- [ ] Financial statements (P&L, Balance Sheet, Cash Flow) — generated, not hand-built each time
- [ ] Period close process (lock periods, prevent backdated entries after close)
- [ ] Cost centers / dimensional accounting (tie into departments from Phase 1.2)

---

## Phase 5 — Inventory & Warehouse Module

- [ ] Product/Item master (SKU, categories, units of measure, variants)
- [ ] Warehouse & bin/location management
- [ ] Stock Ledger (insert-only, as in v1)
- [ ] Stock transfers between warehouses
- [ ] Stock adjustments (with reason codes, approval)
- [ ] Reorder point / low-stock alerts
- [ ] Batch/lot tracking and expiry (if relevant to your industry)
- [ ] Serial number tracking (if relevant)
- [ ] Physical inventory / stocktake reconciliation
- [ ] Costing method (FIFO/weighted average — decide, affects COGS accuracy)

---

## Phase 6 — Sales / CRM Module

- [ ] Customer master (contacts, credit terms, credit limit)
- [ ] Leads & opportunities (if CRM is in scope, not just order-taking)
- [ ] Quotations → Sales Orders → Invoices pipeline
- [ ] Invoice Service (as in v1, now with tax + multi-currency from Phase 1/4)
- [ ] Credit notes / returns
- [ ] Pricing rules & discounts (customer-specific, volume-based)
- [ ] Sales commission tracking (ties into Payroll potentially)

---

## Phase 7 — Purchasing / Procurement Module

- [ ] Vendor master (contacts, payment terms, performance rating)
- [ ] Purchase requisitions → Purchase Orders (with approval workflow from Phase 1.5)
- [ ] Goods receipt (matches PO, updates Stock Ledger)
- [ ] Vendor bill matching (3-way match: PO / receipt / invoice)
- [ ] Vendor payments (ties into AP from Phase 4)

---

## Phase 8 — Reporting & BI

- [ ] Standard report library (financial statements, inventory valuation, sales/purchase analysis, payroll summary)
- [ ] Custom report builder (if in scope — significant effort)
- [ ] Dashboards per role (exec dashboard, department dashboard)
- [ ] Export (PDF/Excel/CSV) for all reports
- [ ] Scheduled report delivery (email on a cron)

---

## Phase 9 — Background Jobs & Integrations

- [ ] BullMQ workers: PDF generation, email, payroll processing, report generation
- [ ] Event publishing pattern (event bus vs direct enqueue — decide)
- [ ] Idempotency for all jobs
- [ ] External integrations (bank feeds, e-invoicing/tax authority APIs if required in your country, payment gateways)
- [ ] Public API layer (if third parties need to integrate)

---

## Phase 10 — Hardening & Compliance

- [ ] Transaction rollback testing
- [ ] Permission tests per Action (deny-by-default)
- [ ] Load test Stock Ledger & GL aggregation — consider periodic snapshotting
- [ ] Penetration testing / security review (RBAC bypass attempts, IDOR checks)
- [ ] Data backup & disaster recovery plan
- [ ] Regulatory compliance review (varies heavily by country — e.g. e-invoicing mandates, payroll tax law, data protection/GDPR-equivalent)
- [ ] Migration path validation for future microservice split

---

## Key Decisions to Lock Down Before Building Modules

1. **Single-company or multi-company (multi-tenant) from day one?** Retrofitting multi-company into accounting/inventory later is a major rewrite.
2. **User vs Employee separation** — confirm not every employee needs a login, and not every user is an employee (e.g. external accountant).
3. **Permission model** — flat RBAC, or scoped/attribute-based (department-limited, amount-limited)? Real ERPs almost always need scoped.
4. **Approval engine** — build one generic reusable engine (Phase 1.5) vs bespoke approval logic per module. Generic is more work up front, saves massive duplication later.
5. **Costing method** for inventory (FIFO vs weighted average) — affects COGS and financial statement accuracy, hard to change after go-live.
6. **Which countries/jurisdictions** need to be supported for tax, payroll, and e-invoicing — this materially changes Phase 3 and Phase 4 scope.
7. **Cross-feature service calls & transaction propagation** (from v1) — still applies.

---

## Suggested Build Order (dependency-driven)

```
Phase 0 (Foundation)
   ↓
Phase 1 (Platform: company, dept, users, roles, approvals, notifications, settings)
   ↓
Phase 4 (Accounting core: CoA + Journal + GL — everything posts here)
   ↓
Phase 5 (Inventory core: Stock Ledger — Sales/Purchasing depend on it)
   ↓
Phase 2 + 3 (HR + Payroll — can run in parallel with Sales/Purchasing)
   ↓
Phase 6 + 7 (Sales + Purchasing — depend on Accounting + Inventory)
   ↓
Phase 8 (Reporting — depends on all data existing)
   ↓
Phase 9 (Integrations/Jobs — layered in throughout, formalized here)
   ↓
Phase 10 (Hardening)
```

Note: Phase 1 is non-negotiable up front. Every other module reads permissions, departments, and users constantly — building a feature module before platform core exists means retrofitting auth checks everywhere later.
