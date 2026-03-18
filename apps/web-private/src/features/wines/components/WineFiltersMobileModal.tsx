import type { ReactNode } from 'react'

type WineFiltersMobileModalProps = {
  open: boolean
  t: (key: string) => string
  content: ReactNode
  onClose: () => void
}

export function WineFiltersMobileModal({ open, t, content, onClose }: WineFiltersMobileModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop wine-mobile-filters-backdrop" role="presentation" onClick={onClose}>
      <section
        className="wine-mobile-filters-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wine-mobile-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="wine-mobile-filters-header">
          <div>
            <p className="eyebrow">{t('ui.filters_section')}</p>
            <h3 id="wine-mobile-filters-title">{t('ui.filter_wines')}</h3>
          </div>
          <button type="button" className="ghost-button small" onClick={onClose}>
            {t('ui.close')}
          </button>
        </header>
        <div className="wine-mobile-filters-content">
          {content}
        </div>
      </section>
    </div>
  )
}
