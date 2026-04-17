import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, perPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / perPage);
  
  if (totalPages <= 1) return null; 

  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{((currentPage - 1) * perPage) + 1}</span> to{' '}
        <span className="font-semibold text-slate-700">
          {Math.min(currentPage * perPage, totalItems)}
        </span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all text-slate-600"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {getPages().map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="px-3 py-2 text-slate-400"><MoreHorizontal size={14}/></span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  currentPage === page
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                    : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all text-slate-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;