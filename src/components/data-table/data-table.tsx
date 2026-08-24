"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SortableColumn = {
  key: string;
  label: string;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  filterComponent?: React.ReactNode;
  /** Render bulk action buttons given the array of currently-selected rows */
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;
  /** Render the ⋮ actions menu for a single row */
  rowActions?: (row: TData) => React.ReactNode;
  /** Enable row checkbox selection (default true) */
  enableSelection?: boolean;
  /** Sortable column definitions for header indicators */
  sortableColumns?: SortableColumn[];
  tableTitle?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  pageSize: initialPageSize = 20,
  onRowClick,
  searchPlaceholder = "Enter search keyword...",
  isLoading = false,
  filterComponent,
  bulkActions,
  rowActions,
  enableSelection = true,
  sortableColumns = [],
  tableTitle,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || initialPageSize;
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "";

  const [searchValue, setSearchValue] = React.useState(currentSearch);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

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

  // Reset selection when data changes
  React.useEffect(() => {
    setRowSelection({});
  }, [data]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Build columns with optional checkbox + actions columns
  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    if (enableSelection) {
      cols.push({
        id: "__select__",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 rounded-md border-white/20 bg-white/5 accent-indigo-600 cursor-pointer"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded-md border-white/20 bg-white/5 accent-indigo-600 cursor-pointer"
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 40,
        enableSorting: false,
      } as ColumnDef<TData, TValue>);
    }

    cols.push(...columns);

    if (rowActions) {
      cols.push({
        id: "__actions__",
        header: "",
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            {rowActions(row.original)}
          </div>
        ),
        size: 48,
        enableSorting: false,
      } as ColumnDef<TData, TValue>);
    }

    return cols;
  }, [columns, enableSelection, rowActions]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  const handleSort = (key: string) => {
    if (currentSort === key) {
      updateUrl({ sort: `-${key}`, page: 1 });
    } else if (currentSort === `-${key}`) {
      updateUrl({ sort: null, page: 1 });
    } else {
      updateUrl({ sort: key, page: 1 });
    }
  };

  const getSortIcon = (key: string) => {
    if (currentSort === key) return <ArrowUp className="h-3.5 w-3.5 text-indigo-400" />;
    if (currentSort === `-${key}`) return <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />;
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Neo-Morphic Pill Filter & Search Bar Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background font-bold text-xs shadow-xs">
            <span>Active filters</span>
            <span className="h-4 w-4 rounded-full bg-background text-foreground text-[10px] flex items-center justify-center font-bold">
              {searchValue ? 1 : 0}
            </span>
          </span>

          {filterComponent}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 h-9 text-xs rounded-full border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Dark Neo-Morphic Table Container matching reference */}
      <div className="rounded-[32px] bg-[#0E1017] dark:bg-[#0A0B10] border border-zinc-800/80 p-5 lg:p-6 shadow-2xl text-white overflow-hidden">
        {/* Selection Action Bar */}
        {enableSelection && selectedCount > 0 && bulkActions && (
          <div className="flex items-center gap-4 px-4 py-2.5 mb-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="font-bold text-indigo-300">
              {selectedCount} selected
            </span>
            <button
              onClick={() => table.toggleAllRowsSelected(true)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Select All
            </button>
            <div className="h-3.5 w-px bg-white/20" />
            <div className="flex items-center gap-1">
              {bulkActions(selectedRows)}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const colDef = header.column.columnDef as ColumnDef<TData, TValue> & {
                      sortKey?: string;
                    };
                    const sortKey =
                      colDef.sortKey ??
                      sortableColumns.find(
                        (s) =>
                          s.label ===
                          (typeof colDef.header === "string" ? colDef.header : ""),
                      )?.key;

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3.5 whitespace-nowrap",
                          header.id === "__select__" && "w-10",
                          header.id === "__actions__" && "w-12 text-right",
                        )}
                      >
                        {header.isPlaceholder ? null : sortKey ? (
                          <button
                            onClick={() => handleSort(sortKey)}
                            className="group inline-flex items-center gap-1.5 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-wider"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {getSortIcon(sortKey)}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {allColumns.map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-4">
                        <div className="h-4 bg-white/10 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    data-selected={row.getIsSelected()}
                    className={cn(
                      "transition-colors hover:bg-white/[0.06] data-[selected=true]:bg-indigo-600/20",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3.5 text-zinc-200 font-medium",
                          cell.column.id === "__select__" && "w-10",
                          cell.column.id === "__actions__" && "w-12 text-right",
                        )}
                      >
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
                    colSpan={allColumns.length}
                    className="px-4 py-12 text-center text-zinc-400 text-xs"
                  >
                    No records found in this workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-5 mt-4 border-t border-white/10 gap-3 text-xs text-zinc-400">
          <div>
            Showing{" "}
            <span className="font-bold text-white">
              {total > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            –{" "}
            <span className="font-bold text-white">
              {Math.min(currentPage * pageSize, total)}
            </span>{" "}
            of <span className="font-bold text-white">{total}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            {/* First page */}
            <button
              onClick={() => updateUrl({ page: 1 })}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            {/* Prev */}
            <button
              onClick={() => updateUrl({ page: currentPage - 1 })}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-zinc-500">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => updateUrl({ page })}
                  disabled={isLoading}
                  className={cn(
                    "min-w-7 h-7 px-2 rounded-full text-xs font-bold transition-all",
                    currentPage === page
                      ? "bg-[#5046E5] text-white shadow-md shadow-indigo-600/30"
                      : "bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10",
                  )}
                >
                  {page}
                </button>
              ),
            )}

            {/* Next */}
            <button
              onClick={() => updateUrl({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {/* Last page */}
            <button
              onClick={() => updateUrl({ page: totalPages })}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
