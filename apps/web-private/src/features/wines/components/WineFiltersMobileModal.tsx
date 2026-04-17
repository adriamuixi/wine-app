import type { ReactNode } from 'react'

type WineFiltersMobileModalProps = {
  open: boolean
  t: (key: string) => string
  content: ReactNode
  onClearFilters?: () => void
  onClose: () => void
}

export function WineFiltersMobileModal({ open, t, content, onClearFilters, onClose }: WineFiltersMobileModalProps) {
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
          <div className="wine-mobile-filters-header-actions">
            {onClearFilters ? (
              <button type="button" className="ghost-button small" onClick={onClearFilters}>
                {t('ui.clear_filters')}
              </button>
            ) : null}
            <button type="button" className="ghost-button small" onClick={onClose}>
              {t('ui.close')}
            </button>
          </div>
        </header>
        <div className="wine-mobile-filters-content">
          {content}
        </div>
      </section>
    </div>
  )
}
