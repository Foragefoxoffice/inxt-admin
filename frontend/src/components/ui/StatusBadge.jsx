const colors = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  open: 'bg-blue-100 text-blue-700',
  closed: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  unsubscribed: 'bg-slate-100 text-slate-600',
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-green-100 text-green-700',
  news: 'bg-slate-100 text-slate-600',
  event: 'bg-primary-100 text-primary-700'
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

export default StatusBadge;
