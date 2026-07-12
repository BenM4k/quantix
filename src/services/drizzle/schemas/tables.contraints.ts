import { sql } from "drizzle-orm";

/**
 * PostgreSQL constraints that should be applied
 * after Drizzle migrations.
 *
 * These are kept separate because:
 *
 * - composite tenant FKs are verbose in Drizzle
 * - cross-table checks need SQL
 * - some constraints are easier to maintain manually
 */

/* ============================================================
 * Composite tenant foreign keys
 *
 * Prevent:
 *
 * organization A invoice
 * referencing
 * organization B customer
 *
 * ============================================================ */

/*
ALTER TABLE invoice
ADD CONSTRAINT invoice_customer_tenant_fk
FOREIGN KEY (
    organization_id,
    customer_id
)
REFERENCES customer(
    organization_id,
    id
);
*/

/*
ALTER TABLE invoice_line
ADD CONSTRAINT invoice_line_invoice_tenant_fk
FOREIGN KEY (
    organization_id,
    invoice_id
)
REFERENCES invoice(
    organization_id,
    id
);
*/

/*
ALTER TABLE invoice_line
ADD CONSTRAINT invoice_line_product_tenant_fk
FOREIGN KEY (
    organization_id,
    product_id
)
REFERENCES product(
    organization_id,
    id
);
*/

/*
ALTER TABLE journal_entry_line
ADD CONSTRAINT journal_line_entry_tenant_fk
FOREIGN KEY (
    organization_id,
    journal_entry_id
)
REFERENCES journal_entry(
    organization_id,
    id
);
*/

/*
ALTER TABLE journal_entry_line
ADD CONSTRAINT journal_line_account_tenant_fk
FOREIGN KEY (
    organization_id,
    ledger_account_id
)
REFERENCES ledger_account(
    organization_id,
    id
);
*/

/* ============================================================
 * Accounting constraints
 * ============================================================ */

/**
 * Debit/Credit lines:
 *
 * Valid:
 *
 * debit 100
 * credit 0
 *
 * OR
 *
 * debit 0
 * credit 100
 *
 * Invalid:
 *
 * debit 100
 * credit 100
 *
 * debit 0
 * credit 0
 */

export const journalDebitCreditConstraint = sql`
ALTER TABLE journal_entry_line
ADD CONSTRAINT journal_line_debit_credit_check
CHECK (
    debit >= 0
    AND credit >= 0
    AND NOT (
        debit > 0
        AND credit > 0
    )
    AND (
        debit > 0
        OR credit > 0
    )
);
`;

/* ============================================================
 * Stock constraints
 * ============================================================ */

/**
 * A stock movement must change inventory.
 */

export const stockMovementConstraint = sql`
ALTER TABLE stock_ledger_entry
ADD CONSTRAINT stock_quantity_delta_non_zero
CHECK (
    quantity_delta <> 0
);
`;

/**
 * Unit cost cannot be negative.
 */

export const stockCostConstraint = sql`
ALTER TABLE stock_ledger_entry
ADD CONSTRAINT stock_unit_cost_positive
CHECK (
    unit_cost >= 0
);
`;

/* ============================================================
 * Money validation
 * ============================================================ */

export const invoiceAmountConstraint = sql`
ALTER TABLE invoice
ADD CONSTRAINT invoice_total_non_negative
CHECK (
    subtotal >= 0
    AND tax_total >= 0
    AND total >= 0
);
`;

export const paymentAmountConstraint = sql`
ALTER TABLE payment
ADD CONSTRAINT payment_amount_positive
CHECK (
    amount > 0
);
`;

/* ============================================================
 * Fiscal validation
 * ============================================================ */

export const fiscalPeriodConstraint = sql`
ALTER TABLE fiscal_period
ADD CONSTRAINT fiscal_period_valid_dates
CHECK (
    end_date >= start_date
);
`;

export const fiscalYearConstraint = sql`
ALTER TABLE fiscal_year
ADD CONSTRAINT fiscal_year_valid_dates
CHECK (
    end_date >= start_date
);
`;
