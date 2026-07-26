"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { StockLedgerWithDetails } from "@/dal/stock/queries";
import { Product } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { AdjustStockDialog } from "./adjust-stock-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plus, ArrowUpRight, ArrowDownRight, Layers, FileText, Calendar, User, Tag } from "lucide-react";

interface StockLedgerClientProps {
  companyId: string;
  entries: StockLedgerWithDetails[];
  totalEntries: number;
  products: Product[];
  userRole: string;
}

export function StockLedgerClient({
  companyId,
  entries,
  totalEntries,
  products,
  userRole,
}: StockLedgerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<StockLedgerWithDetails | null>(null);

  const canAdjust = canX(userRole, { id: companyId }, "stock:adjust");

  const movementTypeBadges: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    initial: { label: "Initial Stock", variant: "default" },
    adjustment_in: { label: "Adjustment In", variant: "default" },
    adjustment_out: { label: "Adjustment Out", variant: "destructive" },
    sale: { label: "Sale", variant: "destructive" },
    sale_reversal: { label: "Sale Reversal", variant: "secondary" },
  };

  const columns: ColumnDef<StockLedgerWithDetails>[] = [
    {
      accessorKey: "sequenceNumber",
      header: "Seq #",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.sequenceNumber}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date & Time",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-xs">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.productName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.productSku}</div>
        </div>
      ),
    },
    {
      accessorKey: "movementType",
      header: "Movement Type",
      cell: ({ row }) => {
        const info = movementTypeBadges[row.original.movementType] || {
          label: row.original.movementType,
          variant: "outline",
        };
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const qty = Number(row.original.quantity);
        const isPositive = qty > 0;
        return (
          <div className="flex items-center gap-1 font-semibold text-sm">
            {isPositive ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-0.5" />
                +{qty}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-0.5" />
                {qty}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "unitCost",
      header: "Unit Cost",
      cell: ({ row }) => {
        const cost = Number(row.original.unitCost);
        return <span className="font-mono text-sm">${cost.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: "sourceType",
      header: "Source",
      cell: ({ row }) => (
        <span className="capitalize text-xs text-muted-foreground font-medium">
          {row.original.sourceType}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Adjust Stock Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Activity</h1>
          <p className="text-sm text-muted-foreground">
            Immutable log of all inventory movements and cost calculations.
          </p>
        </div>
        {canAdjust && (
          <Button onClick={() => setIsAdjustOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns as ColumnDef<StockLedgerWithDetails, any>[]}
        data={entries}
        total={totalEntries}
        searchPlaceholder="Search by product name or SKU..."
        onRowClick={(row) => setSelectedEntry(row)}
      />

      {/* View-Only Entry Detail Sheet */}
      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Stock Movement Detail
            </SheetTitle>
            <SheetDescription>
              View-only audit detail for sequence #{selectedEntry?.sequenceNumber}.
            </SheetDescription>
          </SheetHeader>

          {selectedEntry && (
            <div className="space-y-6 pt-6 text-sm">
              {/* Product Header Card */}
              <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Product
                </div>
                <div className="font-semibold text-base">{selectedEntry.productName}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  SKU: {selectedEntry.productSku}
                </div>
              </div>

              {/* Movement Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Movement Type
                  </div>
                  <div>
                    <Badge variant={movementTypeBadges[selectedEntry.movementType]?.variant || "outline"}>
                      {movementTypeBadges[selectedEntry.movementType]?.label || selectedEntry.movementType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date & Time
                  </div>
                  <div className="font-medium">
                    {new Date(selectedEntry.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Quantity Movement</div>
                  <div className="text-base font-bold">
                    {Number(selectedEntry.quantity) > 0
                      ? `+${selectedEntry.quantity}`
                      : selectedEntry.quantity}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Unit Cost (at movement)</div>
                  <div className="text-base font-bold font-mono">
                    ${Number(selectedEntry.unitCost).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Source Type
                  </div>
                  <div className="font-medium capitalize">{selectedEntry.sourceType}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Warehouse
                  </div>
                  <div className="font-medium">{selectedEntry.warehouseName}</div>
                </div>
              </div>

              {/* Reason */}
              {selectedEntry.reason && (
                <div className="space-y-1 pt-2 border-t">
                  <div className="text-xs text-muted-foreground font-semibold">Reason</div>
                  <div className="p-3 rounded-md bg-background border text-xs whitespace-pre-wrap">
                    {selectedEntry.reason}
                  </div>
                </div>
              )}

              {/* Source Link if present */}
              {selectedEntry.sourceId && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Source Reference ID: <span className="font-mono">{selectedEntry.sourceId}</span>
                </div>
              )}

              <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                This entry is immutable and cannot be updated or deleted.
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        companyId={companyId}
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        products={products}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
