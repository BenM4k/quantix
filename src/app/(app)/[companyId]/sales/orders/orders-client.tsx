"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { canX } from "@/lib/permissions";
import { OrderWithCustomer } from "@/dal/sales-order/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingBag, FileText } from "lucide-react";

interface OrdersClientProps {
  companyId: string;
  orders: OrderWithCustomer[];
  totalOrders: number;
  userRole: string;
}

export function OrdersClient({ companyId, orders, totalOrders, userRole }: OrdersClientProps) {
  const canCreate = canX(userRole, { id: companyId }, "order:create");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmed</Badge>;
      case "converted":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Converted</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<OrderWithCustomer>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <Link
          href={`/${companyId}/sales/orders/${row.original.id}`}
          className="font-medium text-primary hover:underline flex items-center gap-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{row.original.orderNumber}</span>
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "orderDate",
      header: "Date",
    },
    {
      accessorKey: "sourceQuoteNumber",
      header: "Source Quote",
      cell: ({ row }) =>
        row.original.sourceQuoteId ? (
          <Link
            href={`/${companyId}/sales/quotes/${row.original.sourceQuoteId}`}
            className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            <span>{row.original.sourceQuoteNumber || "Quote"}</span>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">${Number(row.original.total).toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage confirmed sales orders before invoicing.
          </p>
        </div>
        {canCreate && (
          <Link href={`/${companyId}/sales/orders/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Order</span>
            </Button>
          </Link>
        )}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        total={totalOrders}
        searchPlaceholder="Search orders by number..."
      />
    </div>
  );
}
