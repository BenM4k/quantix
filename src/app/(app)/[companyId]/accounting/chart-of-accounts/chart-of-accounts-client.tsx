"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LedgerAccount } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/schemas/accounting";
import { useAccountManager } from "./hooks/use-account-manager";
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
  Loader2,
  BookOpen,
  AlertCircle,
  Search,
  ChevronDown,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

interface ChartOfAccountsClientProps {
  companyId: string;
  accounts: LedgerAccount[];
  totalAccounts: number;
  userRole: string;
  hasActivityMap: Record<string, boolean>;
}

function AccountDetailPanel({
  account,
  companyId,
  userRole,
  isLocked,
  isPending,
  editForm,
  handleEditSubmit,
  successMessage,
  errorMessage,
  canUpdate,
}: {
  account: LedgerAccount | null;
  companyId: string;
  userRole: string;
  isLocked: boolean;
  isPending: boolean;
  editForm: ReturnType<typeof useForm<UpdateAccountInput>>;
  handleEditSubmit: (data: UpdateAccountInput) => void;
  successMessage: string | null;
  errorMessage: string | null;
  canUpdate: boolean;
}) {
  if (!account) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Select an account"
        description="Click any ledger account on the left to inspect normal balances and accounting rules."
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
              {account.isBankAccount ? (
                <Landmark className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white truncate">
                {account.name}
              </h2>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                Code: {account.code} · Normal:{" "}
                {account.normalBalance.toUpperCase()}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0",
              account.isActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/10 text-zinc-400 border-white/10",
            )}
          >
            {account.isActive ? "Active Account" : "Inactive"}
          </span>
        </div>

        {/* Metric Cards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Accounting Type
            </span>
            <p className="text-lg font-black text-foreground mt-1 capitalize font-mono">
              {account.type}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Normal Balance Rule
            </span>
            <p className="text-lg font-black text-foreground mt-1 capitalize font-mono">
              {account.normalBalance}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Classification
            </span>
            <p className="text-lg font-black text-foreground mt-1 font-mono">
              {account.isBankAccount ? "Bank Depository" : "General Ledger"}
            </p>
          </div>
        </div>

        {isLocked && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
            <span>
              This account contains posted transactions. Core debit/credit rules
              are locked to enforce statutory ledger integrity.
            </span>
          </div>
        )}

        {/* Edit Form */}
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
              id="edit-acc-form"
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Account Code *
                  </label>
                  <input
                    {...editForm.register("code")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Account Name *
                  </label>
                  <input
                    {...editForm.register("name")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs">
                <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...editForm.register("isBankAccount")}
                    className="rounded-md border-border bg-background/80 accent-primary h-4 w-4"
                  />
                  <span>Is Bank Account</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...editForm.register("isActive")}
                    className="rounded-md border-border bg-background/80 accent-primary h-4 w-4"
                  />
                  <span>Active in Chart</span>
                </label>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
          <ShieldCheck className="h-4 w-4 text-foreground/80" />
          <span>Double-entry compliant</span>
        </div>

        {canUpdate && (
          <button
            form="edit-acc-form"
            type="submit"
            disabled={isPending}
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            <span>Save Account</span>
          </button>
        )}
      </div>
    </div>
  );
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
    handleCreateSubmit,
    handleEditSubmit,
  } = useAccountManager(companyId, accounts);

  const canCreate = canX(userRole, { id: companyId }, "account:create");
  const canUpdate = canX(userRole, { id: companyId }, "account:edit");

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

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

  const filtered = accounts.filter((a) => {
    const matches =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (activeTab === "asset") return a.type === "asset";
    if (activeTab === "liability") return a.type === "liability";
    if (activeTab === "revenue") return a.type === "revenue";
    if (activeTab === "expense") return a.type === "expense";
    return true;
  });

  const isSelectedAccountLocked = selectedAccount
    ? !!hasActivityMap[selectedAccount.id]
    : false;

  return (
    <>
      <SplitPanelShell
        title="Chart of Accounts"
        subtitle={`${totalAccounts} total ledger accounts · debit/credit balance definitions`}
        headerAction={
          canCreate && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Account</span>
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
                <span>All classifications</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code or name..."
                  className="pl-9 pr-4 h-9 text-xs rounded-full border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-56"
                />
              </div>
            </div>
          </>
        }
        listTabs={
          <>
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              All Accounts
            </button>
            <button
              onClick={() => setActiveTab("asset")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "asset"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab("liability")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "liability"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Liabilities
            </button>
            <button
              onClick={() => setActiveTab("revenue")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "revenue"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "expense"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Expenses
            </button>
          </>
        }
        listTitle="General Ledger Accounts"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={BookOpen} title="No accounts found" />
          ) : (
            filtered.map((acc) => (
              <ListRow
                key={acc.id}
                id={acc.id}
                primary={acc.name}
                secondary={`Code: ${acc.code}`}
                meta={`Normal: ${acc.normalBalance.toUpperCase()}`}
                amount={acc.isBankAccount ? "Bank" : undefined}
                selected={selectedAccount?.id === acc.id}
                onClick={() => openAccountSheet(acc)}
                badge={
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize",
                      acc.type === "asset"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : acc.type === "liability"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : acc.type === "revenue"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30",
                    )}
                  >
                    {acc.type}
                  </span>
                }
              />
            ))
          )
        }
        detailChildren={
          <AccountDetailPanel
            account={selectedAccount}
            companyId={companyId}
            userRole={userRole}
            isLocked={isSelectedAccountLocked}
            isPending={isPending}
            editForm={editForm}
            handleEditSubmit={handleEditSubmit}
            successMessage={successMessage}
            errorMessage={errorMessage}
            canUpdate={canUpdate}
          />
        }
      />

      {/* Create Account Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-xl font-bold text-foreground">
                Create Ledger Account
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
                    <FieldLabel>Account Code *</FieldLabel>
                    <Input
                      {...createForm.register("code")}
                      placeholder="e.g. 1010"
                    />
                    {createForm.formState.errors.code && (
                      <FieldError>
                        {createForm.formState.errors.code.message}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Account Name *</FieldLabel>
                    <Input
                      {...createForm.register("name")}
                      placeholder="e.g. Operating Bank"
                    />
                    {createForm.formState.errors.name && (
                      <FieldError>
                        {createForm.formState.errors.name.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Account Type *</FieldLabel>
                    <select
                      {...createForm.register("type")}
                      className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel>Normal Balance</FieldLabel>
                    <Input
                      disabled
                      value={createForm.watch("normalBalance")}
                      className="capitalize"
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...createForm.register("isBankAccount")}
                      className="rounded-md border-border accent-primary h-4 w-4"
                    />
                    <span>Is Bank Account</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      {...createForm.register("isActive")}
                      className="rounded-md border-border accent-primary h-4 w-4"
                    />
                    <span>Active Account</span>
                  </label>
                </div>
              </FieldGroup>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
