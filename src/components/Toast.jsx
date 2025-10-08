import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle2 : Info;

  return (
    <div className="fixed top-4 right-4 z-[200]">
      <div className={`${styles[type] || styles.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px]`}>
        <Icon className="w-5 h-5" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded" aria-label="Đóng thông báo">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
