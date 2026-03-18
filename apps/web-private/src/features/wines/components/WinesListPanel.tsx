import type { ReactNode, SyntheticEvent } from 'react'
import type { Locale } from '../../../i18n/messages'
import type { WineItem } from '../types'

type WinesListPanelProps = {
  t: (key: string, params?: Record<string, number>) => string
  labels: {
    dashboard: {
      search: {
        eyebrow: string
        title: string
        results: string
      }
      table: {
        wine: string
        type: string
        avg: string
      }
    }
  }
  locale: Locale
  wineItems: WineItem[]
  wineListStatus: 'idle' | 'loading' | 'ready' | 'error'
  wineListError: string | null
  wineTotalItems: number
  wineTotalPages: number
  winePage: number
  wineLimit: number
  wineHasPrev: boolean
  wineHasNext: boolean
  wineActiveFiltersCount: number
  isMobileViewport: boolean
  onOpenWineCreate: () => void
  onOpenWineMobileFilters: () => void
  onSetWinePage: (nextValue: number | ((current: number) => number)) => void
  onSetWineLimit: (nextValue: number) => void
  onOpenWineSheet: (wine: WineItem) => void
  onOpenWineGallery: (wine: WineItem) => void
  onOpenWineEdit: (wine: WineItem) => void
  onOpenWineDeleteConfirm: (wine: WineItem) => void
  renderWineFiltersDesktop: ReactNode
  countryFlagPath: (country: string) => string | null
  countryFlagEmoji: (country: string) => string
  localizedCountryName: (country: string, locale: Locale) => string
  doLogoPathFromImageName: (imageName: string | null) => string | null
  regionLogoPathFromImageName: (imageName: string | null) => string | null
  medalToneFromScore: (score: number | null) => string
  wineTypeLabel: (type: WineItem['type']) => string
  labelForAgingType: (value: WineItem['agingType'], locale: Locale) => string
  fallbackToDefaultWineIcon: (event: SyntheticEvent<HTMLImageElement>) => void
  fallbackToAdminAsset: (event: SyntheticEvent<HTMLImageElement>) => void
}

export function WinesListPanel({
  t,
  labels,
  locale,
  wineItems,
  wineListStatus,
  wineListError,
  wineTotalItems,
  wineTotalPages,
  winePage,
  wineLimit,
  wineHasPrev,
  wineHasNext,
  wineActiveFiltersCount,
  isMobileViewport,
  onOpenWineCreate,
  onOpenWineMobileFilters,
  onSetWinePage,
  onSetWineLimit,
  onOpenWineSheet,
  onOpenWineGallery,
  onOpenWineEdit,
  onOpenWineDeleteConfirm,
  renderWineFiltersDesktop,
  countryFlagPath,
  countryFlagEmoji,
  localizedCountryName,
  doLogoPathFromImageName,
  regionLogoPathFromImageName,
  medalToneFromScore,
  wineTypeLabel,
  labelForAgingType,
  fallbackToDefaultWineIcon,
  fallbackToAdminAsset,
}: WinesListPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{labels.dashboard.search.eyebrow}</p>
            <h3>{labels.dashboard.search.title}</h3>
          </div>
          <div className="panel-header-actions">
            <span className="pill">
              {wineTotalItems} {labels.dashboard.search.results}
            </span>
            {isMobileViewport ? (
              <button
                type="button"
                className="secondary-button small wine-mobile-filters-trigger"
                onClick={onOpenWineMobileFilters}
              >
                {t('ui.filters')}
                <span className="wine-mobile-filters-trigger-count">
                  {wineActiveFiltersCount}
                </span>
              </button>
            ) : null}
            <button type="button" className="primary-button" onClick={onOpenWineCreate}>
              {t('ui.create_new_wine')}
            </button>
          </div>
        </div>

        {!isMobileViewport ? <div className="wine-filters-desktop">{renderWineFiltersDesktop}</div> : null}

        {wineListStatus === 'error' ? (
          <div className="api-doc-state api-doc-state-error">
            <p>{t('ui.not_could_load_list_wines')}</p>
            {wineListError ? <p className="api-doc-error-detail">{wineListError}</p> : null}
          </div>
        ) : null}

        <div className="table-wrap">
          <table className="wine-table">
            <thead>
              <tr>
                <th aria-label="Photo" />
                <th>{labels.dashboard.table.wine}</th>
                <th>{labels.dashboard.table.type}</th>
                <th className="wine-col-region-header">{t('ui.country_production')}</th>
                <th>{t('ui.vintage_label')}</th>
                <th className="wine-col-do-header">{t('common.doAbbreviation')}</th>
                <th>{labels.dashboard.table.avg}</th>
                <th>{t('ui.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {wineItems.map((wine) => {
                const doCommunityFlagPath = wine.regionLogo ? regionLogoPathFromImageName(wine.regionLogo) : null
                const scoreTone = medalToneFromScore(wine.averageScore)
                return (
                  <tr
                    key={wine.id}
                    className="wine-row-clickable"
                    tabIndex={0}
                    onClick={() => onOpenWineSheet(wine)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onOpenWineSheet(wine)
                      }
                    }}
                  >
                    <td className="wine-thumb-cell">
                      <img
                        src={wine.thumbnailSrc}
                        alt={`${wine.name} thumbnail`}
                        className="wine-thumb"
                        loading="lazy"
                        onError={fallbackToDefaultWineIcon}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenWineGallery(wine)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            onOpenWineGallery(wine)
                          }
                        }}
                      />
                      {wine.averageScore == null ? null : (
                        <span className={`wine-score-chip wine-thumb-score ${scoreTone}`}>
                          <strong>{Number.isInteger(wine.averageScore) ? wine.averageScore.toFixed(0) : wine.averageScore.toFixed(1)}</strong>
                          <small>/100</small>
                        </span>
                      )}
                    </td>
                    <td className="wine-col-main" data-label={labels.dashboard.table.wine}>
                      <strong>{wine.name}</strong>
                      <span>{wine.winery}</span>
                    </td>
                    <td className="wine-col-type" data-label={labels.dashboard.table.type}>
                      <span className="wine-cell-value">{wineTypeLabel(wine.type)}</span>
                    </td>
                    <td className="wine-col-region" data-label={t('ui.country_production')}>
                      <span className="wine-country-chip">
                        {countryFlagPath(wine.country) ? (
                          <img
                            className="wine-country-flag"
                            src={countryFlagPath(wine.country) as string}
                            alt={localizedCountryName(wine.country, locale)}
                            loading="lazy"
                            onError={fallbackToAdminAsset}
                          />
                        ) : (
                          <span className="wine-country-emoji" aria-hidden="true">{countryFlagEmoji(wine.country)}</span>
                        )}
                        <span className="wine-country-name">{localizedCountryName(wine.country, locale)}</span>
                      </span>
                    </td>
                    <td className="wine-col-vintage" data-label={t('ui.vintage_label')}>
                      <span className="wine-cell-value">{wine.vintageYear ?? '-'}</span>
                    </td>
                    <td className="wine-col-aging" data-label={t('ui.crianza')}>
                      <span className="wine-cell-value">{labelForAgingType(wine.agingType, locale)}</span>
                    </td>
                    <td className="wine-col-do" data-label={t('common.doAbbreviation')}>
                      {wine.doName ? (
                        <span className="wine-do-chip">
                          <span className="wine-do-value">{wine.doName}</span>
                          <span className="wine-do-icons" aria-hidden="true">
                            {doCommunityFlagPath ? (
                              <img
                                src={doCommunityFlagPath}
                                alt=""
                                className="wine-do-community-flag"
                                loading="lazy"
                                aria-hidden="true"
                                onError={fallbackToAdminAsset}
                              />
                            ) : null}
                            {doLogoPathFromImageName(wine.doLogo) ? (
                              <img
                                src={doLogoPathFromImageName(wine.doLogo) as string}
                                alt=""
                                className="wine-do-logo"
                                loading="lazy"
                                aria-hidden="true"
                                onError={fallbackToAdminAsset}
                              />
                            ) : null}
                          </span>
                        </span>
                      ) : <span className="wine-do-value">-</span>}
                    </td>
                    <td className="wine-col-score" data-label={labels.dashboard.table.avg}>
                      {wine.averageScore == null ? '-' : (
                        <span className={`wine-score-chip ${scoreTone}`}>
                          <strong>{Number.isInteger(wine.averageScore) ? wine.averageScore.toFixed(0) : wine.averageScore.toFixed(1)}</strong>
                          <small>/100</small>
                        </span>
                      )}
                    </td>
                    <td className="wine-col-actions" data-label={t('ui.actions')}>
                      <div className="wine-actions-wrap">
                        <button
                          type="button"
                          className="table-icon-button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenWineEdit(wine)
                          }}
                          title={t('ui.edit_wine')}
                          aria-label={t('ui.edit_wine')}
                        >
                          <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                              d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.62-9.62.92.92-9.62 9.62zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="table-icon-button danger"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenWineDeleteConfirm(wine)
                          }}
                          title={t('ui.delete_wine')}
                          aria-label={t('ui.delete_wine')}
                        >
                          <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 12h8a2 2 0 0 0 2-2V8H6v11a2 2 0 0 0 2 2z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {wineListStatus === 'loading' ? (
                <tr>
                  <td colSpan={8}>{t('ui.loading_wines')}</td>
                </tr>
              ) : null}
              {wineListStatus === 'ready' && wineItems.length === 0 ? (
                <tr>
                  <td colSpan={8}>{t('ui.not_found_wines')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-meta">
            {t('common.paginationSummary', {
              page: winePage,
              totalPages: wineTotalPages || 1,
              totalItems: wineTotalItems,
              shownItems: wineItems.length,
            })}
          </div>
          <div className="pagination-actions">
            <label className="pagination-limit-inline">
              <span>{t('ui.limit')}</span>
              <select
                value={String(wineLimit)}
                onChange={(event) => {
                  onSetWineLimit(Number(event.target.value))
                  onSetWinePage(1)
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <button
              type="button"
              className="secondary-button small"
              disabled={!wineHasPrev || wineListStatus === 'loading'}
              onClick={() => onSetWinePage((current) => Math.max(1, current - 1))}
            >
              {t('common.previous')}
            </button>
            <button
              type="button"
              className="secondary-button small"
              disabled={!wineHasNext || wineListStatus === 'loading'}
              onClick={() => onSetWinePage((current) => current + 1)}
            >
              {t('ui.next')}
            </button>
          </div>
        </div>
      </section>
    </section>
  )
}
