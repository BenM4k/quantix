"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { LedgerAccount } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/schemas/accounting";
import { useAccountManager } from "./hooks/use-account-manager";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, BookOpen, CheckCircle, AlertCircle } from "lucide-react";

interface ChartOfAccountsClientProps {
  companyId: string;
  accounts: LedgerAccount[];
  totalAccounts: number;
  userRole: string;
  hasActivityMap: Record<string, boolean>;
}

export function ChartOfAccountsClient({
  companyId,
  accounts,
  totalAccounts,
  userRole,
  hasActivityMap,
}: ChartOfAccountsClientProps) {
  const {
    isCreateOpen,
    setIsCreateOpen,
    selectedAccount,
    errorMessage,
    successMessage,
    isPending,
    openCreateDialog,
    openAccountSheet,
    closeAccountSheet,
    handleCreateSubmit,
    handleEditSubmit,
  } = useAccountManager(companyId, accounts);

  const canCreate = canX(userRole, { id: companyId }, "account:create");
  const canUpdate = canX(userRole, { id: companyId }, "account:edit");

  // Create Form
  const createForm = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "asset",
      normalBalance: "debit",
      parentAccountId: null,
      isBankAccount: false,
      isActive: true,
    },
  });

  // Automatically update normalBalance when type changes in Create Form
  const watchedType = createForm.watch("type");
  React.useEffect(() => {
    if (watchedType === "asset" || watchedType === "expense") {
      createForm.setValue("normalBalance", "debit");
    } else if (watchedType === "liability" || watchedType === "equity" || watchedType === "revenue") {
      createForm.setValue("normalBalance", "credit");
    }
  }, [watchedType, createForm]);

  // Edit Form
  const editForm = useForm<UpdateAccountInput>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "asset",
      normalBalance: "debit",
      parentAccountId: null,
      isBankAccount: false,
      isActive: true,
    },
  });

  // Sync sheet form with selected account
  React.useEffect(() => {
    if (selectedAccount) {
      editForm.reset({
        code: selectedAccount.code,
        name: selectedAccount.name,
        type: selectedAccount.type,
        normalBalance: selectedAccount.normalBalance,
        parentAccountId: selectedAccount.parentAccountId || null,
        isBankAccount: selectedAccount.isBankAccount,
        isActive: selectedAccount.isActive,
      });
    }
  }, [selectedAccount, editForm]);

  const isSelectedAccountLocked = selectedAccount ? !!hasActivityMap[selectedAccount.id] : false;

  const columns: ColumnDef<LedgerAccount>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-foreground">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{row.original.name}</span>
          {row.original.isBankAccount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Bank
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-secondary text-secondary-foreground border border-border/40">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "normalBalance",
      header: "Normal Balance",
      cell: ({ row }) => (
        <span className="text-xs font-mono capitalize text-muted-foreground">
          {row.original.normalBalance}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            row.original.isActive
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border/40"
          }`}
        >
          {row.original.isActive ? <CheckCircle className="h-3 w-3" /> : null}
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        {canCreate && (
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Account</span>
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        total={totalAccounts}
        onRowClick={openAccountSheet}
        searchPlaceholder="Search accounts by code or name..."
      />

      {/* Create Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold text-foreground">Create Ledger Account</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
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

            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="create-code">Account Code *</FieldLabel>
                    <Input
                      id="create-code"
                      {...createForm.register("code")}
                      placeholder="1010"
                    />
                    {createForm.formState.errors.code && (
                      <FieldError>{createForm.formState.errors.code.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="create-name">Account Name *</FieldLabel>
                    <Input
                      id="create-name"
                      {...createForm.register("name")}
                      placeholder="Main Operating Cash"
                    />
                    {createForm.formState.errors.name && (
                      <FieldError>{createForm.formState.errors.name.message}</FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="create-acc-type">Account Type *</FieldLabel>
                    <select
                      id="create-acc-type"
                      {...createForm.register("type")}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="create-normal">Normal Balance *</FieldLabel>
                    <select
                      id="create-normal"
                      {...createForm.register("normalBalance")}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </Field>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...createForm.register("isBankAccount")}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Is Bank Account</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...createForm.register("isActive")}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Active Account</span>
                  </label>
                </div>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Details Sheet */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedAccount.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">Code: {selectedAccount.code}</p>
                </div>
                <button
                  onClick={closeAccountSheet}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isSelectedAccountLocked && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    This account has posted journal entries. Account Type and Normal Balance are locked to preserve double-entry accounting integrity.
                  </span>
                </div>
              )}

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

              <form id="edit-account-form" onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-code">Code</FieldLabel>
                      <Input
                        id="edit-code"
                        disabled={!canUpdate}
                        {...editForm.register("code")}
                      />
                      {editForm.formState.errors.code && (
                        <FieldError>{editForm.formState.errors.code.message}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-name">Account Name</FieldLabel>
                      <Input
                        id="edit-name"
                        disabled={!canUpdate}
                        {...editForm.register("name")}
                      />
                      {editForm.formState.errors.name && (
                        <FieldError>{editForm.formState.errors.name.message}</FieldError>
                      )}
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-type">Type</FieldLabel>
                      <select
                        id="edit-type"
                        disabled={!canUpdate || isSelectedAccountLocked}
                        {...editForm.register("type")}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expense</option>
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-normal">Normal Balance</FieldLabel>
                      <select
                        id="edit-normal"
                        disabled={!canUpdate || isSelectedAccountLocked}
                        {...editForm.register("normalBalance")}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>
                    </Field>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canUpdate}
                        {...editForm.register("isBankAccount")}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Is Bank Account</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canUpdate}
                        {...editForm.register("isActive")}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Active Account</span>
                    </label>
                  </div>
                </FieldGroup>
              </form>
            </div>

            <div className="pt-6 border-t border-border/40 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={closeAccountSheet}>
                Close
              </Button>
              {canUpdate && (
                <Button form="edit-account-form" type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
