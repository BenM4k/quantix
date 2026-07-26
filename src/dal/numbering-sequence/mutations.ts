import "server-only";

import { and, eq } from "drizzle-orm";
import { numberingSequence } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export async function getNextSequenceNumber(
  tx: Tx,
  organizationId: string,
  sequenceKey: string,
  defaultPrefix: string = "JE-",
): Promise<string> {
  const [existing] = await tx
    .select()
    .from(numberingSequence)
    .where(
      and(
        eq(numberingSequence.organizationId, organizationId),
        eq(numberingSequence.sequenceKey, sequenceKey),
      ),
    )
    .limit(1);

  let seq = existing;

  if (!seq) {
    const [inserted] = await tx
      .insert(numberingSequence)
      .values({
        organizationId,
        sequenceKey,
        prefix: defaultPrefix,
        nextNumber: 1,
        padding: 4,
      })
      .returning();
    seq = inserted;
  }

  const currentNumber = seq.nextNumber;
  const prefix = seq.prefix ?? defaultPrefix;
  const padding = seq.padding ?? 4;
  const formattedNumber = `${prefix}${currentNumber.toString().padStart(padding, "0")}`;

  await tx
    .update(numberingSequence)
    .set({
      nextNumber: currentNumber + 1,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(numberingSequence.organizationId, organizationId),
        eq(numberingSequence.id, seq.id),
      ),
    );

  return formattedNumber;
}
