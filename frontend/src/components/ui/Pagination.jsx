import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Page {page} of {pages} ({pagination.total} total)
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const pg = i + 1;
          return (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                pg === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {pg}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
