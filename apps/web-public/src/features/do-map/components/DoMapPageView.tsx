import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import type { ThemeMode } from '../../catalog/types'
import { DO_MAP_ALL_WORLD_VALUE, type DoMapPoint } from '../types'

type Props = {
  adminHref: string
  canDoMapFullscreen: boolean
  countryFlagPath: (country: string) => string | null
  desktopNav: ReactNode
  doMapCanvasRef: RefObject<HTMLDivElement | null>
  doMapContainerRef: RefObject<HTMLDivElement | null>
  doMapCountryFilter: string
  doMapCountryOptions: string[]
  doMapInitError: boolean
  doMapVisiblePoints: DoMapPoint[]
  isDark: boolean
  isDoMapCountryMenuOpen: boolean
  isDoMapFullscreen: boolean
  isDoMapMobile: boolean
  isDoMapMobileDoPickerOpen: boolean
  isDoMapTatRossetOnly: boolean
  isMobileMenuOpen: boolean
  locale: Locale
  localeLabels: Record<Locale, string>
  localizedCountryName: (country: string, locale: Locale) => string
  logoSrc: string
  selectedMapCountryCompactLabel: string
  selectedMapCountryFlag: string | null
  selectedMapCountryLabel: string
  selectedMapDo: DoMapPoint | null
  setDoMapCountryFilter: Dispatch<SetStateAction<string>>
  setIsDoMapCountryMenuOpen: Dispatch<SetStateAction<boolean>>
  setIsDoMapMobileDoPickerOpen: Dispatch<SetStateAction<boolean>>
  setIsDoMapTatRossetOnly: Dispatch<SetStateAction<boolean>>
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>
  setLocale: Dispatch<SetStateAction<Locale>>
  setSelectedMapDoId: Dispatch<SetStateAction<number | null>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  t: PublicMessages
  theme: ThemeMode
  toggleDoMapFullscreen: () => void
}

export default function DoMapPageView({
  adminHref,
  canDoMapFullscreen,
  countryFlagPath,
  desktopNav,
  doMapCanvasRef,
  doMapContainerRef,
  doMapCountryFilter,
  doMapCountryOptions,
  doMapInitError,
  doMapVisiblePoints,
  isDark,
  isDoMapCountryMenuOpen,
  isDoMapFullscreen,
  isDoMapMobile,
  isDoMapMobileDoPickerOpen,
  isDoMapTatRossetOnly,
  isMobileMenuOpen,
  locale,
  localeLabels,
  localizedCountryName,
  logoSrc,
  selectedMapCountryCompactLabel,
  selectedMapCountryFlag,
  selectedMapCountryLabel,
  selectedMapDo,
  setDoMapCountryFilter,
  setIsDoMapCountryMenuOpen,
  setIsDoMapMobileDoPickerOpen,
  setIsDoMapTatRossetOnly,
  setIsMobileMenuOpen,
  setLocale,
  setSelectedMapDoId,
  setTheme,
  t,
  theme,
  toggleDoMapFullscreen,
}: Props) {
  return (
    <main className="public-shell do-map-shell">
      <div className="public-background" aria-hidden="true" />

      <header className={`public-topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
        <div className="brand-block">
          <div className="brand-copy">
            <img src={logoSrc} className="brand-wordmark" alt={t.common.brandAlt} />
            <p>{t.common.appName}</p>
          </div>
        </div>
        {desktopNav}

        <div className="topbar-actions">
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
            <img src="/images/icons/wine/wine_card.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.winesCatalog}</span>
          </a>
          <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/do_sign.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.doMap}</span>
          </a>
          <a href="/ruta-de-vins" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/calendar_grapes.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.wineRoute}</span>
          </a>
          <a href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wines_book.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
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

      <section className="hero-panel do-map-hero">
        <div className="do-map-hero-main">
          {t.doMap.eyebrow.trim() !== '' ? (
            <p className="eyebrow">{t.doMap.eyebrow}</p>
          ) : null}
          <div className="do-map-hero-title-row">
            <h1 className="section-title-with-icon">
              <img src="/images/icons/wine/do_sign.png" className="section-title-icon" alt="" aria-hidden="true" />
              <span className="section-title-label">{t.doMap.title}</span>
            </h1>
            <div className="do-map-country-filter-bar" aria-label={t.doMap.filterCountry}>
              {!isDoMapMobile ? (
                <span>{t.icons.country} {t.doMap.filterCountry}</span>
              ) : null}
              <div className="do-map-country-select">
                <button
                  type="button"
                  className="do-map-country-button"
                  aria-haspopup="listbox"
                  aria-expanded={isDoMapCountryMenuOpen}
                  onClick={() => setIsDoMapCountryMenuOpen((open) => !open)}
                >
                  {isDoMapMobile ? <span className="do-map-control-icon" aria-hidden="true">🌍</span> : null}
                  {selectedMapCountryFlag ? <img src={selectedMapCountryFlag} alt="" className="do-map-country-flag" aria-hidden="true" /> : null}
                  <strong>{isDoMapMobile ? selectedMapCountryCompactLabel : selectedMapCountryLabel}</strong>
                  <span className="do-map-country-caret" aria-hidden="true">▾</span>
                </button>

                {isDoMapCountryMenuOpen ? (
                  <div className="do-map-country-menu" role="listbox" aria-label={t.doMap.filterCountry}>
                    {doMapCountryOptions.map((country) => {
                      if (country === DO_MAP_ALL_WORLD_VALUE) {
                        return (
                          <button
                            key={`map-country-option-${country}`}
                            type="button"
                            role="option"
                            aria-selected={doMapCountryFilter === country}
                            className={`do-map-country-option${doMapCountryFilter === country ? ' is-selected' : ''}`}
                            onClick={() => {
                              setDoMapCountryFilter(country)
                              setIsDoMapCountryMenuOpen(false)
                              setSelectedMapDoId(null)
                            }}
                          >
                            <span>{t.doMap.allWorld}</span>
                          </button>
                        )
                      }

                      const flag = countryFlagPath(country)
                      return (
                        <button
                          key={`map-country-option-${country}`}
                          type="button"
                          role="option"
                          aria-selected={doMapCountryFilter === country}
                          className={`do-map-country-option${doMapCountryFilter === country ? ' is-selected' : ''}`}
                          onClick={() => {
                            setDoMapCountryFilter(country)
                            setIsDoMapCountryMenuOpen(false)
                          }}
                        >
                          {flag ? <img src={flag} alt="" className="do-map-country-flag" aria-hidden="true" /> : null}
                          <span>{localizedCountryName(country, locale)}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              <label className="do-map-tat-rosset-toggle">
                <input
                  type="checkbox"
                  checked={isDoMapTatRossetOnly}
                  onChange={(event) => setIsDoMapTatRossetOnly(event.target.checked)}
                  aria-label={t.doMap.tatRossetAria}
                />
                <span>{t.doMap.tatRossetLabel}</span>
              </label>

              {isDoMapMobile ? (
                <button
                  type="button"
                  className="do-map-mobile-picker-trigger"
                  onClick={() => setIsDoMapMobileDoPickerOpen(true)}
                  disabled={doMapVisiblePoints.length === 0}
                >
                  <span>{t.common.doShort}</span>
                </button>
              ) : null}
            </div>
          </div>
          {t.doMap.subtitle.trim() !== '' ? (
            <p className="hero-subtitle">{t.doMap.subtitle}</p>
          ) : null}
        </div>
      </section>

      <section className="do-map-layout">
        <div className="cards-panel do-map-canvas-card">
          <div ref={doMapCanvasRef} className="do-map-canvas" role="img" aria-label={t.doMap.worldMapLabel}>
            <div ref={doMapContainerRef} className="do-map-leaflet" />
            {isDoMapMobile && canDoMapFullscreen ? (
              <button
                type="button"
                className="do-map-fullscreen-button"
                onClick={toggleDoMapFullscreen}
                aria-label={isDoMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
                title={isDoMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
              >
                {isDoMapFullscreen ? '✕' : '⛶'}
              </button>
            ) : null}
            {doMapInitError ? (
              <p className="do-map-error">{t.doMap.loadError}</p>
            ) : null}
          </div>
        </div>

        <aside className={`cards-panel do-map-detail-card${isDoMapMobile ? ' is-mobile' : ''}`}>
          {selectedMapDo ? (
            <>
              <h2>{selectedMapDo.name}</h2>
              <p>{selectedMapDo.region} · {localizedCountryName(selectedMapDo.country, locale)}</p>
              <div className="do-map-detail-logos">
                {selectedMapDo.regionLogoImage ? (
                  <img src={selectedMapDo.regionLogoImage} alt={selectedMapDo.region} loading="lazy" />
                ) : null}
                {selectedMapDo.doLogoImage ? (
                  <img src={selectedMapDo.doLogoImage} alt={`${selectedMapDo.name} ${t.common.doShort}`} loading="lazy" />
                ) : null}
              </div>
            </>
          ) : null}

          {!isDoMapMobile ? (
            <>
              <h3>{t.doMap.listTitle}</h3>
              <div className="do-map-list">
                {doMapVisiblePoints.map((point) => (
                  <button
                    key={`map-list-${point.id}`}
                    type="button"
                    className={`do-map-list-item${selectedMapDo?.id === point.id ? ' active' : ''}`}
                    onClick={() => setSelectedMapDoId(point.id)}
                  >
                    <span className="do-map-list-item-row">
                      {countryFlagPath(point.country) ? (
                        <img
                          src={countryFlagPath(point.country) ?? ''}
                          alt=""
                          className="do-map-list-item-flag"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="do-map-list-item-text">
                        <strong>{point.name}</strong>
                        <span>{point.region} · {localizedCountryName(point.country, locale)}</span>
                      </span>
                    </span>
                  </button>
                ))}
                {doMapVisiblePoints.length === 0 ? (
                  <p className="do-map-empty">{t.doMap.noCoordinates}</p>
                ) : null}
              </div>
            </>
          ) : null}
        </aside>
      </section>

      {isDoMapMobile && isDoMapMobileDoPickerOpen ? (
        <>
          <button
            type="button"
            className="do-map-mobile-picker-backdrop"
            aria-label={t.doMap.closeSelector}
            onClick={() => setIsDoMapMobileDoPickerOpen(false)}
          />
          <section className="do-map-mobile-picker" role="dialog" aria-modal="true" aria-label={t.doMap.chooseDo}>
            <div className="do-map-mobile-picker-head">
              <strong>{t.doMap.chooseDoPlaceholder}</strong>
              <button type="button" onClick={() => setIsDoMapMobileDoPickerOpen(false)} aria-label={t.doMap.closeSelector}>
                ✕
              </button>
            </div>
            <div className="do-map-mobile-picker-list">
              {doMapVisiblePoints.map((point) => (
                <button
                  key={`map-mobile-list-${point.id}`}
                  type="button"
                  className={`do-map-list-item${selectedMapDo?.id === point.id ? ' active' : ''}`}
                  onClick={() => {
                    setSelectedMapDoId(point.id)
                    setIsDoMapMobileDoPickerOpen(false)
                  }}
                >
                  <span className="do-map-list-item-row">
                    {countryFlagPath(point.country) ? (
                      <img
                        src={countryFlagPath(point.country) ?? ''}
                        alt=""
                        className="do-map-list-item-flag"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="do-map-list-item-text">
                      <strong>{point.name}</strong>
                      <span>{point.region} · {localizedCountryName(point.country, locale)}</span>
                    </span>
                  </span>
                </button>
              ))}
              {doMapVisiblePoints.length === 0 ? (
                <p className="do-map-empty">{t.doMap.chooseCountryFirst}</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}
