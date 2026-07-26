import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MemberWithUser } from "@/dal/user/queries";
import {
  inviteUserAction,
  updateMemberRoleAction,
  removeMemberAction,
  updateUserProfileAction,
  revokeInvitationAction,
  resendInvitationAction,
} from "../actions";
import { InviteUserInput, UpdateUserProfileInput } from "@/lib/schemas/user";

export function useUserManager(companyId: string, members: MemberWithUser[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedMemberId = searchParams.get("selected");
  const activeTab = searchParams.get("tab") || "members";

  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [isInvitePending, startInviteTransition] = React.useTransition();

  const [selectedMember, setSelectedMember] = React.useState<MemberWithUser | null>(null);
  const [isSheetPending, startSheetTransition] = React.useTransition();
  const [sheetRole, setSheetRole] = React.useState<string>("staff");
  const [sheetMessage, setSheetMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = React.useState<string | null>(null);

  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [resendSuccessId, setResendSuccessId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedMemberId) {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) {
        setSelectedMember(found);
        setSheetRole(found.role);
      }
    } else {
      setSelectedMember(null);
    }
  }, [selectedMemberId, members]);

  const openMemberSheet = (member: MemberWithUser) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", member.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeMemberSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`${pathname}?${params.toString()}`);
    setSelectedMember(null);
  };

  const handleInviteSubmit = (data: InviteUserInput, resetForm: () => void) => {
    setInviteError(null);
    startInviteTransition(async () => {
      const res = await inviteUserAction(companyId, data);
      if (res.ok) {
        setIsInviteOpen(false);
        resetForm();
      } else {
        setInviteError(res.error.message);
      }
    });
  };

  const handleProfileSubmit = (data: UpdateUserProfileInput, canUpdateRole: boolean) => {
    if (!selectedMember) return;
    setSheetMessage(null);

    startSheetTransition(async () => {
      let roleSuccess = true;
      let profileSuccess = true;

      if (sheetRole !== selectedMember.role && canUpdateRole) {
        const roleRes = await updateMemberRoleAction(companyId, {
          memberId: selectedMember.id,
          role: sheetRole as "owner" | "admin" | "accountant" | "staff",
        });
        if (!roleRes.ok) roleSuccess = false;
      }

      const profileRes = await updateUserProfileAction(companyId, data);
      if (!profileRes.ok) profileSuccess = false;

      if (roleSuccess && profileSuccess) {
        setSheetMessage({ type: "success", text: "Member updated successfully." });
      } else {
        setSheetMessage({ type: "error", text: "Failed to update member." });
      }
    });
  };

  const handleRemoveMember = (id: string) => {
    startSheetTransition(async () => {
      const res = await removeMemberAction(companyId, id);
      if (res.ok) {
        setConfirmRemoveId(null);
        closeMemberSheet();
      } else {
        setSheetMessage({ type: "error", text: res.error.message });
      }
    });
  };

  const handleRevokeInvite = (invitationId: string) => {
    startInviteTransition(async () => {
      await revokeInvitationAction(companyId, invitationId);
    });
  };

  const handleResendInvite = async (invitationId: string, email: string, role: string) => {
    setResendingId(invitationId);
    const res = await resendInvitationAction(companyId, invitationId, email, role);
    setResendingId(null);
    if (res.ok) {
      setResendSuccessId(invitationId);
      setTimeout(() => setResendSuccessId(null), 3000);
    }
  };

  return {
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
  };
}
