import React from 'react';
import { cn } from '../layout/Sidebar';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilterClick?: () => void;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  description,
  searchPlaceholder = 'Search...',
  onSearch,
  onFilterClick,
  onRowClick
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      {(title || onSearch) && (
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            {title && <h3 className="text-[#1D2B64] font-bold">{title}</h3>}
            {description && <p className="text-xs text-[#64748B] mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onSearch && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type="text" 
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3B6CE7]/50 w-full sm:w-64"
                />
              </div>
            )}
            {onFilterClick && (
              <button 
                onClick={onFilterClick}
                className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <SlidersHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-white">
              {columns.map((col) => (
                <th key={col.key as string} className="px-5 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "bg-white transition-colors",
                    onRowClick && "cursor-pointer hover:bg-[#F8FAFC]"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key as string} className={cn("px-5 py-4 text-xs text-[#1D2B64]", col.className)}>
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-sm text-[#64748B]">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-gray-50/50">
        <p className="text-xs text-[#64748B]">Showing <span className="font-semibold text-[#1D2B64]">{data.length}</span> results</p>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white disabled:opacity-50">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white disabled:opacity-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
