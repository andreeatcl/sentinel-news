import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./Button";
import { CloseIcon } from "./icons";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen = true,
  onClose,
  title,
  subtitle,
  headerActions,
  footer,
  width = "md",
  zIndex = "z-[2000]",
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 animate-fade-in`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${WIDTHS[width]} max-h-[85vh] flex flex-col bg-carbon-900 border border-carbon-800 rounded-xl shadow-panel animate-pop-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-carbon-800 shrink-0">
          <div className="min-w-0 pt-0.5">
            <h2 className="text-base font-semibold text-white leading-snug">
              {title}
            </h2>
            {subtitle && (
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-carbon-400 mt-1">
                {subtitle}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 -mr-2 -mt-1 shrink-0">
            {headerActions}
            <IconButton label="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-carbon-800 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
