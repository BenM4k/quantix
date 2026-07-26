"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
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
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import {
  UserPlus,
  Users,
  Trash2,
  X,
  Mail,
  Loader2,
  Send,
  Check,
} from "lucide-react";
import { Invitation } from "@/services/drizzle/schemas";

interface UsersClientProps {
  companyId: string;
  members: MemberWithUser[];
  totalMembers: number;
  invitations: Invitation[];
  userRole: string;
}

export function UsersClient({
  companyId,
  members,
  totalMembers,
  invitations,
  userRole,
}: UsersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    resendingId,
    resendSuccessId,
    openMemberSheet,
    closeMemberSheet,
    handleInviteSubmit,
    handleProfileSubmit,
    handleRemoveMember,
    handleRevokeInvite,
    handleResendInvite,
  } = useUserManager(companyId, members);

  const canInvite = canX(userRole, { id: companyId }, "user:invite");
  const canUpdateRole = canX(userRole, { id: companyId }, "user:update-role");
  const canRemove = canX(userRole, { id: companyId }, "user:remove");

  // Invite Form
  const inviteForm = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "staff",
    },
  });

  // Profile Form for Sheet
  const profileForm = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      memberId: "",
      name: "",
      imageUrl: null,
    },
  });

  // Sync sheet form with selected member
  React.useEffect(() => {
    if (selectedMember) {
      profileForm.reset({
        memberId: selectedMember.id,
        name: selectedMember.user.name,
        imageUrl: selectedMember.user.image,
      });
    }
  }, [selectedMember, profileForm]);

  const columns: ColumnDef<MemberWithUser>[] = [
    {
      accessorKey: "user.name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
            {row.original.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.original.user.image} alt={row.original.user.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              row.original.user.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.original.user.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-secondary text-secondary-foreground border border-border/40">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage company members, assign operational roles, and send invitations."
        icon={Users}
        actions={
          canInvite ? (
            <Button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          ) : undefined
        }
      />

      {/* Header Toolbar */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", "members");
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "members"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Active Members ({totalMembers})
        </button>
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", "invitations");
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "invitations"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Pending Invitations ({invitations.length})
        </button>
      </div>

      {/* Main Content View */}
      {activeTab === "members" ? (
        <DataTable
          columns={columns}
          data={members}
          total={totalMembers}
          onRowClick={openMemberSheet}
          searchPlaceholder="Search members by name or email..."
        />
      ) : (
        <SectionCard variant="solid">
          {invitations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No pending invitations.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {invitations.map((inv) => (
                <div key={inv.id} className="py-3 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{inv.email}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        Role: {inv.role} • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {canInvite && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(inv.id, inv.email, inv.role)}
                        disabled={resendingId === inv.id}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        {resendingId === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : resendSuccessId === inv.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Send className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span>{resendSuccessId === inv.id ? "Sent!" : "Resend Email"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeInvite(inv.id)}
                        disabled={isInvitePending}
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Invite Modal Dialog */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-surface-elevated border border-border/80 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-4 rounded-xl text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {inviteError}
              </div>
            )}

            <form
              onSubmit={inviteForm.handleSubmit((data) =>
                handleInviteSubmit(data, () => inviteForm.reset())
              )}
              className="space-y-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-email">User Email Address *</FieldLabel>
                  <Input
                    id="invite-email"
                    type="email"
                    {...inviteForm.register("email")}
                    placeholder="colleague@company.com"
                  />
                  {inviteForm.formState.errors.email && (
                    <FieldError>{inviteForm.formState.errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="invite-role">Assign Role *</FieldLabel>
                  <select
                    id="invite-role"
                    {...inviteForm.register("role")}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                    <option value="staff">Staff</option>
                  </select>
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isInvitePending}>
                  {isInvitePending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details / Edit Sheet */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedMember.user.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedMember.user.email}</p>
                </div>
                <button
                  onClick={closeMemberSheet}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sheetMessage && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    sheetMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {sheetMessage.text}
                </div>
              )}

              <form
                id="edit-member-form"
                onSubmit={profileForm.handleSubmit((data) =>
                  handleProfileSubmit(data, canUpdateRole)
                )}
                className="space-y-4"
              >
                <FieldGroup>
                  <Field>
                    <ImageUploadField
                      label="User Avatar"
                      value={profileForm.watch("imageUrl")}
                      onChange={(url) => profileForm.setValue("imageUrl", url, { shouldValidate: true })}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="member-name">Name</FieldLabel>
                    <Input
                      id="member-name"
                      {...profileForm.register("name")}
                    />
                    {profileForm.formState.errors.name && (
                      <FieldError>{profileForm.formState.errors.name.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="member-role">Organization Role</FieldLabel>
                    <select
                      id="member-role"
                      disabled={!canUpdateRole}
                      value={sheetRole}
                      onChange={(e) => setSheetRole(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="accountant">Accountant</option>
                      <option value="staff">Staff</option>
                    </select>
                  </Field>
                </FieldGroup>
              </form>
            </div>

            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
              {canRemove ? (
                confirmRemoveId === selectedMember.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive font-medium">Confirm?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveMember(selectedMember.id)}
                      disabled={isSheetPending}
                    >
                      Yes, Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmRemoveId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRemoveId(selectedMember.id)}
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Remove Member
                  </Button>
                )
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={closeMemberSheet}>
                  Close
                </Button>
                <Button form="edit-member-form" type="submit" disabled={isSheetPending}>
                  {isSheetPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
