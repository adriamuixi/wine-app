import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import type { SortKey, ThemeMode, WineCard } from '../types'
import CatalogOverlays from './CatalogOverlays'

type ActiveMobileFilter = {
  key: string
  label: string
  onRemove: () => void
}

type DoLogoPreview = { src: string; label: string } | null

type Props = {
  activeMobileFilters: ActiveMobileFilter[]
  activeModalImageIndex: number
  adminHref: string
  autonomousCommunityNameForRegion: (region: string) => string | null
  closeSelectedWineModal: () => void
  countryFlagEmoji: (country: string) => string
  countryFlagPath: (country: string) => string | null
  defaultPublicWineImageForTheme: (isDark: boolean) => string
  desktopNav: ReactNode
  doLogoPreview: DoLogoPreview
  euro: Intl.NumberFormat
  filteredWines: WineCard[]
  filterControls: ReactNode
  filterControlsCore: ReactNode
  galleryPhotoLabels: string[]
  isDark: boolean
  isMobileFiltersOpen: boolean
  isMobileMenuOpen: boolean
  isMobileSortOpen: boolean
  locale: Locale
  localeLabels: Record<Locale, string>
  localizedCountryName: (country: string, locale: Locale) => string
  logoSrc: string
  mobileViewMode: 'card' | 'list'
  resetFilters: () => void
  resolvePublicWineImageForTheme: (src: string, isDark: boolean) => string
  selectedWine: WineCard | null
  setActiveModalImageIndex: Dispatch<SetStateAction<number>>
  setDoLogoPreview: Dispatch<SetStateAction<DoLogoPreview>>
  setGrapeFilter: Dispatch<SetStateAction<string>>
  setIsMobileFiltersOpen: Dispatch<SetStateAction<boolean>>
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>
  setIsMobileSortOpen: Dispatch<SetStateAction<boolean>>
  setLocale: Dispatch<SetStateAction<Locale>>
  setMobileViewMode: Dispatch<SetStateAction<'card' | 'list'>>
  setSelectedWineId: Dispatch<SetStateAction<number | null>>
  setSortKey: Dispatch<SetStateAction<SortKey>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  sortKey: SortKey
  splitGrapeVarieties: (grapes: string) => string[]
  t: PublicMessages
  theme: ThemeMode
  defaultSort: SortKey
}

export default function CatalogPageView({
  activeMobileFilters,
  activeModalImageIndex,
  adminHref,
  autonomousCommunityNameForRegion,
  closeSelectedWineModal,
  countryFlagEmoji,
  countryFlagPath,
  defaultPublicWineImageForTheme,
  desktopNav,
  doLogoPreview,
  euro,
  filteredWines,
  filterControls,
  filterControlsCore,
  galleryPhotoLabels,
  isDark,
  isMobileFiltersOpen,
  isMobileMenuOpen,
  isMobileSortOpen,
  locale,
  localeLabels,
  localizedCountryName,
  logoSrc,
  mobileViewMode,
  resetFilters,
  resolvePublicWineImageForTheme,
  selectedWine,
  setActiveModalImageIndex,
  setDoLogoPreview,
  setGrapeFilter,
  setIsMobileFiltersOpen,
  setIsMobileMenuOpen,
  setIsMobileSortOpen,
  setLocale,
  setMobileViewMode,
  setSelectedWineId,
  setSortKey,
  setTheme,
  sortKey,
  splitGrapeVarieties,
  t,
  theme,
  defaultSort,
}: Props) {
  const localeCodes = Object.keys(localeLabels) as Locale[]
  const toggleLocale = () => {
    const currentIndex = localeCodes.indexOf(locale)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % localeCodes.length : 0
    setLocale(localeCodes[nextIndex] ?? localeCodes[0] ?? 'ca')
  }

  return (
    <main className="public-shell">
      <div className="public-background" aria-hidden="true" />

      <header className={`public-topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
        <div className="brand-block">
          <a className="brand-copy brand-home-link" href="/" onClick={() => setIsMobileMenuOpen(false)} aria-label={t.common.brandAlt}>
            <img src={logoSrc} className="brand-wordmark" alt={t.common.brandAlt} />
            <p>{t.common.appName}</p>
          </a>
        </div>
        {desktopNav}

        <div className="topbar-actions">
          <div className="topbar-mobile-quick-actions">
            <button
              type="button"
              className="topbar-mobile-bullet topbar-mobile-bullet-language"
              onClick={toggleLocale}
              aria-label={t.topbar.language}
              title={t.topbar.language}
            >
              <span>{locale.toUpperCase()}</span>
            </button>

            <button
              type="button"
              className="topbar-mobile-bullet topbar-mobile-bullet-theme"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              aria-pressed={isDark}
              aria-label={isDark ? t.topbar.light : t.topbar.dark}
              title={isDark ? t.topbar.light : t.topbar.dark}
            >
              <span className="topbar-mobile-icon" aria-hidden="true">
                {isDark ? (
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <path
                      d="M14.8 12.8A6.3 6.3 0 0 1 7.2 5.2a6.8 6.8 0 1 0 7.6 7.6Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 2.6v2.1M10 15.3v2.1M2.6 10h2.1M15.3 10h2.1M4.7 4.7l1.5 1.5M13.8 13.8l1.5 1.5M15.3 4.7l-1.5 1.5M6.2 13.8l-1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            aria-label={isDark ? t.topbar.light : t.topbar.dark}
          >
            <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
            <span>{isDark ? t.topbar.dark : t.topbar.light}</span>
          </button>

          <label className="select-wrap">
            <span className="sr-only">{t.topbar.language}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.topbar.language}>
              {Object.entries(localeLabels).map(([localeCode, label]) => (
                <option key={localeCode} value={localeCode}>{label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className={`mobile-header-icon-button${isMobileMenuOpen ? ' active' : ''}`}
            aria-label={t.topbar.menu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>

        <nav id="mobile-nav-menu" className={`mobile-nav-menu${isMobileMenuOpen ? ' open' : ''}`} aria-label={t.topbar.navigation}>
          <div className="mobile-nav-menu-head">
            <span>{t.topbar.navigation}</span>
            <button type="button" className="mobile-nav-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label={t.modal.close}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <a href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wines2_glass.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.winesCatalog}</span>
          </a>
          <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/grapes_region.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.doMap}</span>
          </a>
          <a href="/ruta-de-vins" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wine_maps2.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.wineRoute}</span>
          </a>
          <a href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wine_couple.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.whoWeAre}</span>
          </a>
          <a
            href={adminHref}
            onClick={() => {
              window.localStorage.setItem('wine-app-theme-mode', theme)
              setIsMobileMenuOpen(false)
            }}
          >
            <img src="/images/icons/wine/settings.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.backoffice}</span>
          </a>
        </nav>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label={t.topbar.closeFilters}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <section className="hero-panel" id="catalog">
        <div>
          <div className="section-heading-with-icon">
            <img src="/images/icons/wine/wines2_glass.png" className="section-heading-icon" alt="" aria-hidden="true" />
            <div className="section-heading-copy">
              <p className="eyebrow">{t.common.catalogEyebrow}</p>
              <h1 className="section-title-label">{t.common.title}</h1>
            </div>
          </div>
        </div>
        <section className="mobile-filter-dropdown" aria-label={t.filters.title}>
          <div className="mobile-filter-bar">
            <button
              type="button"
              className={`mobile-view-trigger${mobileViewMode === 'card' ? ' active' : ''}`}
              onClick={() => setMobileViewMode((mode) => (mode === 'card' ? 'list' : 'card'))}
              aria-label={mobileViewMode === 'card'
                ? t.topbar.switchToList
                : t.topbar.switchToCards}
              title={mobileViewMode === 'card'
                ? t.topbar.listView
                : t.topbar.cardView}
            >
              <span aria-hidden="true">◫</span>
            </button>

            <button
              type="button"
              className={`mobile-filter-trigger${isMobileFiltersOpen ? ' active' : ''}`}
              onClick={() => {
                setIsMobileSortOpen(false)
                setIsMobileFiltersOpen((open) => !open)
              }}
              aria-expanded={isMobileFiltersOpen}
              aria-controls="mobile-filters-panel"
            >
              <span className="mobile-filter-trigger-label">
                <span aria-hidden="true">{t.icons.filters}</span>
                <span className="mobile-filter-trigger-text">{t.filters.title}</span>
              </span>
              <span className="mobile-filter-trigger-meta">
                {filteredWines.length}
              </span>
            </button>

            <button
              type="button"
              className={`mobile-sort-trigger${isMobileSortOpen ? ' active' : ''}${sortKey !== defaultSort ? ' has-value' : ''}`}
              onClick={() => {
                setIsMobileFiltersOpen(false)
                setIsMobileSortOpen((open) => !open)
              }}
              aria-expanded={isMobileSortOpen}
              aria-controls="mobile-sort-panel"
              aria-label={`${t.filters.sort}: ${t.sort[sortKey]}`}
              title={`${t.filters.sort}: ${t.sort[sortKey]}`}
            >
              <span aria-hidden="true">{t.icons.sort}</span>
            </button>
          </div>

          {isMobileSortOpen ? (
            <button
              type="button"
              className="mobile-sort-backdrop"
              aria-label={t.modal.close}
              onClick={() => setIsMobileSortOpen(false)}
            />
          ) : null}

          {isMobileSortOpen ? (
            <div id="mobile-sort-panel" className="mobile-sort-panel" role="dialog" aria-label={t.filters.sort}>
              <div className="mobile-sort-panel-head">
                <span>{t.icons.sort} {t.filters.sort}</span>
                <button type="button" className="mobile-sort-close" onClick={() => setIsMobileSortOpen(false)} aria-label={t.modal.close}>
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <div className="mobile-sort-options" role="listbox" aria-label={t.filters.sort}>
                {(['score_desc', 'price_asc', 'price_desc', 'latest', 'tasting_date_desc', 'tasting_date_asc'] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`mobile-sort-option${sortKey === key ? ' active' : ''}`}
                    onClick={() => {
                      setSortKey(key)
                      setIsMobileSortOpen(false)
                    }}
                    role="option"
                    aria-selected={sortKey === key}
                  >
                    <span>{t.sort[key]}</span>
                    {sortKey === key ? <span aria-hidden="true">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!isMobileFiltersOpen && activeMobileFilters.length > 0 ? (
            <div className="mobile-filter-active-bar" aria-label={t.filters.activeFiltersAria}>
              <div className="mobile-filter-active-bar-head">
                <span className="mobile-filter-active-bar-title">
                  {t.filters.title} {t.filters.activeSuffix}
                </span>
                <button type="button" className="mobile-filter-active-clear" onClick={resetFilters}>
                  {t.filters.clear}
                </button>
              </div>
              <div className="mobile-filter-active-list">
                {activeMobileFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className="mobile-filter-active-chip"
                    onClick={filter.onRemove}
                    title={filter.label}
                    aria-label={`${filter.label} · ${t.common.removeAction}`}
                  >
                    <span className="mobile-filter-active-chip-text">{filter.label}</span>
                    <span className="mobile-filter-active-chip-x" aria-hidden="true">✕</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isMobileFiltersOpen ? (
            <button
              type="button"
              className="mobile-filters-backdrop"
              aria-label={t.topbar.closeFilters}
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          ) : null}

          <div id="mobile-filters-panel" className={`mobile-filter-panel${isMobileFiltersOpen ? ' open' : ''}`}>
            <div className="mobile-filter-panel-header">
              <div>
                <p className="eyebrow">{t.icons.filters} {t.filters.title}</p>
                <p className="mobile-filter-panel-meta">{filteredWines.length} {t.topbar.resultCount}</p>
              </div>
              <button
                type="button"
                className="mobile-filter-panel-close"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-label={t.topbar.closeFilters}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div className="mobile-filter-panel-content">
              {filterControlsCore}
            </div>

            <div className="mobile-filter-panel-footer">
              <button type="button" className="mobile-filter-footer-clear" onClick={resetFilters}>
                {t.filters.clear}
              </button>
            </div>
          </div>
        </section>
      </section>

      <section className="catalog-layout">
        <aside className="filters-panel">
          {filterControls}
        </aside>

        <section className="cards-panel">
          <div className={`cards-grid mobile-layout-${mobileViewMode}`}>
            {filteredWines.map((wine) => {
              const isFeatured = wine.avgScore >= 90
              const scoreTier = wine.avgScore >= 90 ? 'gold' : wine.avgScore >= 80 ? 'silver' : wine.avgScore >= 70 ? 'bronze' : 'base'
              const countryFlagImage = countryFlagPath(wine.country)
              const communityFlagImage = wine.country === 'Spain' ? wine.regionLogoImage ?? null : null
              const communityName = wine.country === 'Spain' ? autonomousCommunityNameForRegion(wine.region) : null

              return (
                <article
                  key={wine.id}
                  className={`wine-card ${isFeatured ? 'featured' : ''} score-tier-${scoreTier} mobile-view-${mobileViewMode}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedWineId(wine.id)
                    setActiveModalImageIndex(0)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedWineId(wine.id)
                      setActiveModalImageIndex(0)
                    }
                  }}
                >
                  <div className="wine-card-media">
                    <img
                      src={resolvePublicWineImageForTheme(wine.image, isDark)}
                      alt={wine.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                      }}
                    />
                    <div className="wine-card-overlay" />
                    <div className="wine-card-badges">
                      {isFeatured ? <span className="gold-chip">{t.card.featured90}</span> : null}
                      {wine.rewardBadgeImage ? (
                        <span className="wine-card-award-corner-tag" aria-label={`${wine.reward?.name ?? t.card.reward} ${wine.reward?.score ?? ''}`.trim()}>
                          <img src={wine.rewardBadgeImage} alt="" loading="lazy" />
                        </span>
                      ) : null}
                    </div>
                    {wine.country !== 'Spain' ? (
                      <span className="country-flag-badge wine-card-country-floating" aria-label={wine.country} title={wine.country}>
                        {countryFlagImage ? <img className="flag-badge-image" src={countryFlagImage} alt={localizedCountryName(wine.country, locale)} loading="lazy" /> : countryFlagEmoji(wine.country)}
                      </span>
                    ) : null}
                    <span className={`wine-card-score-floating wine-card-score-floating-${scoreTier}`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                      {wine.avgScore.toFixed(1)}
                    </span>
                  </div>

                  <div className="wine-card-body">
                    <div className="wine-card-head">
                      <div>
                        <h3>{wine.name}</h3>
                        <span className={`wine-type-pill wine-type-pill-${wine.type}`}>
                          <span className={`wine-type-pill-dot wine-type-pill-dot-${wine.type}`} aria-hidden="true">🍇</span>
                          <span>{t.wineType[wine.type]}</span>
                        </span>
                      </div>
                      <div className="score-award-stack">
                        <div className={`score-badge score-badge-${scoreTier}`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                          <strong>{wine.avgScore.toFixed(1)}</strong>
                          <span>{t.card.points}</span>
                        </div>
                      </div>
                    </div>

                    <section className="wine-card-info-section" aria-label={t.common.wineInfoAria}>
                      <p className="wine-card-info-title">{t.common.wineInfoTitle}</p>
                      <dl className="wine-card-meta">
                        <div className="wine-card-meta-box-do">
                          <dt>{t.icons.region} {t.common.doLabel}</dt>
                          <dd className="origin-with-do">
                            {communityFlagImage && communityName ? (
                              <span className="country-flag-badge" aria-label={`${t.common.autonomousCommunity} ${communityName}`} title={communityName}>
                                <img className="flag-badge-image" src={communityFlagImage} alt={communityName} loading="lazy" />
                              </span>
                            ) : null}
                            {wine.doLogoImage ? (
                              <span className="do-logo-tooltip" aria-label={`${wine.region} ${t.common.doShort}`}>
                                <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} ${t.common.doShort}`} loading="lazy" />
                                <span className="do-logo-tooltip-panel" role="tooltip" aria-hidden="true">
                                  <img src={wine.doLogoImage} alt="" loading="lazy" />
                                  <span>{wine.region}</span>
                                </span>
                              </span>
                            ) : null}
                            <span>{wine.region}</span>
                          </dd>
                        </div>
                        <div className="wine-card-meta-box-aging">
                          <dt>🍷 {t.modal.aging}</dt>
                          <dd>{wine.aging}</dd>
                        </div>
                        <div className="wine-card-meta-box-vintage"><dt>{t.icons.vintage} {t.card.vintage}</dt><dd>{wine.vintage}</dd></div>
                        <div className="wine-card-meta-box-grapes">
                          <dt className="wine-card-grapes-heading"><span aria-hidden="true">{t.icons.grape}</span><span>{t.card.grapeVarieties}</span></dt>
                          <dd className="wine-card-meta-grapes">
                            {splitGrapeVarieties(wine.grapes).map((grape) => (
                              <button
                                key={`${wine.id}-meta-grape-${grape}`}
                                type="button"
                                className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setGrapeFilter(grape)
                                }}
                                aria-label={`${t.filters.grape}: ${grape}`}
                                title={grape}
                              >
                                <span>{grape}</span>
                              </button>
                            ))}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section className="wine-card-mobile-layout" aria-label={t.common.mobileCardLayoutAria}>
                      <div className="wine-card-mobile-main-row">
                        <div className="wine-card-mobile-main-left">
                          <p className="wine-card-mobile-name-line">
                            <span className="wine-card-mobile-title ">{wine.name}</span>
                          </p>
                          <p className="wine-card-mobile-main-subline">{wine.vintage} • {wine.aging}</p>
                          <p className="wine-card-mobile-winery">{wine.winery}</p>
                        </div>
                      </div>

                      <div className="wine-card-mobile-do-row">
                        <p className="wine-card-mobile-do-text">{t.common.doShort} <span className="title">{wine.region}</span> </p>

                        <p className="wine-card-mobile-do-logos">
                          {communityFlagImage && communityName ? (
                            <img className="do-logo-badge" src={communityFlagImage} alt={communityName} loading="lazy" />
                          ) : null}
                          {wine.doLogoImage ? (
                            <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} ${t.common.doShort}`} loading="lazy" />
                          ) : null}
                        </p>
                      </div>

                      <div className="wine-card-mobile-grapes-row">
                        <p className="wine-card-grapes-heading"><span aria-hidden="true">{t.icons.grape}</span><span>{t.card.grapeVarieties}</span></p>
                        <div className="wine-card-mobile-grapes-list">
                          {splitGrapeVarieties(wine.grapes).map((grape) => (
                            <button
                              key={`${wine.id}-mobile-grape-${grape}`}
                              type="button"
                              className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                              onClick={(event) => {
                                event.stopPropagation()
                                setGrapeFilter(grape)
                              }}
                              aria-label={`${t.filters.grape}: ${grape}`}
                              title={grape}
                            >
                              <span>{grape}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="wine-card-mobile-list-layout" aria-label={t.common.mobileListLayoutAria}>
                      <div className="wine-card-mobile-list-image-wrap">
                        <img
                          src={resolvePublicWineImageForTheme(wine.image, isDark)}
                          alt={wine.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                          }}
                        />
                      </div>

                      <div className="wine-card-mobile-list-main">
                        <p className="wine-card-mobile-list-name">{wine.name}</p>
                        <p className="wine-card-mobile-list-subline">{wine.vintage} • {t.wineType[wine.type]}</p>
                        <p className="wine-card-mobile-list-do-row">
                          <span className="wine-card-mobile-list-do-title">{t.common.doShort}</span>
                          {wine.doLogoImage ? (
                            <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} ${t.common.doShort}`} loading="lazy" />
                          ) : null}
                        </p>
                        <p className="wine-card-mobile-list-do-name">{wine.region}</p>
                        {wine.country !== 'Spain' ? (
                          <p className="wine-card-mobile-list-origin-row">
                            <span className="wine-card-mobile-list-origin-label">{t.card.manufacturing}</span>
                            <span className="wine-card-mobile-list-country">
                              {countryFlagImage
                                ? <img className="flag-badge-image wine-card-mobile-list-country-flag" src={countryFlagImage} alt={localizedCountryName(wine.country, locale)} loading="lazy" />
                                : <span className="wine-card-mobile-list-country-emoji" aria-hidden="true">{countryFlagEmoji(wine.country)}</span>}
                              <span>{localizedCountryName(wine.country, locale)}</span>
                            </span>
                          </p>
                        ) : null}
                      </div>

                      <div className="wine-card-mobile-list-grapes-col" aria-label={t.filters.grape}>
                        <p className="wine-card-mobile-list-grapes-title wine-card-grapes-heading">
                          <span aria-hidden="true">{t.icons.grape}</span>
                          <span>{t.card.grapeVarieties}</span>
                        </p>
                        <div className="wine-card-mobile-list-grapes-list">
                          {splitGrapeVarieties(wine.grapes).map((grape) => (
                            <button
                              key={`${wine.id}-list-grape-${grape}`}
                              type="button"
                              className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                              onClick={(event) => {
                                event.stopPropagation()
                                setGrapeFilter(grape)
                              }}
                              aria-label={`${t.filters.grape}: ${grape}`}
                              title={grape}
                            >
                              <span>{grape}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="wine-card-mobile-list-score-col">
                        <span className={`wine-card-score-floating wine-card-score-floating-${scoreTier} wine-card-mobile-list-score-bullet`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                          {wine.avgScore.toFixed(1)}
                        </span>
                      </div>
                    </section>

                    <section className="wine-card-review-section" aria-label={t.common.reviewSummaryAria}>
                      <p className="wine-card-review-title">{t.modal.tasting}</p>
                      <div className="wine-card-review-block">
                        <article className="wine-card-mini-box wine-card-mini-maria">
                          <span className="mini-label">👩 {t.modal.mariaScore}</span>
                          <strong>{wine.mariaScore != null ? wine.mariaScore.toFixed(2) : t.common.notAvailableShort}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-adria">
                          <span className="mini-label">🧑 {t.modal.adriaScore}</span>
                          <strong>{wine.adriaScore != null ? wine.adriaScore.toFixed(2) : t.common.notAvailableShort}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-date">
                          <span className="mini-label">📅 {t.modal.tastedAt}</span>
                          <strong>{wine.tastedAt}</strong>
                        </article>
                      </div>
                    </section>

                    <div className="wine-card-footer">
                      <span className="card-link">{t.card.viewProfile}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <CatalogOverlays
        activeModalImageIndex={activeModalImageIndex}
        autonomousCommunityNameForRegion={autonomousCommunityNameForRegion}
        closeSelectedWineModal={closeSelectedWineModal}
        countryFlagEmoji={countryFlagEmoji}
        countryFlagPath={countryFlagPath}
        defaultPublicWineImageForTheme={defaultPublicWineImageForTheme}
        doLogoPreview={doLogoPreview}
        euro={euro}
        galleryPhotoLabels={galleryPhotoLabels}
        isDark={isDark}
        locale={locale}
        localizedCountryName={localizedCountryName}
        resolvePublicWineImageForTheme={resolvePublicWineImageForTheme}
        selectedWine={selectedWine}
        setActiveModalImageIndex={setActiveModalImageIndex}
        setDoLogoPreview={setDoLogoPreview}
        splitGrapeVarieties={splitGrapeVarieties}
        t={t}
      />
    </main>
  )
}
