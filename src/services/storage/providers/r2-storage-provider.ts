import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Ok, Err, Result } from "@/lib/server-utils";
import {
  IStorageProvider,
  PresignedUploadResult,
  StorageError,
} from "../storage-provider.interface";

export class R2StorageProvider implements IStorageProvider {
  private client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "quantix";
    this.publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(
      /\/$/,
      "",
    );

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder = "uploads",
  ): Promise<Result<PresignedUploadResult, StorageError>> {
    if (!filename) {
      return Err({ code: "INVALID_INPUT", message: "Filename is required" });
    }

    const safeName = `${Date.now()}-${this.sanitizeFilename(filename)}`;
    const key = folder ? `${folder.replace(/\/$/, "")}/${safeName}` : safeName;

    if (!this.client) {
      // Fallback for development if R2 credentials are missing
      const localPublicUrl = `/uploads/${safeName}`;
      return Ok({
        uploadUrl: localPublicUrl,
        publicUrl: localPublicUrl,
        key,
      });
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      // 15-minute presigned PUT URL
      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 900,
      });

      const publicUrl = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : uploadUrl.split("?")[0];

      return Ok({
        uploadUrl,
        publicUrl,
        key,
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch (error) {
      return Err({
        code: "PRESIGN_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate presigned upload URL",
      });
    }
  }

  async deleteFile(keyOrUrl: string): Promise<Result<void, StorageError>> {
    if (!keyOrUrl) {
      return Ok(undefined);
    }

    if (!this.client) {
      return Ok(undefined);
    }

    try {
      const key = keyOrUrl.startsWith("http")
        ? keyOrUrl.replace(`${this.publicUrl}/`, "")
        : keyOrUrl;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return Ok(undefined);
    } catch (error) {
      return Err({
        code: "DELETE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete file from Cloudflare R2",
      });
    }
  }
}
