import { Result } from "@/lib/server-utils";

export type StorageError = {
  code: "PRESIGN_FAILED" | "DELETE_FAILED" | "INVALID_INPUT";
  message: string;
};

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers?: Record<string, string>;
}

export interface IStorageProvider {
  /**
   * Generates a presigned upload URL for direct client-to-storage PUT upload.
   */
  getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder?: string,
  ): Promise<Result<PresignedUploadResult, StorageError>>;

  /**
   * Deletes an object from storage by its key or public URL.
   */
  deleteFile(keyOrUrl: string): Promise<Result<void, StorageError>>;
}
