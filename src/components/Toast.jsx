import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-sans min-w-[260px] animate-fade-in
      ${isSuccess ? 'bg-card border-gold text-primary' : 'bg-card border-red-500 text-red-400'}`}>
      {isSuccess
        ? <CheckCircle size={16} className="text-gold shrink-0" />
        : <XCircle size={16} className="text-red-500 shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-muted hover:text-primary">
        <X size={14} />
      </button>
    </div>
  );
}
