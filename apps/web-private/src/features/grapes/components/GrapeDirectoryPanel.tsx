import type { ChangeEventHandler, ReactNode } from 'react'
import { WineFiltersMobileModal } from '../../wines/components/WineFiltersMobileModal'
import type { GrapeColorFilter, GrapeSortPresetKey } from '../types'

type GrapeSortOption = {
  key: GrapeSortPresetKey
  label: string
}

type GrapeDirectoryPanelProps = {
  t: (key: string) => string
  labels: {
    grapes: {
      list: {
        eyebrow: string
        title: string
        results: string
        createAction: string
      }
    }
  }
  grapeDirectoryItemsLength: number
  grapeSortPreset: GrapeSortPresetKey
  grapeSortPresetOptions: GrapeSortOption[]
  grapeListNameFilter: string
  grapeListColorFilter: GrapeColorFilter
  showCreateButton?: boolean
  isMobileViewport: boolean
  isFiltersMobileOpen: boolean
  activeFiltersCount: number
  grapeDirectoryRows: ReactNode
  onGrapeSortPresetChange: (nextValue: GrapeSortPresetKey) => void
  onOpenGrapeCreate: () => void
  onOpenMobileFilters: () => void
  onCloseMobileFilters: () => void
  onClearMobileFilters: () => void
  onGrapeListNameFilterChange: ChangeEventHandler<HTMLInputElement>
  onGrapeListColorFilterChange: (nextValue: GrapeColorFilter) => void
}

export function GrapeDirectoryPanel({
  t,
  labels,
  grapeDirectoryItemsLength,
  grapeSortPreset,
  grapeSortPresetOptions,
  grapeListNameFilter,
  grapeListColorFilter,
  showCreateButton = true,
  isMobileViewport,
  isFiltersMobileOpen,
  activeFiltersCount,
  grapeDirectoryRows,
  onGrapeSortPresetChange,
  onOpenGrapeCreate,
  onOpenMobileFilters,
  onCloseMobileFilters,
  onClearMobileFilters,
  onGrapeListNameFilterChange,
  onGrapeListColorFilterChange,
}: GrapeDirectoryPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/grapes_basket.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{labels.grapes.list.eyebrow}</p>
              <h3>{labels.grapes.list.title}</h3>
            </div>
          </div>
          <div className={`panel-header-actions${isMobileViewport ? ' do-directory-mobile-toolbar' : ''}`}>
            <span className="pill">
              {grapeDirectoryItemsLength} {labels.grapes.list.results}
            </span>
            {isMobileViewport ? (
              <button type="button" className="secondary-button small wine-mobile-filters-trigger" onClick={onOpenMobileFilters}>
                {t('ui.filters')}
                <span className="wine-mobile-filters-trigger-count">{activeFiltersCount}</span>
              </button>
            ) : (
              <>
                <label className="do-sort-select">
                  <span className="do-sort-label">{t('ui.order')}</span>
                  <span className="do-sort-field" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M7 6h10" />
                      <path d="M7 12h7" />
                      <path d="M7 18h4" />
                      <path d="m16 15 2.5 3 2.5-3" />
                    </svg>
                  </span>
                  <div className="do-sort-select-wrap">
                    <select
                      value={grapeSortPreset}
                      onChange={(event) => onGrapeSortPresetChange(event.target.value as GrapeSortPresetKey)}
                    >
                      {grapeSortPresetOptions.map((option) => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                      ))}
                    </select>
                    <span className="do-sort-caret" aria-hidden="true">▾</span>
                  </div>
                </label>
                {showCreateButton ? (
                  <button type="button" className="primary-button" onClick={onOpenGrapeCreate}>
                    {labels.grapes.list.createAction}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="inline-grid do-directory-filter-grid do-directory-filter-grid-grapes">
          <label className="do-directory-filter-field">
            {t('ui.filter_by_name')}
            <input
              type="search"
              value={grapeListNameFilter}
              placeholder={t('ui.eg_tempranillo')}
              onChange={onGrapeListNameFilterChange}
            />
          </label>
          <label className="do-directory-filter-field">
            {t('ui.filter_by_color')}
            <select
              value={grapeListColorFilter}
              onChange={(event) => onGrapeListColorFilterChange(event.target.value as GrapeColorFilter)}
            >
              <option value="all">{t('ui.all_colors')}</option>
              <option value="red">{t('ui.reds')}</option>
              <option value="white">{t('ui.whites')}</option>
            </select>
          </label>
        </div>

        <WineFiltersMobileModal
          open={isMobileViewport && isFiltersMobileOpen}
          t={t}
          onClearFilters={onClearMobileFilters}
          onClose={onCloseMobileFilters}
          content={(
            <div className="do-mobile-filters-sheet">
              <label className="do-sort-select do-sort-select-mobile">
                <span className="do-sort-label">{t('ui.order')}</span>
                <div className="do-sort-select-wrap">
                  <select
                    value={grapeSortPreset}
                    onChange={(event) => onGrapeSortPresetChange(event.target.value as GrapeSortPresetKey)}
                  >
                    {grapeSortPresetOptions.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                  <span className="do-sort-caret" aria-hidden="true">▾</span>
                </div>
              </label>
              <label className="do-directory-filter-field">
                {t('ui.filter_by_name')}
                <input
                  type="search"
                  value={grapeListNameFilter}
                  placeholder={t('ui.eg_tempranillo')}
                  onChange={onGrapeListNameFilterChange}
                />
              </label>
              <label className="do-directory-filter-field">
                {t('ui.filter_by_color')}
                <select
                  value={grapeListColorFilter}
                  onChange={(event) => onGrapeListColorFilterChange(event.target.value as GrapeColorFilter)}
                >
                  <option value="all">{t('ui.all_colors')}</option>
                  <option value="red">{t('ui.reds')}</option>
                  <option value="white">{t('ui.whites')}</option>
                </select>
              </label>
            </div>
          )}
        />

        <div className="table-wrap">
          <table className="wine-table grape-directory-table">
            <thead>
              <tr>
                <th>{t('ui.name')}</th>
                <th>{t('ui.color')}</th>
                <th>{t('ui.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {grapeDirectoryRows}
              {grapeDirectoryItemsLength === 0 ? (
                <tr>
                  <td colSpan={3}>{t('ui.no_grapes_available')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
