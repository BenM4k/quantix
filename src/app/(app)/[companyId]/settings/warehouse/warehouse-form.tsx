"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseSchema, type WarehouseInput } from "@/lib/schemas/warehouse";
import { saveWarehouseAction } from "./actions";
import { ImageUploadField } from "@/components/image-upload-field";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Save, Loader2 } from "lucide-react";

interface WarehouseFormProps {
  companyId: string;
  initialData?: {
    id?: string;
    name: string;
    address?: string | null;
    imageUrl?: string | null;
    active: boolean;
  } | null;
  canEdit: boolean;
}

export function WarehouseForm({ companyId, initialData, canEdit }: WarehouseFormProps) {
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<WarehouseInput>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      name: initialData?.name || "Main Warehouse",
      address: initialData?.address || "",
      imageUrl: initialData?.imageUrl || null,
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = (data: WarehouseInput) => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveWarehouseAction(companyId, data);
      if (res.ok) {
        setStatusMessage({ type: "success", text: "Warehouse settings updated successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error.message });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Warehouse Settings"
        description="Configure primary warehouse location details for your company."
        icon={Building2}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Warehouse Details</h2>
              <p className="text-xs text-muted-foreground">Manage your single primary company warehouse record.</p>
            </div>
          </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="warehouse-name">Warehouse Name *</FieldLabel>
          <Input
            id="warehouse-name"
            disabled={!canEdit || isPending}
            {...form.register("name")}
            placeholder="e.g. Central Storage"
          />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="warehouse-address">Address</FieldLabel>
          <Textarea
            id="warehouse-address"
            rows={3}
            disabled={!canEdit || isPending}
            {...form.register("address")}
            placeholder="Physical warehouse street address..."
          />
        </Field>

        <Field>
          <ImageUploadField
            label="Warehouse Photo (Optional)"
            value={form.watch("imageUrl")}
            onChange={(url) => form.setValue("imageUrl", url, { shouldValidate: true })}
          />
        </Field>
      </FieldGroup>

      {canEdit && (
        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={isPending} className="flex items-center gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Settings</span>
          </Button>
        </div>
      )}
        </SectionCard>
      </form>
    </div>
  );
}
