import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from 'react-icons/ri';

const ICONS = {
  success: RiCheckLine,
  error: RiErrorWarningLine,
  warning: RiErrorWarningLine,
  info: RiInformationLine,
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      className="toast-region"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type] ?? ICONS.info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <Icon size={18} className="toast-icon" aria-hidden="true" />
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <RiCloseLine size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
