"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { canX } from "@/lib/permissions";
import { QuoteWithCustomer } from "@/dal/quote/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

interface QuotesClientProps {
  companyId: string;
  quotes: QuoteWithCustomer[];
  totalQuotes: number;
  userRole: string;
}

export function QuotesClient({ companyId, quotes, totalQuotes, userRole }: QuotesClientProps) {
  const canCreate = canX(userRole, { id: companyId }, "quote:create");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Sent</Badge>;
      case "accepted":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "converted":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Converted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<QuoteWithCustomer>[] = [
    {
      accessorKey: "quoteNumber",
      header: "Quote #",
      cell: ({ row }) => (
        <Link
          href={`/${companyId}/sales/quotes/${row.original.id}`}
          className="font-medium text-primary hover:underline flex items-center gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>{row.original.quoteNumber}</span>
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "quoteDate",
      header: "Date",
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
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="text-sm text-muted-foreground">
            Manage sales quotations and estimations for customers.
          </p>
        </div>
        {canCreate && (
          <Link href={`/${companyId}/sales/quotes/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Quote</span>
            </Button>
          </Link>
        )}
      </div>

      <DataTable
        columns={columns}
        data={quotes}
        total={totalQuotes}
        searchPlaceholder="Search quotes by number..."
      />
    </div>
  );
}
