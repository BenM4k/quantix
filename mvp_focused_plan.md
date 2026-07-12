# ERP MVP Plan (v3 — SaaS, Lean Scope)

Target user: solo devs / small businesses. No departments, no approval chains, no HR/payroll.
Core loop: **quote/order → invoice → payment → stock movement → journal entry → financial statements.**

Every module still follows `UI → Action → Service → DAL → Database`.

---

## What's explicitly CUT from v2 (add later if customers ask)

- Departments / org chart / cost centers
- Approval workflow engine
- HR, Payroll
- Fixed assets, budgeting
- Multi-currency FX gain/loss (single base currency for MVP — flag multi-currency as a fast-follow if you get international users)
- Custom report builder (ship 3-4 fixed reports instead)
- Document versioning, granular scoped permissions (flat roles only)
- Purchasing/AP (vendor bills) — **you didn't ask for this; if you need to record expenses, MVP handles it via manual journal entries in Phase 2, not a full PO/vendor pipeline.** Add Purchasing as v1.1 once Sales is validated.

---

## Phase 0 — Foundation

- [x] Next.js (App Router) + TypeScript strict
- [x] Drizzle + PostgreSQL (`services/drizzle/`)
- [x] Better Auth (`services/better-auth/`) — email/password + one OAuth provider
- [ ] Stripe (or equivalent) for SaaS billing/subscription — this is MVP-critical and easy to forget since it's not "ERP logic"
- [ ] BullMQ + Redis (`services/bullmq/`) — needed early for PDF/email jobs
- [ ] Logger (`lib/logger/`)
- [ ] Zod validation
- [ ] Shared `Ok<T>` / `Err<E>` result type
- [ ] Email service (transactional)
- [ ] File storage (S3-compatible) — for invoice PDFs, receipts

---

## Phase 1 — Platform Core (lean version)

Only what's needed to support one company per workspace, with fiscal periods.

### 1.1 Company / Tenant

- [ ] `Company` entity = the tenant. One company per workspace for MVP (multi-company per account is a v2 feature, not MVP)
- [ ] Company settings: base currency, date format, number format
- [ ] **Fiscal year configuration** (start month/day) per company
- [ ] **Fiscal periods** (monthly or quarterly, generated from fiscal year config)
- [ ] Period locking — prevent posting into a closed period

### 1.2 Users & Roles (flat — no departments)

- [ ] User entity + Better Auth session wiring
- [ ] Company membership (a user belongs to one or more companies — supports the "sole dev with 2 businesses" case cheaply)
- [ ] Flat roles: `Owner`, `Admin`, `Accountant`, `Staff` — hardcode the role set for MVP, don't build a role editor UI yet
- [ ] `lib/permissions/`: simple `canX(user, company)` checks based on role, no scoping/limits

### 1.3 Numbering & Settings

- [ ] Numbering sequences: invoice #, journal entry #, SKU/product code — configurable prefix, auto-increment
- [ ] Tax rate configuration (flat list: name, rate % — no jurisdiction engine yet)

---

## Phase 2 — Accounting Core

This is the backbone everything else posts into.

- [ ] Chart of Accounts (seed a sensible default CoA per new company so users don't start blank — asset/liability/equity/revenue/expense)
- [ ] Journal Entry service — immutable, double-entry enforced in the Service layer, always tied to a fiscal period
- [ ] General Ledger queries (balance by account, balance by period)
- [ ] Manual journal entry UI (covers ad-hoc expenses, owner's equity, adjustments — this is your AP substitute for MVP)
- [ ] Period close: lock a fiscal period, block new/edited entries in it
- [ ] Bank/cash account as a special account type (simplifies "record a payment" later — no full bank reconciliation yet)

---

## Phase 3 — Inventory Core

Keep it simple: single default warehouse is fine for MVP unless multi-warehouse is a stated requirement.

- [ ] Product/Item master (SKU, name, unit of measure, sell price, cost price, tax rate)
- [ ] Single default warehouse per company (multi-warehouse = fast-follow, not MVP)
- [ ] Stock Ledger (insert-only, as designed originally — do NOT cut this corner, it's cheap to build right and expensive to retrofit)
- [ ] Stock adjustment (manual +/- with reason, for initial stock load and corrections)
- [ ] Costing method: **weighted average** (simplest to implement correctly; FIFO can come later if needed for margin accuracy)
- [ ] Low-stock indicator (simple threshold field, no alert engine yet)

---

## Phase 4 — Sales & Invoicing

The money-making loop.

- [ ] Customer master (name, contact, tax ID if relevant, payment terms)
- [ ] Quote → Sales Order → Invoice (or skip straight to Invoice if quotes aren't core to your users — confirm before building the extra step)
- [ ] Invoice Service, orchestrating:
  - validate customer
  - validate products & stock availability
  - calculate tax (using flat tax rates from 1.3)
  - reserve/deduct stock (Stock Ledger entry)
  - create invoice
  - post journal entry (Dr Accounts Receivable / Cr Revenue + Cr Tax Payable)
- [ ] Invoice PDF generation (background job)
- [ ] Email invoice to customer (background job)
- [ ] Record payment against invoice → posts journal entry (Dr Cash/Bank / Cr Accounts Receivable), updates invoice status (unpaid/partial/paid)
- [ ] Credit note / invoice void (minimal version — full reverses the journal + restocks)

---

## Phase 5 — Reporting (fixed set, not a builder)

- [ ] Profit & Loss (by fiscal period, using GL data)
- [ ] Balance Sheet
- [ ] AR Aging (outstanding invoices by customer, by age bucket)
- [ ] Stock valuation report (on-hand qty × weighted avg cost)
- [ ] Export each to PDF/CSV

---

## Phase 6 — Hardening (minimal, not the full v2 list)

- [ ] Transaction rollback test on Invoice Service (kill mid-flow, confirm no partial stock/journal/invoice)
- [ ] Permission tests: Staff can't post journal entries, can't see other companies' data (tenant isolation is the one you cannot get wrong)
- [ ] Basic rate limiting / auth hardening before public launch

---

## Suggested Build Order

```
Phase 0 (Foundation + Stripe billing)
   ↓
Phase 1 (Company + fiscal periods + flat users/roles)
   ↓
Phase 2 (Accounting core: CoA + Journal + GL + period close)
   ↓
Phase 3 (Inventory core: Stock Ledger)
   ↓
Phase 4 (Sales: Invoice Service ties Accounting + Inventory together — this is your demo-able MVP)
   ↓
Phase 5 (Reporting — this is what makes people trust the numbers enough to pay)
   ↓
Phase 6 (Hardening before public launch)
```

**Phase 4 is your MVP milestone** — once quote/invoice → stock movement → journal posting → payment works end to end, you have something demoable and sellable. Reporting (Phase 5) is what turns "demoable" into "someone will pay monthly for this," since a bookkeeping tool nobody trusts to produce a correct P&L isn't sellable.

---

## Decisions Still Worth Locking Down

1. **Quotes/Orders as a separate step, or invoice directly?** Cuts real scope out of Phase 4 if your users don't need quotes.
2. **Single warehouse assumption** — confirm this holds for your target users before building multi-warehouse "just in case."
3. **Weighted average costing** — fine for MVP; revisit only if a specific customer segment needs FIFO for compliance/margin reasons.
4. **Fiscal period granularity** — monthly is standard; confirm if your target market needs quarterly-only or custom periods.
