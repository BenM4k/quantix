import "server-only";

import { eq, and, sql, ilike, or, count } from "drizzle-orm";
import { type Tx } from "@/services/drizzle";
import { member, user, invitation } from "@/services/drizzle/schemas";

export type MemberWithUser = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type PaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
};

export async function getPaginatedMembers(
  tx: Tx,
  organizationId: string,
  params: PaginationParams,
): Promise<{ rows: MemberWithUser[]; total: number }> {
  const { page = 1, pageSize = 20, search, role } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(member.organizationId, organizationId)];

  if (role && role !== "all") {
    conditions.push(eq(member.role, role));
  }

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(ilike(user.name, searchPattern), ilike(user.email, searchPattern))!,
    );
  }

  const whereCondition = and(...conditions);

  const [{ countValue }] = await tx
    .select({ countValue: count() })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(whereCondition);

  const rows = await tx
    .select({
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(whereCondition)
    .limit(pageSize)
    .offset(offset);

  return {
    rows,
    total: Number(countValue),
  };
}

export async function getMemberById(
  tx: Tx,
  organizationId: string,
  memberId: string,
): Promise<MemberWithUser | null> {
  const [row] = await tx
    .select({
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(and(eq(member.id, memberId), eq(member.organizationId, organizationId)));

  return row || null;
}

export async function updateMemberRole(
  tx: Tx,
  organizationId: string,
  memberId: string,
  newRole: string,
) {
  const [updated] = await tx
    .update(member)
    .set({ role: newRole })
    .where(and(eq(member.id, memberId), eq(member.organizationId, organizationId)))
    .returning();
  return updated;
}

export async function removeMember(
  tx: Tx,
  organizationId: string,
  memberId: string,
) {
  const [deleted] = await tx
    .delete(member)
    .where(and(eq(member.id, memberId), eq(member.organizationId, organizationId)))
    .returning();
  return deleted;
}

export async function updateUserProfile(
  tx: Tx,
  userId: string,
  data: { name?: string; image?: string | null },
) {
  const [updated] = await tx
    .update(user)
    .set({
      ...(data.name ? { name: data.name } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  return updated;
}

export async function getPendingInvitations(
  tx: Tx,
  organizationId: string,
) {
  return tx
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending"),
      ),
    );
}

export async function revokeInvitation(
  tx: Tx,
  organizationId: string,
  invitationId: string,
) {
  const [deleted] = await tx
    .delete(invitation)
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, organizationId),
      ),
    )
    .returning();
  return deleted;
}
