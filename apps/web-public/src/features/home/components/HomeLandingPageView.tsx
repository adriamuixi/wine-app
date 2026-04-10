import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import type { ThemeMode } from '../../catalog/types'

type HomeStats = {
  totalWines: number
  totalDos: number
  totalCountries: number
  totalReviews: number
}

type Props = {
  adminHref: string
  desktopNav: ReactNode
  homeStats: HomeStats
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

export default function HomeLandingPageView({
  adminHref,
  desktopNav,
  homeStats,
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

  const copy = {
    ca: {
      eyebrow: 'BENVINGUTS',
      title: 'La vostra guia per descobrir vi, territori i records',
      subtitle: 'Aquesta web és el nostre quadern digital: aquí compartim vins tastats, denominacions d’origen i rutes reals de compra perquè puguis inspirar-te i explorar.',
      ctaCatalog: 'Explora el catàleg',
      ctaDo: 'Veure totes les DO',
      blocksTitle: 'Què hi trobaràs',
      blocks: [
        {
          title: 'Catàleg de vins',
          text: 'Fitxes visuals amb puntuacions, notes de tast i informació útil de cada vi.',
          href: '/catalog',
          image: '/images/icons/wine/wines2_glass.png',
        },
        {
          title: 'Directori de DO',
          text: 'Totes les denominacions agrupades amb imatge, regió, país i vins ressenyats.',
          href: '/do',
          image: '/images/icons/wine/do_only.png',
        },
        {
          title: 'Mapa i ruta',
          text: 'Visualitza DO al mapa mundial i segueix el recorregut de compres i tastos.',
          href: '/do-map',
          image: '/images/icons/wine/wine_maps2.png',
        },
      ],
      stats: {
        wines: 'Vins publicats',
        dos: 'DO disponibles',
        countries: 'Països coberts',
        reviews: 'Ressenyes totals',
      },
    },
    es: {
      eyebrow: 'BIENVENIDOS',
      title: 'Tu guía para descubrir vino, territorio y recuerdos',
      subtitle: 'Esta web es nuestro cuaderno digital: aquí compartimos vinos catados, denominaciones de origen y rutas reales de compra para inspirarte y ayudarte a explorar.',
      ctaCatalog: 'Explorar catálogo',
      ctaDo: 'Ver todas las DO',
      blocksTitle: 'Qué encontrarás',
      blocks: [
        {
          title: 'Catálogo de vinos',
          text: 'Fichas visuales con puntuaciones, notas de cata e información útil de cada vino.',
          href: '/catalog',
          image: '/images/icons/wine/wines2_glass.png',
        },
        {
          title: 'Directorio de DO',
          text: 'Todas las denominaciones agrupadas con imagen, región, país y vinos reseñados.',
          href: '/do',
          image: '/images/icons/wine/do_only.png',
        },
        {
          title: 'Mapa y ruta',
          text: 'Visualiza DO en el mapa mundial y sigue el recorrido de compras y catas.',
          href: '/do-map',
          image: '/images/icons/wine/wine_maps2.png',
        },
      ],
      stats: {
        wines: 'Vinos publicados',
        dos: 'DO disponibles',
        countries: 'Países cubiertos',
        reviews: 'Reseñas totales',
      },
    },
    en: {
      eyebrow: 'WELCOME',
      title: 'Your guide to discover wine, places, and memories',
      subtitle: 'This website is our digital notebook: we share tasted wines, designations of origin, and real purchase routes to inspire your next bottle.',
      ctaCatalog: 'Explore catalog',
      ctaDo: 'See all DOs',
      blocksTitle: 'What you will find',
      blocks: [
        {
          title: 'Wine catalog',
          text: 'Visual wine profiles with scores, tasting notes and practical details.',
          href: '/catalog',
          image: '/images/icons/wine/wines2_glass.png',
        },
        {
          title: 'DO directory',
          text: 'All designations grouped with image, region, country and reviewed wines.',
          href: '/do',
          image: '/images/icons/wine/do_only.png',
        },
        {
          title: 'Map and route',
          text: 'Browse DOs on the world map and follow the real tasting journey.',
          href: '/do-map',
          image: '/images/icons/wine/wine_maps2.png',
        },
      ],
      stats: {
        wines: 'Published wines',
        dos: 'Available DOs',
        countries: 'Countries covered',
        reviews: 'Total reviews',
      },
    },
  }[locale]

  return (
    <main className="public-shell home-landing-shell">
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
                {isDark ? '☾' : '☀'}
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

      <section className="hero-panel home-landing-hero">
        <div className="home-landing-hero-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <div className="home-landing-actions">
            <a href="/catalog" className="home-landing-button home-landing-button-primary">{copy.ctaCatalog}</a>
            <a href="/do" className="home-landing-button">{copy.ctaDo}</a>
          </div>
        </div>
        <div className="home-landing-hero-media">
          <img src="/images/photos/wine_photo_landscape.png" alt="Wine landscape" loading="eager" />
        </div>
      </section>

      <section className="home-landing-stats" aria-label="Website stats">
        <article className="cards-panel home-landing-stat">
          <strong>{homeStats.totalWines}</strong>
          <span>{copy.stats.wines}</span>
        </article>
        <article className="cards-panel home-landing-stat">
          <strong>{homeStats.totalDos}</strong>
          <span>{copy.stats.dos}</span>
        </article>
        <article className="cards-panel home-landing-stat">
          <strong>{homeStats.totalCountries}</strong>
          <span>{copy.stats.countries}</span>
        </article>
        <article className="cards-panel home-landing-stat">
          <strong>{homeStats.totalReviews}</strong>
          <span>{copy.stats.reviews}</span>
        </article>
      </section>

      <section className="home-landing-blocks" aria-label={copy.blocksTitle}>
        {copy.blocks.map((block) => (
          <article key={block.title} className="cards-panel home-landing-block">
            <img src={block.image} alt="" aria-hidden="true" />
            <h2>{block.title}</h2>
            <p>{block.text}</p>
            <a href={block.href}>{locale === 'ca' ? 'Obrir' : locale === 'es' ? 'Abrir' : 'Open'}</a>
          </article>
        ))}
      </section>
    </main>
  )
}
