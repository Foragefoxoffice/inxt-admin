import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {message && <p className="text-slate-500 text-sm mt-1">{message}</p>}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onClose} className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
