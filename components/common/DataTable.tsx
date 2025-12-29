import React from 'react';
import { Loader2, Inbox, Filter, X, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text';
  options?: FilterOption[];
}

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  filtersConfig?: FilterConfig[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
}

export function DataTable<T>({ 
  columns, 
  data, 
  isLoading, 
  onRowClick,
  filtersConfig,
  activeFilters = {},
  onFilterChange,
  onClearFilters
}: DataTableProps<T>) {
  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '' && v !== undefined && v !== null);
  const isValidData = Array.isArray(data);

  return (
    <div className="card-premium overflow-hidden border border-gray-100 flex flex-col">
      {filtersConfig && filtersConfig.length > 0 && (
        <div className="p-4 bg-gray-50/30 border-b border-gray-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {filtersConfig.map((filter) => (
              <div key={filter.key} className="relative">
                {filter.type === 'select' ? (
                  <div className="relative group">
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-brand-primary transition-all cursor-pointer min-w-[140px]"
                    >
                      <option value="">{filter.label}</option>
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={filter.label}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                    className="pl-4 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-brand-primary transition-all min-w-[160px]"
                  />
                )}
              </div>
            ))}
            {hasActiveFilters && onClearFilters && (
              <button onClick={onClearFilters} className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${col.className}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  ))}
                </tr>
              ))
            ) : !isValidData || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Inbox size={32} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-500">No records discovered</p>
                      <p className="text-xs font-medium max-w-[200px] mx-auto text-gray-400">
                        {hasActiveFilters ? "Try adjusting your filters." : "This directory is currently empty."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} onClick={() => onRowClick?.(item)} className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
                  {columns.map((col, j) => (
                    <td key={j} className={`px-6 py-5 ${col.className}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}