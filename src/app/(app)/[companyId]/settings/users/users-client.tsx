"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberWithUser } from "@/dal/user/queries";
import { canX } from "@/lib/permissions";
import {
  inviteUserSchema,
  updateUserProfileSchema,
  type InviteUserInput,
  type UpdateUserProfileInput,
} from "@/lib/schemas/user";
import { useUserManager } from "./hooks/use-user-manager";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  Users,
  Trash2,
  X,
  Mail,
  Loader2,
  Send,
  Check,
  Search,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Invitation } from "@/services/drizzle/schemas";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

interface UsersClientProps {
  companyId: string;
  members: MemberWithUser[];
  totalMembers: number;
  invitations: Invitation[];
  userRole: string;
}

function UserDetailPanel({
  member,
  companyId,
  userRole,
  isPending,
  sheetRole,
  setSheetRole,
  sheetMessage,
  confirmRemoveId,
  setConfirmRemoveId,
  handleRemoveMember,
  profileForm,
  handleProfileSubmit,
  canUpdateRole,
  canRemove,
}: {
  member: MemberWithUser | null;
  companyId: string;
  userRole: string;
  isPending: boolean;
  sheetRole: string;
  setSheetRole: (role: string) => void;
  sheetMessage: { type: "success" | "error"; text: string } | null;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
  handleRemoveMember: (id: string) => void;
  profileForm: ReturnType<typeof useForm<UpdateUserProfileInput>>;
  handleProfileSubmit: (
    data: UpdateUserProfileInput,
    canUpdateRole: boolean,
  ) => void;
  canUpdateRole: boolean;
  canRemove: boolean;
}) {
  if (!member) {
    return (
      <EmptyState
        icon={Users}
        title="Select a team member"
        description="Click any member on the left to inspect organization permissions and edit profile credentials."
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-primary/25">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-primary/25 border border-primary/30 flex items-center justify-center font-black text-foreground text-sm shrink-0 overflow-hidden">
              {member.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.user.image}
                  alt={member.user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.user.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-foreground truncate">
                {member.user.name}
              </h2>
              <p className="text-xs text-foreground/80 mt-0.5">
                {member.user.email}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 capitalize",
              member.role === "owner"
                ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
                : member.role === "admin"
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30"
                  : "bg-primary/20 text-foreground border-primary/30",
            )}
          >
            {member.role}
          </span>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Joined Organization
            </span>
            <p className="text-sm font-bold text-foreground mt-1">
              {new Date(member.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Access Tier
            </span>
            <p className="text-sm font-bold text-foreground mt-1 capitalize">
              {member.role} Level
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          {sheetMessage && (
            <div
              className={cn(
                "p-3 rounded-2xl text-xs border",
                sheetMessage.type === "success"
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
              )}
            >
              {sheetMessage.text}
            </div>
          )}

          <form
            id="edit-member-form"
            onSubmit={profileForm.handleSubmit((data) =>
              handleProfileSubmit(data, canUpdateRole),
            )}
            className="space-y-3"
          >
            <div>
              <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                Display Name
              </label>
              <input
                {...profileForm.register("name")}
                className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                Organization Role
              </label>
              <select
                disabled={!canUpdateRole}
                value={sheetRole}
                onChange={(e) => setSheetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-3">
        {canRemove &&
          (confirmRemoveId === member.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                Remove user?
              </span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemoveId(null)}
                className="px-3 py-2 rounded-full bg-primary/20 text-foreground text-xs font-semibold hover:bg-primary/30"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemoveId(member.id)}
              className="h-10 px-4 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove User</span>
            </button>
          ))}

        <button
          form="edit-member-form"
          type="submit"
          disabled={isPending}
          className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 ml-auto"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}

export function UsersClient({
  companyId,
  members,
  totalMembers,
  invitations,
  userRole,
}: UsersClientProps) {
  const {
    activeTab,
    isInviteOpen,
    setIsInviteOpen,
    inviteError,
    isInvitePending,
    selectedMember,
    isSheetPending,
    sheetRole,
    setSheetRole,
    sheetMessage,
    confirmRemoveId,
    setConfirmRemoveId,
    openMemberSheet,
    handleInviteSubmit,
    handleProfileSubmit,
    handleRemoveMember,
    handleRevokeInvite,
    handleResendInvite,
  } = useUserManager(companyId, members);

  const canInvite = canX(userRole, { id: companyId }, "user:invite");
  const canUpdateRole = canX(userRole, { id: companyId }, "user:update-role");
  const canRemove = canX(userRole, { id: companyId }, "user:remove");

  const [search, setSearch] = React.useState("");
  const [listFilter, setListFilter] = React.useState<string>("all");

  const inviteForm = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "staff",
    },
  });

  const profileForm = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      memberId: "",
      name: "",
      imageUrl: null,
    },
  });

  React.useEffect(() => {
    if (selectedMember) {
      profileForm.reset({
        memberId: selectedMember.id,
        name: selectedMember.user.name,
        imageUrl: selectedMember.user.image,
      });
    }
  }, [selectedMember, profileForm]);

  const filtered = members.filter((m) => {
    const matches =
      !search ||
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (listFilter === "admin") return m.role === "admin" || m.role === "owner";
    if (listFilter === "staff") return m.role === "staff";
    return true;
  });

  return (
    <>
      <SplitPanelShell
        title="Users & Team Access"
        subtitle={`${totalMembers} active team members · access roles and membership`}
        headerAction={
          canInvite && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
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
                <span>All roles</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user or email..."
                  className="pl-9 pr-4 h-9 text-xs rounded-full border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-56"
                />
              </div>
            </div>
          </>
        }
        listTabs={
          <>
            <button
              onClick={() => setListFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                listFilter === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              All Members
            </button>
            <button
              onClick={() => setListFilter("admin")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                listFilter === "admin"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Admins & Owners
            </button>
            <button
              onClick={() => setListFilter("staff")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                listFilter === "staff"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Staff
            </button>
          </>
        }
        listTitle="Team Members"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={Users} title="No team members found" />
          ) : (
            filtered.map((m) => (
              <ListRow
                key={m.id}
                id={m.id}
                primary={m.user.name}
                secondary={m.user.email}
                meta={new Date(m.createdAt).toLocaleDateString()}
                selected={selectedMember?.id === m.id}
                onClick={() => openMemberSheet(m)}
                badge={
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize",
                      m.role === "owner"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : m.role === "admin"
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          : "bg-white/10 text-zinc-400 border-white/10",
                    )}
                  >
                    {m.role}
                  </span>
                }
              />
            ))
          )
        }
        detailChildren={
          <UserDetailPanel
            member={selectedMember}
            companyId={companyId}
            userRole={userRole}
            isPending={isSheetPending}
            sheetRole={sheetRole}
            setSheetRole={setSheetRole}
            sheetMessage={sheetMessage}
            confirmRemoveId={confirmRemoveId}
            setConfirmRemoveId={setConfirmRemoveId}
            handleRemoveMember={handleRemoveMember}
            profileForm={profileForm}
            handleProfileSubmit={handleProfileSubmit}
            canUpdateRole={canUpdateRole}
            canRemove={canRemove}
          />
        }
      />

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-xl font-bold text-foreground">
                Invite Team Member
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-2xl text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {inviteError}
              </div>
            )}

            <form
              onSubmit={inviteForm.handleSubmit((data) =>
                handleInviteSubmit(data, () => inviteForm.reset()),
              )}
              className="space-y-4"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel>Email Address *</FieldLabel>
                  <Input
                    type="email"
                    {...inviteForm.register("email")}
                    placeholder="colleague@company.com"
                  />
                  {inviteForm.formState.errors.email && (
                    <FieldError>
                      {inviteForm.formState.errors.email.message}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Assign Role *</FieldLabel>
                  <select
                    {...inviteForm.register("role")}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                    <option value="staff">Staff</option>
                  </select>
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInvitePending}>
                  {isInvitePending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
