"use server";

import { getSession } from "@/services/better-auth/session";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { getStorageProvider } from "./storage-factory";
import {
  PresignedUploadResult,
  StorageError,
} from "./storage-provider.interface";

export async function getPresignedUploadUrlAction(input: {
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<Result<PresignedUploadResult, StorageError>> {
  const session = await getSession();
  if (!session) {
    return Err({
      code: "PRESIGN_FAILED",
      message: "Authentication required to upload assets",
    });
  }

  const provider = getStorageProvider();
  return provider.getPresignedUploadUrl(
    input.filename,
    input.contentType,
    input.folder,
  );
}

export async function deleteStorageFileAction(
  keyOrUrl: string,
): Promise<Result<void, StorageError>> {
  const session = await getSession();
  if (!session) {
    return Err({
      code: "DELETE_FAILED",
      message: "Authentication required to delete assets",
    });
  }

  const provider = getStorageProvider();
  return provider.deleteFile(keyOrUrl);
}
