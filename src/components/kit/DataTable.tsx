import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState } from "@/components/kit/States";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

const HIDE: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  pageSize = 10,
  loading = false,
  error = false,
  onRetry,
  onRowClick,
  emptyTitle,
  emptyDescription,
  toolbar,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  caption?: string;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const slice = useMemo(
    () => rows.slice(current * pageSize, current * pageSize + pageSize),
    [rows, current, pageSize],
  );

  return (
    <div className="panel overflow-hidden">
      {toolbar}
      {loading ? (
        <LoadingState rows={pageSize > 8 ? 8 : pageSize} label="Loading records" />
      ) : error ? (
        <ErrorState {...(onRetry ? { onRetry } : {})} />
      ) : rows.length === 0 ? (
        <EmptyState
          {...(emptyTitle ? { title: emptyTitle } : {})}
          {...(emptyDescription ? { description: emptyDescription } : {})}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              {caption && <caption className="sr-only">{caption}</caption>}
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {columns.map((c) => (
                    <TableHead
                      key={c.key}
                      className={cn(
                        "h-9 whitespace-nowrap bg-surface-raised/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                        c.hideBelow && HIDE[c.hideBelow],
                        c.headerClassName,
                      )}
                    >
                      {c.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-border text-sm",
                      onRowClick && "cursor-pointer hover:bg-accent/40",
                    )}
                  >
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn(
                          "py-2.5 align-middle",
                          c.hideBelow && HIDE[c.hideBelow],
                          c.className,
                        )}
                      >
                        {c.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-border px-3 py-2.5 text-xs text-muted-foreground sm:flex-row">
            <span className="num">
              Showing {current * pageSize + 1}–{Math.min(rows.length, (current + 1) * pageSize)} of{" "}
              {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="size-3.5" /> Prev
              </Button>
              <span className="num px-2">
                {current + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CellStack({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium">{primary}</div>
      {secondary && <div className="truncate text-xs text-muted-foreground">{secondary}</div>}
    </div>
  );
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs text-muted-foreground", className)}>{children}</span>
  );
}
