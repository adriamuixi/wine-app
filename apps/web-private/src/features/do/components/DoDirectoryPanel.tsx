import type { ChangeEventHandler, ReactNode } from 'react'
import { WineFiltersMobileModal } from '../../wines/components/WineFiltersMobileModal'
import type { CountryFilterValue, DoSortPresetKey } from '../types'

type DoSortOption = {
  key: DoSortPresetKey
  label: string
}

type DoDirectoryPanelProps = {
  t: (key: string) => string
  labels: {
    dos: {
      list: {
        eyebrow: string
        title: string
        results: string
        createAction: string
      }
    }
    dashboard: {
      table: {
        region: string
      }
    }
  }
  doDirectoryItemsLength: number
  doSortPreset: DoSortPresetKey
  doSortPresetOptions: DoSortOption[]
  doListNameFilter: string
  doListCountryFilter: CountryFilterValue
  doListRegionFilter: string
  sortedDoRegionFilterOptions: string[]
  countryFilterValues: Exclude<CountryFilterValue, 'all'>[]
  showCreateButton?: boolean
  isMobileViewport: boolean
  isFiltersMobileOpen: boolean
  activeFiltersCount: number
  doDirectoryRows: ReactNode
  onDoSortPresetChange: (nextValue: DoSortPresetKey) => void
  onOpenDoCreate: () => void
  onOpenMobileFilters: () => void
  onCloseMobileFilters: () => void
  onClearMobileFilters: () => void
  onDoListNameFilterChange: ChangeEventHandler<HTMLInputElement>
  onDoListCountryFilterChange: (nextValue: CountryFilterValue) => void
  onDoListRegionFilterChange: (nextValue: string) => void
  countryCodeToLabel: (countryCode: Exclude<CountryFilterValue, 'all'>) => string
}

export function DoDirectoryPanel({
  t,
  labels,
  doDirectoryItemsLength,
  doSortPreset,
  doSortPresetOptions,
  doListNameFilter,
  doListCountryFilter,
  doListRegionFilter,
  sortedDoRegionFilterOptions,
  countryFilterValues,
  showCreateButton = true,
  isMobileViewport,
  isFiltersMobileOpen,
  activeFiltersCount,
  doDirectoryRows,
  onDoSortPresetChange,
  onOpenDoCreate,
  onOpenMobileFilters,
  onCloseMobileFilters,
  onClearMobileFilters,
  onDoListNameFilterChange,
  onDoListCountryFilterChange,
  onDoListRegionFilterChange,
  countryCodeToLabel,
}: DoDirectoryPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/do.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{labels.dos.list.eyebrow}</p>
              <h3>{labels.dos.list.title}</h3>
            </div>
          </div>
          <div className={`panel-header-actions${isMobileViewport ? ' do-directory-mobile-toolbar' : ''}`}>
            <span className="pill">
              {doDirectoryItemsLength} {labels.dos.list.results}
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
                      value={doSortPreset}
                      onChange={(event) => onDoSortPresetChange(event.target.value as DoSortPresetKey)}
                    >
                      {doSortPresetOptions.map((option) => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                      ))}
                    </select>
                    <span className="do-sort-caret" aria-hidden="true">▾</span>
                  </div>
                </label>
                {showCreateButton ? (
                  <button type="button" className="primary-button" onClick={onOpenDoCreate}>
                    {labels.dos.list.createAction}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="inline-grid triple do-directory-filter-grid do-directory-filter-grid-desktop">
          <label className="do-directory-filter-field">
            {t('ui.filter_by_name')}
            <input
              type="search"
              value={doListNameFilter}
              placeholder={t('ui.eg_rioja')}
              onChange={onDoListNameFilterChange}
            />
          </label>
          <label className="do-directory-filter-field">
            {t('ui.filter_by_country')}
            <select
              value={doListCountryFilter}
              onChange={(event) => onDoListCountryFilterChange(event.target.value as CountryFilterValue)}
            >
              <option value="all">{t('ui.all_countries')}</option>
              {countryFilterValues.map((countryCode) => (
                <option key={countryCode} value={countryCode}>{countryCodeToLabel(countryCode)}</option>
              ))}
            </select>
          </label>
          <label className="do-directory-filter-field">
            {t('ui.filter_by_region')}
            <select
              value={doListRegionFilter}
              onChange={(event) => onDoListRegionFilterChange(event.target.value)}
            >
              <option value="">{t('ui.all_regions')}</option>
              {sortedDoRegionFilterOptions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
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
              <label className="do-directory-filter-field">
                {t('ui.filter_by_name')}
                <input
                  type="search"
                  value={doListNameFilter}
                  placeholder={t('ui.eg_rioja')}
                  onChange={onDoListNameFilterChange}
                />
              </label>
              <label className="do-directory-filter-field">
                {t('ui.filter_by_country')}
                <select
                  value={doListCountryFilter}
                  onChange={(event) => onDoListCountryFilterChange(event.target.value as CountryFilterValue)}
                >
                  <option value="all">{t('ui.all_countries')}</option>
                  {countryFilterValues.map((countryCode) => (
                    <option key={countryCode} value={countryCode}>{countryCodeToLabel(countryCode)}</option>
                  ))}
                </select>
              </label>
              <label className="do-directory-filter-field">
                {t('ui.filter_by_region')}
                <select
                  value={doListRegionFilter}
                  onChange={(event) => onDoListRegionFilterChange(event.target.value)}
                >
                  <option value="">{t('ui.all_regions')}</option>
                  {sortedDoRegionFilterOptions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label className="do-sort-select do-sort-select-mobile">
                <span className="do-sort-label">{t('ui.order')}</span>
                <div className="do-sort-select-wrap">
                  <select
                    value={doSortPreset}
                    onChange={(event) => onDoSortPresetChange(event.target.value as DoSortPresetKey)}
                  >
                    {doSortPresetOptions.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                  <span className="do-sort-caret" aria-hidden="true">▾</span>
                </div>
              </label>
            </div>
          )}
        />

        <div className="table-wrap">
          <table className="wine-table do-directory-table">
            <thead>
              <tr>
                <th>{t('common.logo')}</th>
                <th>{t('ui.name')}</th>
                <th>{labels.dashboard.table.region}</th>
                <th>{t('common.country')}</th>
                <th>{t('ui.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {doDirectoryRows}
              {doDirectoryItemsLength === 0 ? (
                <tr>
                  <td colSpan={5}>{t('ui.no_do_available')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
