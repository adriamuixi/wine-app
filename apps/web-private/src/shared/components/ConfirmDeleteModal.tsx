type ConfirmDeleteModalProps = {
  open: boolean
  eyebrow: string
  title: string
  description: string
  error: string | null
  cancelLabel: string
  confirmLabel: string
  submitting: boolean
  modalId: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  open,
  eyebrow,
  title,
  description,
  error,
  cancelLabel,
  confirmLabel,
  submitting,
  modalId,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop wine-delete-backdrop" role="presentation" onClick={onClose}>
      <section
        className="confirm-modal wine-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="confirm-modal-header">
          <p className="eyebrow">{eyebrow}</p>
          <h3 id={modalId}>{title}</h3>
          <p className="muted">{description}</p>
        </header>
        {error ? <p className="error-message">{error}</p> : null}
        <footer className="confirm-modal-actions">
          <button type="button" className="ghost-button" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </button>
          <button type="button" className="secondary-button" onClick={onConfirm} disabled={submitting}>
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  )
}
