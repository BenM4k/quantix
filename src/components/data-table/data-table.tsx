"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  filterComponent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  pageSize: initialPageSize = 20,
  onRowClick,
  searchPlaceholder = "Search...",
  isLoading = false,
  filterComponent,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || initialPageSize;
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "";

  const [searchValue, setSearchValue] = React.useState(currentSearch);

  // Update URL helper
  const updateUrl = React.useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateUrl({ search: searchValue, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, currentSearch, updateUrl]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4 w-full">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border/80 bg-[var(--surface-solid)] text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {filterComponent && <div className="flex items-center gap-2 w-full sm:w-auto">{filterComponent}</div>}
      </div>

      {/* Table Container - Solid Content Surface */}
      <div className="rounded-2xl border border-border/80 bg-[var(--surface-solid)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface-solid-raised)] border-b border-border/80 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-4">
                        <div className="h-4 bg-muted/60 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={`transition-colors hover:bg-[var(--surface-solid-raised)] ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 text-foreground/90">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border/80 bg-[var(--surface-solid-raised)] gap-3 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{total > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
            <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, total)}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateUrl({ page: currentPage - 1 })}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-border/80 bg-[var(--surface-solid)] text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">
              Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
            </span>
            <button
              onClick={() => updateUrl({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-border/80 bg-[var(--surface-solid)] text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
