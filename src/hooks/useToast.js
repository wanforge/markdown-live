import { useCallback, useRef, useState } from 'react';

let nextId = 0;

/**
 * Lightweight toast notification hook.
 * Returns { toasts, toast } where toast(message, type?, duration?) adds a notification.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type }]);
      timersRef.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return { toasts, toast, dismiss };
}
