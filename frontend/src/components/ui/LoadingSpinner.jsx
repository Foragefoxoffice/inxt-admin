const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-3 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="flex-1 h-4 bg-slate-200 rounded" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
