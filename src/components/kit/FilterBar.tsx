import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-8 pr-8 text-sm"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export interface FilterDef {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onReset,
  children,
  className,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  onReset?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  const dirty =
    (search ? search.length > 0 : false) || filters.some((f) => f.value !== "all");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-border px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {onSearchChange && (
        <SearchBar
          value={search ?? ""}
          onChange={onSearchChange}
          placeholder={searchPlaceholder ?? "Search…"}
        />

      )}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Select key={f.id} value={f.value} onValueChange={f.onChange}>
            <SelectTrigger className="h-9 w-full min-w-36 text-sm sm:w-auto" aria-label={f.label}>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {dirty && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
            <X className="size-3.5" /> Reset
          </Button>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>}
    </div>
  );
}
