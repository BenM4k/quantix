
-- ============================================================
-- Enable RLS
-- ============================================================


ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_feature ENABLE ROW LEVEL SECURITY;

ALTER TABLE fiscal_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rate ENABLE ROW LEVEL SECURITY;


ALTER TABLE ledger_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_account ENABLE ROW LEVEL SECURITY;


ALTER TABLE warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustment ENABLE ROW LEVEL SECURITY;


ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note ENABLE ROW LEVEL SECURITY;


ALTER TABLE department ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachment ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;



-- ============================================================
-- Tenant policy helper
-- ============================================================

CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(
        current_setting(
            'app.organization_id',
            true
        ),
        ''
    )::uuid;
$$;



-- ============================================================
-- Company
-- ============================================================


CREATE POLICY company_profile_tenant_policy
ON company_profile
USING (
    organization_id =
    current_organization_id()
);


CREATE POLICY company_feature_tenant_policy
ON company_feature
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY fiscal_year_tenant_policy
ON fiscal_year
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY fiscal_period_tenant_policy
ON fiscal_period
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY numbering_sequence_tenant_policy
ON numbering_sequence
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY tax_rate_tenant_policy
ON tax_rate
USING (
    organization_id =
    current_organization_id()
);



-- ============================================================
-- Accounting
-- ============================================================


CREATE POLICY ledger_account_tenant_policy
ON ledger_account
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY journal_entry_tenant_policy
ON journal_entry
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY journal_entry_line_tenant_policy
ON journal_entry_line
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY bank_account_tenant_policy
ON bank_account
USING (
    organization_id =
    current_organization_id()
);



-- ============================================================
-- Inventory
-- ============================================================


CREATE POLICY warehouse_tenant_policy
ON warehouse
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY product_tenant_policy
ON product
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY stock_ledger_tenant_policy
ON stock_ledger_entry
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY stock_adjustment_tenant_policy
ON stock_adjustment
USING (
    organization_id =
    current_organization_id()
);



-- ============================================================
-- Sales
-- ============================================================


CREATE POLICY customer_tenant_policy
ON customer
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY invoice_tenant_policy
ON invoice
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY invoice_line_tenant_policy
ON invoice_line
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY payment_tenant_policy
ON payment
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY credit_note_tenant_policy
ON credit_note
USING (
    organization_id =
    current_organization_id()
);



-- ============================================================
-- Future
-- ============================================================


CREATE POLICY department_tenant_policy
ON department
USING (
    organization_id =
    current_organization_id()
);



CREATE POLICY attachment_tenant_policy
ON attachment
USING (
    organization_id =
    current_organization_id()
);



-- ============================================================
-- Audit
-- ============================================================


CREATE POLICY audit_log_tenant_policy
ON audit_log
USING (
    organization_id =
    current_organization_id()
);