"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Customer } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { customerSchema, type CustomerInput } from "@/lib/schemas/customer";
import { useCustomerManager } from "./hooks/use-customer-manager";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2, Loader2, Building, Mail, Phone, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

interface CustomersClientProps {
  companyId: string;
  customers: Customer[];
  totalCustomers: number;
  userRole: string;
}

export function CustomersClient({
  companyId,
  customers,
  totalCustomers,
  userRole,
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
    closeCustomerSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteCustomer,
  } = useCustomerManager(companyId, customers);

  const canCreate = canX(userRole, { id: companyId }, "customer:create");
  const canUpdate = canX(userRole, { id: companyId }, "customer:update");
  const canDelete = canX(userRole, { id: companyId }, "customer:delete");

  // Create Form
  const createForm = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      paymentTermsDays: 0,
      active: true,
    },
  });

  // Edit Form
  const editForm = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      paymentTermsDays: 0,
      active: true,
    },
  });

  // Sync sheet form with selected customer
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

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Customer Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.taxId ? `Tax ID: ${row.original.taxId}` : "No Tax ID"}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>{row.original.email || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{row.original.phone || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "paymentTermsDays",
      header: "Payment Terms",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/40">
          <Clock className="h-3 w-3" />
          Net {row.original.paymentTermsDays} Days
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Master"
        description="Manage your customer directory, contact details, tax identifiers, and credit/payment terms."
        icon={Building}
        actions={
          canCreate ? (
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Customer</span>
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={customers}
        total={totalCustomers}
        onRowClick={openCustomerSheet}
        searchPlaceholder="Search customers by name, email, or phone..."
      />

      {/* Create Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-surface-elevated border border-border/80 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Create Customer Master</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cust-name">Customer / Company Name *</FieldLabel>
                  <Input
                    id="cust-name"
                    {...createForm.register("name")}
                    placeholder="Acme Global Logistics"
                  />
                  {createForm.formState.errors.name && (
                    <FieldError>{createForm.formState.errors.name.message}</FieldError>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="cust-email">Email</FieldLabel>
                    <Input
                      id="cust-email"
                      type="email"
                      {...createForm.register("email")}
                      placeholder="billing@acme.com"
                    />
                    {createForm.formState.errors.email && (
                      <FieldError>{createForm.formState.errors.email.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="cust-phone">Phone</FieldLabel>
                    <Input
                      id="cust-phone"
                      {...createForm.register("phone")}
                      placeholder="+1 (555) 019-2834"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="cust-tax">Tax ID / VAT Registration</FieldLabel>
                    <Input
                      id="cust-tax"
                      {...createForm.register("taxId")}
                      placeholder="US982341092"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="cust-terms">Payment Terms (Days) *</FieldLabel>
                    <Input
                      id="cust-terms"
                      type="number"
                      {...createForm.register("paymentTermsDays", { valueAsNumber: true })}
                      placeholder="30"
                    />
                    {createForm.formState.errors.paymentTermsDays && (
                      <FieldError>{createForm.formState.errors.paymentTermsDays.message}</FieldError>
                    )}
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Detail Sheet */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.taxId ? `Tax ID: ${selectedCustomer.taxId}` : "Customer Details"}
                  </p>
                </div>
                <button
                  onClick={closeCustomerSheet}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {successMessage}
                </div>
              )}

              <form id="edit-customer-form" onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-cust-name">Customer Name</FieldLabel>
                    <Input
                      id="edit-cust-name"
                      disabled={!canUpdate}
                      {...editForm.register("name")}
                    />
                    {editForm.formState.errors.name && (
                      <FieldError>{editForm.formState.errors.name.message}</FieldError>
                    )}
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-cust-email">Email</FieldLabel>
                      <Input
                        id="edit-cust-email"
                        type="email"
                        disabled={!canUpdate}
                        {...editForm.register("email")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-cust-phone">Phone</FieldLabel>
                      <Input
                        id="edit-cust-phone"
                        disabled={!canUpdate}
                        {...editForm.register("phone")}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-cust-tax">Tax ID</FieldLabel>
                      <Input
                        id="edit-cust-tax"
                        disabled={!canUpdate}
                        {...editForm.register("taxId")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-cust-terms">Payment Terms (Days)</FieldLabel>
                      <Input
                        id="edit-cust-terms"
                        type="number"
                        disabled={!canUpdate}
                        {...editForm.register("paymentTermsDays", { valueAsNumber: true })}
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </form>
            </div>

            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
              {canDelete ? (
                confirmDeleteId === selectedCustomer.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive font-medium">Confirm?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                      disabled={isPending}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteId(selectedCustomer.id)}
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete Customer
                  </Button>
                )
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={closeCustomerSheet}>
                  Close
                </Button>
                {canUpdate && (
                  <Button form="edit-customer-form" type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
