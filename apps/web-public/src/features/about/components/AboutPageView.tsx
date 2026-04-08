import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import { TEAM_ROSSET_PHOTO_SRC, TEAM_TAT_PHOTO_SRC } from '../../../app/config/constants'
import type { ThemeMode } from '../../catalog/types'

type AboutStats = {
  totalWines: number
  totalReviews: number
  tatAverage: number
  rossetAverage: number
  syncIndex: number
}

type Props = {
  aboutStats: AboutStats
  adminHref: string
  desktopNav: ReactNode
  isDark: boolean
  isMobileMenuOpen: boolean
  locale: Locale
  localeLabels: Record<Locale, string>
  logoSrc: string
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>
  setLocale: Dispatch<SetStateAction<Locale>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  t: PublicMessages
  theme: ThemeMode
}

export default function AboutPageView({
  aboutStats,
  adminHref,
  desktopNav,
  isDark,
  isMobileMenuOpen,
  locale,
  localeLabels,
  logoSrc,
  setIsMobileMenuOpen,
  setLocale,
  setTheme,
  t,
  theme,
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

      <section className="hero-panel about-hero-panel" id="about">
        <div className="about-hero-copy">
          <div className="section-heading-with-icon">
            <img src="/images/icons/wine/wine_couple.png" className="section-heading-icon" alt="" aria-hidden="true" />
            <div className="section-heading-copy">
              <p className="eyebrow">{t.about.eyebrow}</p>
              <h1 className="section-title-label">{t.about.title}</h1>
              <p className="hero-subtitle about-hero-subtitle">{t.about.intro}</p>
            </div>
          </div>
        </div>
        <div className="about-hero-stat-strip" aria-label={t.about.statsAria}>
          <article className="about-hero-stat">
            <span>{t.about.stats.totalWines}</span>
            <strong>{aboutStats.totalWines}</strong>
          </article>
          <article className="about-hero-stat">
            <span>{t.about.stats.totalReviews}</span>
            <strong>{aboutStats.totalReviews}</strong>
          </article>
          <article className="about-hero-stat about-hero-stat-accent">
            <span>{t.about.stats.syncIndex}</span>
            <strong>{aboutStats.syncIndex.toFixed(1)}%</strong>
          </article>
        </div>
      </section>

      <section className="about-team-grid" aria-label={t.about.membersAria}>
        <article className="cards-panel about-member-card">
          <div className="about-member-media">
            <img src={TEAM_TAT_PHOTO_SRC} alt={t.about.members.tat.photoAlt} className="about-member-photo" loading="lazy" />
          </div>
          <div className="about-member-body">
            <p className="about-member-kicker">Tat</p>
            <h2>{t.about.members.tat.fullName}</h2>
            <p className="about-member-role">{t.about.members.tat.role}</p>
            <p>{t.about.members.tat.bio}</p>
          </div>
        </article>
        <article className="cards-panel about-member-card">
          <div className="about-member-media">
            <img src={TEAM_ROSSET_PHOTO_SRC} alt={t.about.members.rosset.photoAlt} className="about-member-photo" loading="lazy" />
          </div>
          <div className="about-member-body">
            <p className="about-member-kicker">Rosset</p>
            <h2>{t.about.members.rosset.fullName}</h2>
            <p className="about-member-role">{t.about.members.rosset.role}</p>
            <p>{t.about.members.rosset.bio}</p>
          </div>
        </article>
      </section>

      <section className="about-stats-grid" aria-label={t.about.statsAria}>
        <article className="cards-panel about-stat-card">
          <span>{t.about.stats.totalWines}</span>
          <strong>{aboutStats.totalWines}</strong>
        </article>
        <article className="cards-panel about-stat-card">
          <span>{t.about.stats.totalReviews}</span>
          <strong>{aboutStats.totalReviews}</strong>
        </article>
        <article className="cards-panel about-stat-card">
          <span>{t.about.stats.tatAverage}</span>
          <strong>{aboutStats.tatAverage.toFixed(2)}</strong>
        </article>
        <article className="cards-panel about-stat-card">
          <span>{t.about.stats.rossetAverage}</span>
          <strong>{aboutStats.rossetAverage.toFixed(2)}</strong>
        </article>
        <article className="cards-panel about-stat-card about-stat-card-accent">
          <span>{t.about.stats.syncIndex}</span>
          <strong>{aboutStats.syncIndex.toFixed(1)}%</strong>
        </article>
      </section>
    </main>
  )
}
