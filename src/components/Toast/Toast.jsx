import { useEffect } from "react";
import "./Toast.css";

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span>{toast.type === "error" ? "!" : "✓"}</span>
      <p>{toast.message}</p>
      <button type="button" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
};

export default Toast;
