function Modal({
  open,
  title,
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true">
      <div>
        <div>
          <h2>{title}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;