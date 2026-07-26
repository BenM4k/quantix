"use client";

import * as React from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { getPresignedUploadUrlAction } from "@/services/storage/storage.actions";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  folder?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Upload Image",
  disabled = false,
  folder = "products",
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get presigned upload URL from server action
      const presignRes = await getPresignedUploadUrlAction({
        filename: file.name,
        contentType: file.type || "image/jpeg",
        folder,
      });

      if (!presignRes.ok) {
        setError(presignRes.error.message);
        setIsUploading(false);
        return;
      }

      const { uploadUrl, publicUrl, headers } = presignRes.value;

      // 2. Direct binary HTTP PUT upload to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
          ...headers,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        setError("Failed to upload image binary to Cloudflare R2 storage");
        setIsUploading(false);
        return;
      }

      // 3. Pass only the public CDN / storage URL to database form state
      onChange(publicUrl);
    } catch (err) {
      setError("An unexpected network error occurred while uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-muted-foreground">{label}</label>}

      {value ? (
        <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-90 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-28 rounded-xl border border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors text-center px-4 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">Uploading to Cloudflare R2...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-foreground">Click to upload image</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading || disabled}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
