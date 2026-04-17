import type { FormEventHandler } from 'react'
import type { GrapeEditDraft } from '../types'

type GrapeEditModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  t: (key: string) => string
  title: string
  formId?: string
  draft: GrapeEditDraft | null
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onNameChange: (value: string) => void
  onColorChange: (value: GrapeEditDraft['color']) => void
}

export function GrapeEditModal({
  open,
  mode,
  t,
  title,
  formId = 'grape-edit-form',
  draft,
  submitting,
  error,
  onClose,
  onSubmit,
  onNameChange,
  onColorChange,
}: GrapeEditModalProps) {
  if (!open) {
    return null
  }

  const eyebrow = mode === 'create' ? t('ui.create_grape') : t('ui.edit_grape')
  const submitLabel = mode === 'create'
    ? (submitting ? t('ui.creating_grape') : t('ui.save'))
    : (submitting ? t('ui.saving_changes') : t('ui.save_changes'))

  return (
    <div className="modal-backdrop wine-delete-backdrop do-edit-backdrop" role="presentation" onClick={onClose}>
      <section
        className="confirm-modal grape-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-grape-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="confirm-modal-header">
          <p className="eyebrow">{eyebrow}</p>
          <h3 id="edit-grape-title">{title}</h3>
        </header>
        <form id={formId} className="stack-form grape-edit-form" onSubmit={onSubmit}>
          <div className="inline-grid triple grape-edit-grid">
            <label>
              {t('ui.name')}
              <input
                name="name"
                type="text"
                value={draft?.name ?? ''}
                onChange={(event) => onNameChange(event.target.value)}
                required
              />
            </label>
            <label>
              {t('ui.color')}
              <select
                name="color"
                value={draft?.color ?? 'red'}
                onChange={(event) => onColorChange(event.target.value as GrapeEditDraft['color'])}
              >
                <option value="red">{t('ui.reds')}</option>
                <option value="white">{t('ui.whites')}</option>
              </select>
            </label>
          </div>
          {error ? <p className="error-message">{error}</p> : null}
          <footer className="confirm-modal-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={submitting}>
              {t('ui.cancel')}
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

