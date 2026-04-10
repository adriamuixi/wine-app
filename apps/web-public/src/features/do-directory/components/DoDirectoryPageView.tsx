import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import type { ThemeMode } from '../../catalog/types'

type DoDirectoryItem = {
  id: number
  name: string
  region: string
  country: string
  doLogoImage: string | null
  regionLogoImage: string | null
  reviewedWineCount: number
}

type Props = {
  adminHref: string
  countryFlagPath: (country: string) => string | null
  desktopNav: ReactNode
  doDirectoryItems: DoDirectoryItem[]
  isDark: boolean
  isMobileMenuOpen: boolean
  locale: Locale
  localeLabels: Record<Locale, string>
  localizedCountryName: (country: string, locale: Locale) => string
  logoSrc: string
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>
  setLocale: Dispatch<SetStateAction<Locale>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  t: PublicMessages
  theme: ThemeMode
}

export default function DoDirectoryPageView({
  adminHref,
  countryFlagPath,
  desktopNav,
  doDirectoryItems,
  isDark,
  isMobileMenuOpen,
  locale,
  localeLabels,
  localizedCountryName,
  logoSrc,
  setIsMobileMenuOpen,
  setLocale,
  setTheme,
  t,
  theme,
}: Props) {
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')

  const localeCodes = Object.keys(localeLabels) as Locale[]
  const toggleLocale = () => {
    const currentIndex = localeCodes.indexOf(locale)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % localeCodes.length : 0
    setLocale(localeCodes[nextIndex] ?? localeCodes[0] ?? 'ca')
  }

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(doDirectoryItems.map((item) => item.country))).sort((a, b) => a.localeCompare(b))],
    [doDirectoryItems],
  )

  const normalizedSearch = search.trim().toLowerCase()
  const filteredItems = useMemo(
    () => doDirectoryItems.filter((item) => {
      const matchesCountry = countryFilter === 'all' || item.country === countryFilter
      if (!matchesCountry) {
        return false
      }
      if (normalizedSearch === '') {
        return true
      }
      return [item.name, item.region, item.country].join(' ').toLowerCase().includes(normalizedSearch)
    }),
    [countryFilter, doDirectoryItems, normalizedSearch],
  )

  const copy = {
    ca: {
      eyebrow: 'DIRECTORI DE DO',
      title: 'Totes les denominacions d’origen',
      subtitle: 'Consulta cada DO amb la seva imatge, regió, país i el nombre de vins ressenyats dins la web.',
      search: 'Cerca per DO, regió o país',
      allCountries: 'Tots els països',
      reviewedWines: 'Vins ressenyats',
      region: 'Regió',
      country: 'País',
      empty: 'No hi ha DO que coincideixin amb aquest filtre.',
      autoText: 'Territori vinícola amb identitat pròpia i elaboracions representatives del seu origen.',
    },
    es: {
      eyebrow: 'DIRECTORIO DE DO',
      title: 'Todas las denominaciones de origen',
      subtitle: 'Consulta cada DO con su imagen, región, país y número de vinos reseñados en la web.',
      search: 'Buscar por DO, región o país',
      allCountries: 'Todos los países',
      reviewedWines: 'Vinos reseñados',
      region: 'Región',
      country: 'País',
      empty: 'No hay DO que coincidan con este filtro.',
      autoText: 'Territorio vinícola con identidad propia y elaboraciones representativas de su origen.',
    },
    en: {
      eyebrow: 'DO DIRECTORY',
      title: 'All designations of origin',
      subtitle: 'Browse every DO with image, region, country and reviewed wine count from this website.',
      search: 'Search by DO, region or country',
      allCountries: 'All countries',
      reviewedWines: 'Reviewed wines',
      region: 'Region',
      country: 'Country',
      empty: 'No DO matches this filter.',
      autoText: 'Wine territory with its own identity and representative local expressions.',
    },
  }[locale]

  return (
    <main className="public-shell do-directory-shell">
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
              <span className="topbar-mobile-icon" aria-hidden="true">{isDark ? '☾' : '☀'}</span>
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
            <img src="/images/icons/wine/house_grapes.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.home}</span>
          </a>
          <a href="/catalog" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wines2_glass.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.winesCatalog}</span>
          </a>
          <a href="/do" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/do_only.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.doDirectory}</span>
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

      <section className="hero-panel do-directory-hero">
        <div className="section-heading-with-icon">
          <img src="/images/icons/wine/do_only.png" className="section-heading-icon" alt="" aria-hidden="true" />
          <div className="section-heading-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="section-title-label">{copy.title}</h1>
            <p className="hero-subtitle">{copy.subtitle}</p>
          </div>
        </div>
        <div className="do-directory-filters">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
          />
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} aria-label={copy.country}>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country === 'all' ? copy.allCountries : localizedCountryName(country, locale)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="do-directory-grid" aria-label={copy.title}>
        {filteredItems.length === 0 ? <p className="do-directory-empty">{copy.empty}</p> : null}
        {filteredItems.map((item) => {
          const countryFlag = countryFlagPath(item.country)
          return (
            <article key={item.id} className="cards-panel do-directory-card">
              <div className="do-directory-card-head">
                <div className="do-directory-logo-stack">
                  {item.regionLogoImage ? <img src={item.regionLogoImage} alt={item.region} loading="lazy" /> : null}
                  {item.doLogoImage ? <img src={item.doLogoImage} alt={`${item.name} ${t.common.doShort}`} loading="lazy" /> : null}
                </div>
                <div>
                  <h2>{item.name}</h2>
                  <p>{copy.autoText}</p>
                </div>
              </div>

              <dl className="do-directory-meta">
                <div>
                  <dt>{copy.region}</dt>
                  <dd>{item.region}</dd>
                </div>
                <div>
                  <dt>{copy.country}</dt>
                  <dd>
                    {countryFlag ? <img src={countryFlag} alt={localizedCountryName(item.country, locale)} loading="lazy" /> : null}
                    <span>{localizedCountryName(item.country, locale)}</span>
                  </dd>
                </div>
                <div>
                  <dt>{copy.reviewedWines}</dt>
                  <dd>
                    <strong>{item.reviewedWineCount}</strong>
                  </dd>
                </div>
              </dl>
            </article>
          )
        })}
      </section>
    </main>
  )
}
