import { Ok, Result } from "@/lib/server-utils";
import {
  IStorageProvider,
  PresignedUploadResult,
  StorageError,
} from "../storage-provider.interface";

export class LocalStorageProvider implements IStorageProvider {
  async getPresignedUploadUrl(
    filename: string,
    _contentType: string,
    folder = "uploads",
  ): Promise<Result<PresignedUploadResult, StorageError>> {
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const key = `${folder}/${safeName}`;
    const url = `/uploads/${safeName}`;

    return Ok({
      uploadUrl: url,
      publicUrl: url,
      key,
    });
  }

  async deleteFile(_keyOrUrl: string): Promise<Result<void, StorageError>> {
    return Ok(undefined);
  }
}
