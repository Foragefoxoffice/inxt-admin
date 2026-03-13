import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No results found', description = 'Try adjusting your search or filters.', action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <div>
      <h3 className="text-slate-700 font-semibold text-lg">{title}</h3>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
