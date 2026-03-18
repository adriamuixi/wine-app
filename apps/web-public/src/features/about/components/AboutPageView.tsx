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
  return (
    <main className="public-shell">
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
          <a href="/" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.winesCatalog}</a>
          <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.doMap}</a>
          <a href="/about" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.whoWeAre}</a>
          <a
            href={adminHref}
            onClick={() => {
              window.localStorage.setItem('wine-app-theme-mode', theme)
              setIsMobileMenuOpen(false)
            }}
          >
            {t.topbar.backoffice}
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
        <div>
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h1>{t.about.title}</h1>
          <p className="hero-subtitle about-hero-subtitle">{t.about.intro}</p>
        </div>
      </section>

      <section className="about-team-grid" aria-label={t.about.membersAria}>
        <article className="cards-panel about-member-card">
          <img src={TEAM_TAT_PHOTO_SRC} alt={t.about.members.tat.photoAlt} className="about-member-photo" loading="lazy" />
          <h2>{t.about.members.tat.fullName}</h2>
          <p className="about-member-role">{t.about.members.tat.role}</p>
          <p>{t.about.members.tat.bio}</p>
        </article>
        <article className="cards-panel about-member-card">
          <img src={TEAM_ROSSET_PHOTO_SRC} alt={t.about.members.rosset.photoAlt} className="about-member-photo" loading="lazy" />
          <h2>{t.about.members.rosset.fullName}</h2>
          <p className="about-member-role">{t.about.members.rosset.role}</p>
          <p>{t.about.members.rosset.bio}</p>
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
