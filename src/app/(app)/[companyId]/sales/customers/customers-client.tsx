"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Customer } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { customerSchema, type CustomerInput } from "@/lib/schemas/customer";
import { useCustomerManager } from "./hooks/use-customer-manager";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Trash2,
  Loader2,
  Building2,
  Mail,
  Phone,
  Users,
  UserCheck,
  Clock,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";
import type { CustomerKpis } from "@/services/module-kpis/module-kpis.service";

interface CustomersClientProps {
  companyId: string;
  customers: Customer[];
  totalCustomers: number;
  userRole: string;
  kpis: CustomerKpis;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function CustomerDetailPanel({
  customer,
  companyId,
  userRole,
  isPending,
  confirmDeleteId,
  setConfirmDeleteId,
  handleDelete,
  editForm,
  handleEditSubmit,
  successMessage,
  errorMessage,
  canUpdate,
  canDelete,
}: {
  customer: Customer | null;
  companyId: string;
  userRole: string;
  isPending: boolean;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleDelete: (id: string) => void;
  editForm: ReturnType<typeof useForm<CustomerInput>>;
  handleEditSubmit: (data: CustomerInput) => void;
  successMessage: string | null;
  errorMessage: string | null;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  if (!customer) {
    return (
      <EmptyState
        icon={Building2}
        title="Select a customer"
        description="Click any customer on the left to inspect terms and contact details."
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-6">
      {/* Top Header & Metadata */}
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-base shrink-0">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white truncate">
                {customer.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-400">
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0",
              customer.active
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/10 text-zinc-400 border-white/10",
            )}
          >
            {customer.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tax Identification", value: customer.taxId || "—" },
            {
              label: "Payment Terms",
              value: `Net ${customer.paymentTermsDays} Days`,
            },
            {
              label: "Customer Since",
              value: customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-primary/20 border border-primary/25 px-3.5 py-3"
            >
              <p className="text-[10px] text-foreground/70 uppercase tracking-wider font-semibold">
                {label}
              </p>
              <p className="text-sm font-bold text-foreground mt-1 truncate">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Edit Form Fields */}
        {canUpdate && (
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-2xl text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {successMessage}
              </div>
            )}
            <form
              id="edit-cust-form"
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Company Name
                  </label>
                  <input
                    {...editForm.register("name")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editForm.formState.errors.name && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block">
                      {editForm.formState.errors.name.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Billing Email
                  </label>
                  <input
                    {...editForm.register("email")}
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Phone Contact
                  </label>
                  <input
                    {...editForm.register("phone")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Tax / VAT ID
                  </label>
                  <input
                    {...editForm.register("taxId")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-3">
        {canDelete &&
          (confirmDeleteId === customer.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                Are you sure?
              </span>
              <button
                type="button"
                onClick={() => handleDelete(customer.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 rounded-full bg-primary/20 text-foreground text-xs font-semibold hover:bg-primary/30"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteId(customer.id)}
              className="h-10 px-4 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          ))}

        {canUpdate && (
          <button
            form="edit-cust-form"
            type="submit"
            disabled={isPending}
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 ml-auto"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            <span>Save Changes</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────
export function CustomersClient({
  companyId,
  customers,
  totalCustomers,
  userRole,
  kpis,
}: CustomersClientProps) {
  const {
    isCreateOpen,
    setIsCreateOpen,
    selectedCustomer,
    errorMessage,
    successMessage,
    isPending,
    confirmDeleteId,
    setConfirmDeleteId,
    openCreateDialog,
    openCustomerSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteCustomer,
  } = useCustomerManager(companyId, customers);

  const canCreate = canX(userRole, { id: companyId }, "customer:create");
  const canUpdate = canX(userRole, { id: companyId }, "customer:update");
  const canDelete = canX(userRole, { id: companyId }, "customer:delete");

  const createForm = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      paymentTermsDays: 30,
      active: true,
    },
  });
  const editForm = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      paymentTermsDays: 30,
      active: true,
    },
  });

  React.useEffect(() => {
    if (selectedCustomer) {
      editForm.reset({
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        taxId: selectedCustomer.taxId || "",
        paymentTermsDays: selectedCustomer.paymentTermsDays,
        active: selectedCustomer.active,
      });
    }
  }, [selectedCustomer, editForm]);

  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  const filtered = customers.filter((c) => {
    const matches =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (activeFilter === "active") return c.active;
    if (activeFilter === "inactive") return !c.active;
    return true;
  });

  const activeCount = customers.filter((c) => c.active).length;

  return (
    <>
      <SplitPanelShell
        title="Customers Directory"
        subtitle={`${totalCustomers} total · manage customer portfolio and billing parameters`}
        headerAction={
          canCreate && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Customer</span>
            </button>
          )
        }
        filterToolbar={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background font-bold text-xs shadow-xs">
                <span>Active filters</span>
                <span className="h-4 w-4 rounded-full bg-background text-foreground text-[10px] flex items-center justify-center font-bold">
                  {search ? 1 : 0}
                </span>
              </span>

              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/80 bg-card text-foreground font-semibold hover:bg-muted transition-colors">
                <span>All customer accounts</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="pl-9 pr-4 h-9 text-xs rounded-full border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-56"
                />
              </div>
            </div>
          </>
        }
        listTabs={
          <>
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              All Customers
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeFilter === "active"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Active</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  activeFilter === "active"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter("inactive")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeFilter === "inactive"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Inactive
            </button>
          </>
        }
        listTitle="Customer Accounts"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={Building2} title="No customers found" />
          ) : (
            filtered.map((c) => (
              <ListRow
                key={c.id}
                id={c.id}
                primary={c.name}
                secondary={c.email || c.phone || "No direct contact"}
                meta={`Net ${c.paymentTermsDays}d`}
                selected={selectedCustomer?.id === c.id}
                onClick={() => openCustomerSheet(c)}
                badge={
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      c.active
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/10 text-zinc-400 border-white/10",
                    )}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                }
              />
            ))
          )
        }
        detailChildren={
          <CustomerDetailPanel
            customer={selectedCustomer}
            companyId={companyId}
            userRole={userRole}
            isPending={isPending}
            confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId}
            handleDelete={handleDeleteCustomer}
            editForm={editForm}
            handleEditSubmit={handleEditSubmit}
            successMessage={successMessage}
            errorMessage={errorMessage}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        }
      />

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-xl font-bold text-foreground">
                Create Customer Account
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Company Name *</FieldLabel>
                    <Input
                      {...createForm.register("name")}
                      placeholder="Acme Corp."
                    />
                    {createForm.formState.errors.name && (
                      <FieldError>
                        {createForm.formState.errors.name.message}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Billing Email</FieldLabel>
                    <Input
                      {...createForm.register("email")}
                      type="email"
                      placeholder="billing@acme.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input
                      {...createForm.register("phone")}
                      placeholder="+1 555 0199"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Tax ID / VAT</FieldLabel>
                    <Input
                      {...createForm.register("taxId")}
                      placeholder="US-987654"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Default Payment Terms (Days)</FieldLabel>
                  <Input
                    type="number"
                    {...createForm.register("paymentTermsDays", {
                      valueAsNumber: true,
                    })}
                    defaultValue={30}
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-primary-foreground font-bold"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Create Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
