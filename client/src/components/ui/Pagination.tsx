import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 bg-white ${className}`}
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
            <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalItems}</span> results
          </p>
        </div>

        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-1.5 rounded-l-xl border border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="relative inline-flex items-center px-3 py-1.5 border-t border-b border-slate-300 bg-white text-xs font-semibold text-slate-700">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-1.5 rounded-r-xl border border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

