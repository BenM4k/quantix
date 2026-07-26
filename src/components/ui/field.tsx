"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-4 has-[>[data-slot=radio-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-2 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-6 data-[slot=checkbox-group]:gap-4 *:data-[slot=field-group]:gap-6",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

/**
 * FieldLabel dictionary providing contextual descriptions for field names.
 */
const FIELD_TOOLTIPS: Record<string, string> = {
  // Common / Master Data
  "Name": "The official display name of this record.",
  "Warehouse Name *": "Unique descriptive identifier for this warehouse location.",
  "Address": "Physical address or location coordinates of the warehouse facility.",
  "User Email Address *": "Primary email address used for login and notifications.",
  "Assign Role *": "Determines system permissions and access scope for this user.",
  "Organization Role": "Role assignment governing operational capabilities within this organization.",
  "Base Currency": "Primary accounting currency used for default transaction posting and valuation.",
  "Date Format": "Preferred date display format across screens and exported reports.",
  "Fiscal Year Start Month": "Beginning month for company annual financial reporting periods.",
  "Fiscal Year Start Day (1-28)": "Starting day of the month for annual financial period anchor.",

  // Products
  "SKU *": "Stock Keeping Unit — unique alphanumeric code identifying this item.",
  "SKU": "Stock Keeping Unit — unique alphanumeric code identifying this item.",
  "Name *": "Descriptive name of the product or item.",
  "UOM *": "Unit of Measure (e.g. PCS, KG, LTR, BOX) used for inventory tracking.",
  "UOM": "Unit of Measure (e.g. PCS, KG, LTR, BOX) used for inventory tracking.",
  "Sell Price ($) *": "Default selling price charged to customers before taxes.",
  "Sell Price ($)": "Default selling price charged to customers before taxes.",
  "Cost Price ($) *": "Unit cost used for inventory valuation and cost of goods sold calculations.",
  "Cost Price ($)": "Unit cost used for inventory valuation and cost of goods sold calculations.",
  "Low-Stock Alert Threshold (Optional)": "Minimum stock level triggering low-stock warning indicators.",
  "Low-Stock Alert Threshold": "Minimum stock level triggering low-stock warning indicators.",

  // Customers
  "Customer / Company Name *": "Legal business or individual customer name for invoicing.",
  "Customer Name": "Legal business or individual customer name for invoicing.",
  "Email": "Contact email address for sending quotes, orders, and invoices.",
  "Phone": "Primary telephone number for business contact.",
  "Tax ID / VAT Registration": "Tax registration number displayed on formal tax invoices.",
  "Tax ID": "Tax registration number displayed on formal tax invoices.",
  "Payment Terms (Days) *": "Allowed payment window in days from invoice issuance date.",
  "Payment Terms (Days)": "Allowed payment window in days from invoice issuance date.",

  // Transactions / Accounting / Sales
  "Customer *": "Selected customer associated with this sales document.",
  "Quote Date *": "Issue date of the quote.",
  "Expiry Date": "Validity date limit after which this quote expires.",
  "Order Date *": "Date on which the sales order was formally placed.",
  "Payment Amount ($) *": "Monetary amount being collected against this invoice balance.",
  "Payment Method *": "Payment instrument (Bank Transfer, Credit Card, Cash, Check).",
  "Reason for Void *": "Required audit log explanation for voiding this invoice.",
  "Unit Price ($) *": "Agreed unit price for this order item.",
  "Qty *": "Quantity of item specified.",
  "Description": "Line item memo or specific customer instructions.",
  "Notes": "Internal comments or customer-facing terms and conditions.",
  "Account Code": "Unique numerical code in the Chart of Accounts ledger.",
  "Account Name": "Title of the ledger account.",
  "Account Type": "Accounting classification (Asset, Liability, Equity, Revenue, Expense).",
  "Debit ($)": "Debit entry amount to be posted to this account.",
  "Credit ($)": "Credit entry amount to be posted to this account.",
};

function getFieldTooltipText(children: React.ReactNode, id?: string): string {
  let labelText = "";
  if (typeof children === "string") {
    labelText = children.trim();
  } else if (Array.isArray(children)) {
    labelText = children
      .map((child) => (typeof child === "string" ? child : ""))
      .join("")
      .trim();
  }

  if (labelText && FIELD_TOOLTIPS[labelText]) {
    return FIELD_TOOLTIPS[labelText];
  }

  const cleanLabel = labelText.replace(/\*/g, "").trim();
  if (cleanLabel && FIELD_TOOLTIPS[cleanLabel]) {
    return FIELD_TOOLTIPS[cleanLabel];
  }

  // Fallback description based on label text or id
  if (cleanLabel) {
    return `Specifies the ${cleanLabel.toLowerCase()} for this record.`;
  }
  if (id) {
    return `Field value for ${id.replace(/[-_]/g, " ")}.`;
  }
  return "Input field parameter for this form.";
}

function FieldLabel({
  className,
  children,
  id,
  htmlFor,
  ...props
}: React.ComponentProps<typeof Label>) {
  const tooltipText = getFieldTooltipText(children, htmlFor || id);

  return (
    <div className="flex items-center gap-1.5 w-fit mb-2">
      <Label
        data-slot="field-label"
        htmlFor={htmlFor}
        id={id}
        className={cn(
          "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
          "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="text-muted-foreground/70 hover:text-foreground transition-colors inline-flex items-center justify-center p-0.5 rounded-full focus:outline-hidden"
          tabIndex={-1}
          aria-label="Field information"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
