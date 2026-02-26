import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Locale = 'ca' | 'es'
type ThemeMode = 'light' | 'dark'
type WineType = 'red' | 'white' | 'rose' | 'sparkling'
type SortKey = 'score_desc' | 'price_asc' | 'price_desc' | 'latest'
type ScoreFilterBucket = 'all' | 'lt70' | '70_80' | '80_90' | 'gte90'
type UrlCatalogState = {
  q: string
  type: 'all' | WineType
  country: string
  region: string
  grape: string
  minScore: ScoreFilterBucket
  sort: SortKey
  wineId: number | null
}

type WineCard = {
  id: number
  name: string
  winery: string
  country: string
  region: string
  type: WineType
  vintage: number
  avgScore: number
  priceFrom: number
  tastedAt: string
  month: string
  grapes: string
  aging: string
  alcohol: string
  mariaScore: number | null
  adriaScore: number | null
  place: string
  city: string
  techSheet: boolean
  reward?: {
    name: string
    score?: number
  }
  rewardBadgeImage?: string
  doLogoImage?: string
  notes: string
  tags: string[]
  image: string
  gallery: string[]
}

type Dictionary = {
  appName: string
  title: string
  subtitle: string
  searchPlaceholder: string
  filters: {
    title: string
    search: string
    type: string
    country: string
    region: string
    grape: string
    minScore: string
    sort: string
    allTypes: string
    allCountries: string
    allRegions: string
    anyScore: string
    clear: string
  }
  topbar: {
    resultCount: string
    dark: string
    light: string
    language: string
    menu: string
    navigation: string
    winesCatalog: string
    whoWeAre: string
    backoffice: string
    openFilters: string
    closeFilters: string
  }
  card: {
    avgScore: string
    priceFrom: string
    reward: string
    noReward: string
    region: string
    vintage: string
    points: string
    featured90: string
    viewDetails: string
  }
  icons: {
    filters: string
    search: string
    type: string
    country: string
    region: string
    grape: string
    minScore: string
    sort: string
    results: string
    avgScore: string
    rewards: string
    winery: string
    origin: string
    vintage: string
    price: string
    reward: string
    details: string
    gallery: string
    tasting: string
    tags: string
  }
  sort: Record<SortKey, string>
  modal: {
    close: string
    gallery: string
    details: string
    winery: string
    origin: string
    style: string
    grapes: string
    aging: string
    alcohol: string
    tastedAt: string
    month: string
    place: string
    mariaScore: string
    adriaScore: string
    tasting: string
    tags: string
    rewardNone: string
  }
  wineType: Record<WineType, string>
}

const THEME_KEY = 'wine-web-public-theme'
const LOCALE_KEY = 'wine-web-public-locale'
const DEFAULT_SORT: SortKey = 'score_desc'

const DICT: Record<Locale, Dictionary> = {
  ca: {
    appName: 'Wine App',
    title: 'Catàleg de vins',
    subtitle: 'Selecció pública amb fitxes visuals, puntuació mitjana i reconeixements destacats.',
    searchPlaceholder: 'Cerca per nom, celler o regió...',
    filters: {
      title: 'Filtres',
      search: 'Cercar',
      type: 'Tipus',
      country: 'País',
      region: 'Regió / D.O.',
      grape: 'Varietat de raïm',
      minScore: 'Puntuació mínima',
      sort: 'Ordenació',
      allTypes: 'Tots els tipus',
      allCountries: 'Tots els països',
      allRegions: 'Totes les regions',
      anyScore: 'Qualsevol puntuació',
      clear: 'Neteja filtres',
    },
    topbar: {
      resultCount: 'vins',
      dark: 'Fosc',
      light: 'Clar',
      language: 'Idioma',
      menu: 'Menú',
      navigation: 'Navegació',
      winesCatalog: 'Catàleg de vins',
      whoWeAre: 'Qui som',
      backoffice: 'Backoffice',
      openFilters: 'Obre filtres',
      closeFilters: 'Tanca filtres',
    },
    card: {
      avgScore: 'Punt. mitjana',
      priceFrom: 'Preu des de',
      reward: 'Reconeixement',
      noReward: 'Sense premi destacat',
      region: 'Origen',
      vintage: 'Anyada',
      points: 'punts',
      featured90: '+90 destacat',
      viewDetails: 'Veure detall',
    },
    icons: {
      filters: '⚗',
      search: '⌕',
      type: '◈',
      country: '🌍',
      region: '🗺',
      grape: '🍇',
      minScore: '★',
      sort: '⇅',
      results: '▦',
      avgScore: '★',
      rewards: '🏅',
      winery: '🏛',
      origin: '🧭',
      vintage: '🗓',
      price: '€',
      reward: '🏆',
      details: 'ℹ',
      gallery: '🖼',
      tasting: '🍷',
      tags: '🏷',
    },
    sort: {
      score_desc: 'Puntuació (major a menor)',
      price_asc: 'Preu (menor a major)',
      price_desc: 'Preu (major a menor)',
      latest: 'Anyada més recent',
    },
    modal: {
      close: 'Tanca',
      gallery: 'Galeria',
      details: 'Detall del vi',
      winery: 'Celler',
      origin: 'Origen',
      style: 'Estil',
      grapes: 'Varietats',
      aging: 'Criança',
      alcohol: 'Alcohol',
      tastedAt: 'Data de tast',
      month: 'Mes',
      place: 'Lloc',
      mariaScore: 'Valoració Maria',
      adriaScore: 'Valoració Adrià',
      tasting: 'Nota de tast',
      tags: 'Etiquetes',
      rewardNone: 'Sense premi destacat',
    },
    wineType: {
      red: 'Negre',
      white: 'Blanc',
      rose: 'Rosat',
      sparkling: 'Escumós',
    },
  },
  es: {
    appName: 'Wine App',
    title: 'Catálogo de vinos',
    subtitle: 'Selección pública con fichas visuales, puntuación media y reconocimientos destacados.',
    searchPlaceholder: 'Buscar por nombre, bodega o región...',
    filters: {
      title: 'Filtros',
      search: 'Buscar',
      type: 'Tipo',
      country: 'País',
      region: 'Región / D.O.',
      grape: 'Variedad de uva',
      minScore: 'Puntuación mínima',
      sort: 'Ordenación',
      allTypes: 'Todos los tipos',
      allCountries: 'Todos los países',
      allRegions: 'Todas las regiones',
      anyScore: 'Cualquier puntuación',
      clear: 'Limpiar filtros',
    },
    topbar: {
      resultCount: 'vinos',
      dark: 'Oscuro',
      light: 'Claro',
      language: 'Idioma',
      menu: 'Menú',
      navigation: 'Navegación',
      winesCatalog: 'Catálogo de vinos',
      whoWeAre: 'Quiénes somos',
      backoffice: 'Backoffice',
      openFilters: 'Abrir filtros',
      closeFilters: 'Cerrar filtros',
    },
    card: {
      avgScore: 'Punt. media',
      priceFrom: 'Precio desde',
      reward: 'Reconocimiento',
      noReward: 'Sin premio destacado',
      region: 'Origen',
      vintage: 'Añada',
      points: 'puntos',
      featured90: '+90 destacado',
      viewDetails: 'Ver detalle',
    },
    icons: {
      filters: '⚗',
      search: '⌕',
      type: '◈',
      country: '🌍',
      region: '🗺',
      grape: '🍇',
      minScore: '★',
      sort: '⇅',
      results: '▦',
      avgScore: '★',
      rewards: '🏅',
      winery: '🏛',
      origin: '🧭',
      vintage: '🗓',
      price: '€',
      reward: '🏆',
      details: 'ℹ',
      gallery: '🖼',
      tasting: '🍷',
      tags: '🏷',
    },
    sort: {
      score_desc: 'Puntuación (mayor a menor)',
      price_asc: 'Precio (menor a mayor)',
      price_desc: 'Precio (mayor a menor)',
      latest: 'Añada más reciente',
    },
    modal: {
      close: 'Cerrar',
      gallery: 'Galería',
      details: 'Detalle del vino',
      winery: 'Bodega',
      origin: 'Origen',
      style: 'Estilo',
      grapes: 'Variedades',
      aging: 'Crianza',
      alcohol: 'Alcohol',
      tastedAt: 'Fecha de cata',
      month: 'Mes',
      place: 'Lugar',
      mariaScore: 'Valoración Maria',
      adriaScore: 'Valoración Adrià',
      tasting: 'Nota de cata',
      tags: 'Etiquetas',
      rewardNone: 'Sin premio destacado',
    },
    wineType: {
      red: 'Tinto',
      white: 'Blanco',
      rose: 'Rosado',
      sparkling: 'Espumoso',
    },
  },
}

const SHARED_GALLERY = [
  'photos/wines/exmaple_wine-hash.png',
  'photos/wines/front_wine-hash.png',
  'photos/wines/back_wine-hash.png',
]

type JournalWineRow = {
  date: string
  month: string
  wine: string
  typeCa: string
  grapes: string
  aging: string
  region: string
  vintage: number | null
  alcohol: string
  techSheet: boolean
  maria: string
  adria: string
  place: string
  city: string
}

const CATALAN_JOURNAL_ROWS: JournalWineRow[] = [
  { date: '26/9/2020', month: 'Setembre', wine: 'Lo cometa', typeCa: 'Blanc', grapes: 'Garnatxa Blanc', aging: 'jove', region: 'Terra Alta', vintage: 2019, alcohol: '13,5 %', techSheet: true, maria: '7', adria: '7,5', place: 'Celler del nou priorat', city: 'Barcelona (Sants)' },
  { date: '27/9/2020', month: 'Setembre', wine: 'Compte ovelles', typeCa: 'Negre', grapes: 'Syrah / Cabernet sauvignon / Merlot', aging: 'jove', region: 'Penedès', vintage: 2020, alcohol: '13 %', techSheet: true, maria: '5', adria: '5,75', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '9/10/2020', month: 'Octubre', wine: 'Seré 2018', typeCa: 'Negre', grapes: 'Garnatxa / Carinyena', aging: 'criança', region: 'Montsant', vintage: 2018, alcohol: '14,5 %', techSheet: true, maria: '6,5', adria: '6,25', place: 'Taberna La Parra', city: 'Barcelona (Hostafrancs)' },
  { date: '9/10/2020', month: 'Octubre', wine: 'Vega de Nava', typeCa: 'Negre', grapes: 'Tempranillo', aging: 'reserva', region: 'Ribera del Duero', vintage: 2018, alcohol: '14 %', techSheet: true, maria: '8', adria: '8', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '23/10/2020', month: 'Octubre', wine: 'Chateldon', typeCa: 'Negre', grapes: 'Cabernet sauvignon', aging: 'reserva', region: 'Penedès', vintage: 2019, alcohol: '13,5 %', techSheet: true, maria: '8.6', adria: '9.5', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '24/10/2020', month: 'Octubre', wine: 'Matsu - el pícaro', typeCa: 'Negre', grapes: 'Tinta de toro', aging: 'jove', region: 'Toro', vintage: 2020, alcohol: '14,5 %', techSheet: true, maria: '7,5', adria: '8', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '6/11/2020', month: 'Novembre', wine: 'Titella', typeCa: 'Negre', grapes: 'Garnatxa, carinyena, merlot, tempranillo', aging: 'jove', region: 'Montsant', vintage: 2017, alcohol: '13,5 %', techSheet: true, maria: '8', adria: '8,1', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '8/11/2020', month: 'Novembre', wine: 'Ulldemolins', typeCa: 'Negre', grapes: 'Garnatxa', aging: 'criança', region: 'Montsant', vintage: 2016, alcohol: '14,5%', techSheet: true, maria: '6,5', adria: '6,75', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '20/11/2020', month: 'Novembre', wine: 'Clot d’encís blanc de negres', typeCa: 'Blanc', grapes: 'Garnatxa negre', aging: 'jove', region: 'Terra Alta', vintage: 2019, alcohol: '14%', techSheet: true, maria: '7,5', adria: '7,15', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '21/11/2020', month: 'Novembre', wine: 'Ninín', typeCa: 'Negre', grapes: 'Tempranillo', aging: 'criança', region: 'Ribera del Duero', vintage: 2018, alcohol: '14%', techSheet: true, maria: '6,75', adria: '6,9', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '1/12/2020', month: 'Desembre', wine: 'Roca Blanca', typeCa: 'Negre', grapes: 'Garnacha, mazuela, syrah', aging: 'criança', region: 'Montsant', vintage: 2016, alcohol: '13,5%', techSheet: true, maria: '6', adria: '4,25', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '4/12/2020', month: 'Desembre', wine: 'Enate', typeCa: 'Negre', grapes: 'Cabernet sauvignon, merlot', aging: 'jove', region: 'Somontano', vintage: 2017, alcohol: '15%', techSheet: true, maria: '7', adria: '8', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '6/12/2020', month: 'Desembre', wine: 'Fulget', typeCa: 'Blanc', grapes: 'Albariño', aging: '', region: 'Rías Baixas', vintage: 2019, alcohol: '12%', techSheet: true, maria: '6,5', adria: '5,5', place: "A'rogueira", city: 'Barcelona (Eixample)' },
  { date: '15/12/2020', month: 'Desembre', wine: 'Roca blanca', typeCa: 'Negre', grapes: 'Garnatxa / carinyena / sirah', aging: 'criança', region: 'Montsant', vintage: 2016, alcohol: '13,5 %', techSheet: true, maria: '5,5', adria: '4,67', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '19/12/2020', month: 'Desembre', wine: 'Castillo de Albai', typeCa: 'Negre', grapes: 'Tempranillo', aging: 'reserva', region: 'Rioja', vintage: 2016, alcohol: '13.5 %', techSheet: true, maria: '7', adria: '7,1', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '24/12/2020', month: 'Desembre', wine: 'Acústic', typeCa: 'Negre', grapes: 'Garnatxa tinta / carinyena', aging: 'criança', region: 'Montsant', vintage: 2018, alcohol: '15 %', techSheet: true, maria: '9,2', adria: '8,1', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '25/12/2020', month: 'Desembre', wine: 'Matsu - el recio', typeCa: 'Negre', grapes: 'Tinta de toro', aging: 'criança', region: 'Toro', vintage: null, alcohol: '', techSheet: false, maria: '9', adria: '7,8', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '26/12/2020', month: 'Desembre', wine: 'Roureda', typeCa: 'Negre', grapes: 'Tempranillo / Cabernet sauvignon / Merlot', aging: 'reserva', region: 'Tarragona', vintage: 2016, alcohol: '13 %', techSheet: true, maria: '', adria: '', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '15/1/2021', month: 'Gener', wine: 'Almodí', typeCa: 'Negre', grapes: 'Garnatxa', aging: 'jove', region: 'Terra Alta', vintage: 2019, alcohol: '14,5 %', techSheet: true, maria: '7,5', adria: '7,5', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '23/1/2021', month: 'Gener', wine: 'Muga', typeCa: 'Negre', grapes: 'Tempranillo / Garnatxa / Graciano', aging: 'criança', region: 'Rioja', vintage: 2017, alcohol: '14 %', techSheet: true, maria: '8', adria: '7', place: 'Casa Tat', city: 'Hospitalet del Llobregat' },
  { date: '29/1/2012', month: 'Gener', wine: "L'isard", typeCa: 'Negre', grapes: 'Garnatxa', aging: 'jove', region: 'Penedès', vintage: 2019, alcohol: '13,5 %', techSheet: false, maria: '7,7', adria: '7,1', place: 'Casa Rosset', city: 'Barcelona (Eixample)' },
  { date: '19/2/2021', month: 'Febrer', wine: 'Sumarroca classic', typeCa: 'Negre', grapes: 'Merlot / Cabernet sauvignon / Tempranillo', aging: 'jove', region: 'Penedès', vintage: 2019, alcohol: '', techSheet: false, maria: '7', adria: '8', place: 'Casa Rosset', city: '' },
  { date: '12/3/2021', month: 'Març', wine: 'Condado de Teón', typeCa: 'Negre', grapes: 'Tinta del país', aging: 'criança', region: 'Ribera del Duero', vintage: 2018, alcohol: '14 %', techSheet: false, maria: '6,5', adria: '6,1', place: 'Casa Tat', city: '' },
  { date: '23/4/2021', month: 'Abril', wine: 'Rosum', typeCa: 'Negre', grapes: 'Tempranillo', aging: 'criança', region: 'Toro', vintage: 2017, alcohol: '14,5 %', techSheet: false, maria: '8,5', adria: '7,1', place: 'Casa Tat', city: '' },
]

function parseJournalScore(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function mapTypeFromCa(value: string, wineName: string): WineType {
  const text = value.trim().toLowerCase()
  if (text.includes('blanc')) return 'white'
  if (text.includes('rosat')) return 'rose'
  if (text.includes('escum')) return 'sparkling'
  if (wineName.toLowerCase().includes('classic') || wineName.toLowerCase().includes('cava')) return 'sparkling'
  return 'red'
}

function buildMockReward(avgScore: number, region: string): WineCard['reward'] | undefined {
  if (avgScore < 88) return undefined
  if (avgScore >= 92) return { name: 'Peñín', score: Math.round(avgScore + 1) }
  if (region.toLowerCase().includes('rioja') || region.toLowerCase().includes('ribera')) return { name: 'Decanter', score: Math.round(avgScore) }
  return { name: 'Guía', score: Math.round(avgScore) }
}

function splitGrapeVarieties(grapes: string): string[] {
  return grapes
    .split(/[,/]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function doLogoPathForRegion(region: string): string | undefined {
  const map: Record<string, string> = {
    'Penedès': '/icons/DO/penedes_DO.png',
    Montsant: '/icons/DO/montanst_DO.png',
    'Ribera del Duero': '/icons/DO/ribera_del_duero_DO.png',
    Somontano: '/icons/DO/somontano_DO.jpg',
    Toro: '/icons/DO/toro_DO.jpg',
    Rioja: '/icons/DO/rioja_DO.png',
    Tarragona: '/icons/DO/tarragona_DO.png',
    'Terra Alta': '/icons/DO/terra_alta_DO.png',
    Priorat: '/icons/DO/priorat_DO.png',
    'Conca de Barberà': '/icons/DO/conca_de_barbera_DO.jpg',
    'Pla de Bages': '/icons/DO/pla_de_bages_DO.png',
    Alella: '/icons/DO/alella_DO.png',
    Empordà: '/icons/DO/emporda_DO.png',
    Navarra: '/icons/DO/navarra_DO.jpg',
    Cariñena: '/icons/DO/cariñena_DO.png',
    Calatayud: '/icons/DO/calatayud_DO.jpg',
    Cigales: '/icons/DO/cigales_DO.png',
    Arlanza: '/icons/DO/arlanza_DO.jpg',
    'Costers del Segre': '/icons/DO/costers_del_segre_DO.png',
  }

  return map[region]
}

function countryFlagEmoji(country: string): string {
  const map: Record<string, string> = {
    Spain: '🇪🇸',
    France: '🇫🇷',
    Portugal: '🇵🇹',
    Italy: '🇮🇹',
    Germany: '🇩🇪',
    Argentina: '🇦🇷',
    Chile: '🇨🇱',
    USA: '🇺🇸',
    'United States': '🇺🇸',
  }

  return map[country] ?? '🏳️'
}

const imageCycle = [
  'photos/wines/exmaple_wine-hash.png',
  'photos/wines/front_wine-hash.png',
  'photos/wines/back_wine-hash.png',
] as const

const MOCK_WINES: WineCard[] = CATALAN_JOURNAL_ROWS.map((row, index) => {
  const maria = parseJournalScore(row.maria)
  const adria = parseJournalScore(row.adria)
  const avgTen = maria != null && adria != null ? (maria + adria) / 2 : (maria ?? adria ?? 6.8)
  const avgScore = Math.round(avgTen * 100) / 10
  const type = mapTypeFromCa(row.typeCa, row.wine)
  const priceFrom = Number((9 + (avgTen * 1.9) + ((index % 5) * 1.75)).toFixed(2))
  const tags = [
    row.region,
    row.aging || 'sense criança',
    row.grapes.split(/[,/]/)[0]?.trim() || 'vi',
  ].filter(Boolean)
  const image = imageCycle[index % imageCycle.length]
  const gallery = index % 3 === 1 ? [...SHARED_GALLERY].reverse() : SHARED_GALLERY
  const technicalLabel = row.techSheet ? 'Fitxa tècnica disponible' : 'Sense fitxa tècnica'
  const scoreLabel = maria != null && adria != null ? `Maria ${maria.toFixed(2)} · Adrià ${adria.toFixed(2)}` : maria != null ? `Maria ${maria.toFixed(2)}` : adria != null ? `Adrià ${adria.toFixed(2)}` : 'Sense puntuacions'

  return {
    id: index + 1,
    name: row.wine,
    winery: row.place,
    country: 'Spain',
    region: row.region,
    type,
    vintage: row.vintage ?? 2019,
    avgScore,
    priceFrom,
    tastedAt: row.date,
    month: row.month,
    grapes: row.grapes,
    aging: row.aging || 'n/d',
    alcohol: row.alcohol || 'n/d',
    mariaScore: maria,
    adriaScore: adria,
    place: row.place,
    city: row.city || 'n/d',
    techSheet: row.techSheet,
    reward: buildMockReward(avgScore, row.region),
    doLogoImage: doLogoPathForRegion(row.region),
    rewardBadgeImage:
      index === 0 ? '/icons/awards/penin/thumbs-80/penin-91.png'
        : index === 1 ? '/icons/awards/penin/thumbs-80/penin-93.png'
          : index === 2 ? '/icons/awards/penin/thumbs-80/penin-86.png'
            : index === 3 ? '/icons/awards/penin/thumbs-80/penin-95.png'
              : undefined,
    notes: `${row.month} · ${row.region}. ${technicalLabel}. ${scoreLabel}.`,
    tags,
    image,
    gallery,
  }
})

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ca'
  const stored = window.localStorage.getItem(LOCALE_KEY)
  return stored === 'es' || stored === 'ca' ? stored : 'ca'
}

function parseUrlState(): UrlCatalogState {
  if (typeof window === 'undefined') {
    return {
      q: '',
      type: 'all' as 'all' | WineType,
      country: 'all',
      region: 'all',
      grape: 'all',
      minScore: 'all' as ScoreFilterBucket,
      sort: DEFAULT_SORT as SortKey,
      wineId: null,
    }
  }

  const params = new URLSearchParams(window.location.search)
  const typeParam = params.get('type')
  const minScoreParam = params.get('minScore')
  const sortParam = params.get('sort')
  const wineParam = params.get('wine')

  const validType: 'all' | WineType =
    typeParam === 'red' || typeParam === 'white' || typeParam === 'rose' || typeParam === 'sparkling' ? typeParam : 'all'
  const minScore: ScoreFilterBucket =
    minScoreParam === 'lt70' || minScoreParam === '70_80' || minScoreParam === '80_90' || minScoreParam === 'gte90'
      ? minScoreParam
      : minScoreParam === '90'
        ? 'gte90'
        : minScoreParam === '80' || minScoreParam === '85'
          ? '80_90'
          : 'all'
  const validSort: SortKey =
    sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'latest' || sortParam === 'score_desc'
      ? sortParam
      : DEFAULT_SORT
  const wineId = wineParam && !Number.isNaN(Number(wineParam)) ? Number(wineParam) : null

  return {
    q: params.get('q') ?? '',
    type: validType,
    country: params.get('country') ?? 'all',
    region: params.get('region') ?? 'all',
    grape: params.get('grape') ?? 'all',
    minScore,
    sort: validSort,
    wineId,
  }
}

export default function App() {
  const initialUrl = useMemo(() => parseUrlState(), [])
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const [search, setSearch] = useState(initialUrl.q)
  const [typeFilter, setTypeFilter] = useState<'all' | WineType>(initialUrl.type)
  const [countryFilter, setCountryFilter] = useState<'all' | string>(initialUrl.country)
  const [regionFilter, setRegionFilter] = useState<'all' | string>(initialUrl.region)
  const [grapeFilter, setGrapeFilter] = useState<'all' | string>(initialUrl.grape)
  const [minScoreFilter, setMinScoreFilter] = useState<ScoreFilterBucket>(initialUrl.minScore)
  const [sortKey, setSortKey] = useState<SortKey>(initialUrl.sort)
  const [selectedWineId, setSelectedWineId] = useState<number | null>(initialUrl.wineId)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const t = DICT[locale]
  const isDark = theme === 'dark'
  const logoSrc = isDark ? 'brand/logo-wordmark-dark.png' : 'brand/logo-wordmark-light.png'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWineId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onPopState = () => {
      const state = parseUrlState()
      setSearch(state.q)
      setTypeFilter(state.type)
      setCountryFilter(state.country)
      setRegionFilter(state.region)
      setGrapeFilter(state.grape)
      setMinScoreFilter(state.minScore)
      setSortKey(state.sort)
      setSelectedWineId(state.wineId)
      setActiveModalImageIndex(0)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const countries = useMemo(() => ['all', ...Array.from(new Set(MOCK_WINES.map((wine) => wine.country)))], [])
  const regions = useMemo(() => ['all', ...Array.from(new Set(MOCK_WINES.map((wine) => wine.region)))], [])
  const grapeOptions = useMemo(
    () => ['all', ...Array.from(new Set(MOCK_WINES.map((wine) => wine.grapes.split(/[,/]/)[0]?.trim()).filter(Boolean)))],
    [],
  )

  const filteredWines = useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = MOCK_WINES.filter((wine) => {
      const matchesSearch =
        q === '' ||
        wine.name.toLowerCase().includes(q) ||
        wine.winery.toLowerCase().includes(q) ||
        wine.region.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || wine.type === typeFilter
      const matchesCountry = countryFilter === 'all' || wine.country === countryFilter
      const matchesRegion = regionFilter === 'all' || wine.region === regionFilter
      const matchesGrape = grapeFilter === 'all' || wine.grapes.toLowerCase().includes(grapeFilter.toLowerCase())
      const matchesScore =
        minScoreFilter === 'all' ? true
          : minScoreFilter === 'lt70' ? wine.avgScore < 70
            : minScoreFilter === '70_80' ? wine.avgScore >= 70 && wine.avgScore < 80
              : minScoreFilter === '80_90' ? wine.avgScore >= 80 && wine.avgScore < 90
                : wine.avgScore >= 90

      return matchesSearch && matchesType && matchesCountry && matchesRegion && matchesGrape && matchesScore
    })

    return filtered.sort((a, b) => {
      if (sortKey === 'price_asc') return a.priceFrom - b.priceFrom
      if (sortKey === 'price_desc') return b.priceFrom - a.priceFrom
      if (sortKey === 'latest') return b.vintage - a.vintage
      return b.avgScore - a.avgScore
    })
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, sortKey])

  const selectedWine = useMemo(
    () => (selectedWineId == null ? null : MOCK_WINES.find((wine) => wine.id === selectedWineId) ?? null),
    [selectedWineId],
  )

  useEffect(() => {
    if (selectedWine && activeModalImageIndex >= selectedWine.gallery.length) {
      setActiveModalImageIndex(0)
    }
  }, [selectedWine, activeModalImageIndex])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (countryFilter !== 'all') params.set('country', countryFilter)
    if (regionFilter !== 'all') params.set('region', regionFilter)
    if (grapeFilter !== 'all') params.set('grape', grapeFilter)
    if (minScoreFilter !== 'all') params.set('minScore', minScoreFilter)
    if (sortKey !== DEFAULT_SORT) params.set('sort', sortKey)
    if (selectedWineId != null) params.set('wine', String(selectedWineId))

    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    const current = `${window.location.pathname}${window.location.search}`
    if (next !== current) {
      window.history.replaceState(null, '', next)
    }
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, sortKey, selectedWineId])

  const avgCatalogScore = useMemo(
    () => filteredWines.reduce((sum, wine) => sum + wine.avgScore, 0) / (filteredWines.length || 1),
    [filteredWines],
  )
  const awardCount = useMemo(() => filteredWines.filter((wine) => wine.reward).length, [filteredWines])
  const euro = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setCountryFilter('all')
    setRegionFilter('all')
    setGrapeFilter('all')
    setMinScoreFilter('all')
    setSortKey(DEFAULT_SORT)
  }

  const filterControls = (
    <>
      <div className="filters-header">
        <p className="eyebrow">{t.icons.filters} {t.filters.title}</p>
      </div>

      <label>
        <span>{t.icons.search} {t.filters.search}</span>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchPlaceholder} />
      </label>

      <label>
        <span>{t.icons.type} {t.filters.type}</span>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | WineType)}>
          <option value="all">{t.filters.allTypes}</option>
          <option value="red">{t.wineType.red}</option>
          <option value="white">{t.wineType.white}</option>
          <option value="rose">{t.wineType.rose}</option>
          <option value="sparkling">{t.wineType.sparkling}</option>
        </select>
      </label>

      <label>
        <span>{t.icons.country} {t.filters.country}</span>
        <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country === 'all' ? t.filters.allCountries : country}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{t.icons.region} {t.filters.region}</span>
        <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region === 'all' ? t.filters.allRegions : region}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{t.icons.grape} {t.filters.grape}</span>
        <select value={grapeFilter} onChange={(event) => setGrapeFilter(event.target.value)}>
          {grapeOptions.map((grape) => (
            <option key={grape} value={grape}>
              {grape === 'all' ? (locale === 'ca' ? 'Totes les varietats' : 'Todas las variedades') : grape}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-score-group" role="group" aria-label={`${t.icons.minScore} ${t.filters.minScore}`}>
        <span>{t.icons.minScore} {t.filters.minScore}</span>
        <div className="filter-score-medals">
          {[
            { key: 'all', label: t.filters.anyScore, tone: 'all' },
            { key: 'lt70', label: '<70', tone: 'base' },
            { key: '70_80', label: '70-80', tone: 'bronze' },
            { key: '80_90', label: '80-90', tone: 'silver' },
            { key: 'gte90', label: '90+', tone: 'gold' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className={`score-filter-medal ${option.tone}${minScoreFilter === option.key ? ' active' : ''}`}
              onClick={() => setMinScoreFilter(option.key as ScoreFilterBucket)}
              aria-pressed={minScoreFilter === option.key}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <label>
        <span>{t.icons.sort} {t.filters.sort}</span>
        <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
          <option value="score_desc">{t.sort.score_desc}</option>
          <option value="price_asc">{t.sort.price_asc}</option>
          <option value="price_desc">{t.sort.price_desc}</option>
          <option value="latest">{t.sort.latest}</option>
        </select>
      </label>

      <button type="button" className="clear-filters" onClick={resetFilters}>
        {t.filters.clear}
      </button>
    </>
  )

  return (
    <main className="public-shell">
      <div className="public-background" aria-hidden="true" />

      <header className="public-topbar">
        <div className="brand-block">
          <img src="brand/icon-square-64.png" className="brand-icon" alt="" aria-hidden="true" />
          <div className="brand-copy">
            <img src={logoSrc} className="brand-wordmark" alt="Vins Tat & Rosset" />
            <p>{t.appName}</p>
          </div>
        </div>

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
              <option value="ca">Català</option>
              <option value="es">Español</option>
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
          <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.winesCatalog}</a>
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.whoWeAre}</a>
          <a href="/backoffice" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.backoffice}</a>
        </nav>
      </header>

      <section className="mobile-filter-dropdown" aria-label={t.filters.title}>
        <button
          type="button"
          className={`mobile-filter-trigger${isMobileFiltersOpen ? ' active' : ''}`}
          onClick={() => setIsMobileFiltersOpen((open) => !open)}
          aria-expanded={isMobileFiltersOpen}
          aria-controls="mobile-filters-panel"
        >
          <span>{t.icons.filters} {t.filters.title}</span>
          <span className="mobile-filter-trigger-meta">
            {filteredWines.length} {t.topbar.resultCount}
          </span>
        </button>

        <div id="mobile-filters-panel" className={`mobile-filter-panel${isMobileFiltersOpen ? ' open' : ''}`}>
          {filterControls}
          <button
            type="button"
            className="mobile-filter-apply"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            {isMobileFiltersOpen ? t.topbar.closeFilters : t.topbar.openFilters}
          </button>
        </div>
      </section>

      <section className="hero-panel" id="catalog">
        <div>
          <p className="eyebrow">VINS · PUBLIC CATALOG</p>
          <h1>{t.title}</h1>
          <p className="hero-subtitle">{t.subtitle}</p>
        </div>
        <div className="hero-metrics" aria-label="catalog summary">
          <article><span>{t.icons.results} {t.topbar.resultCount}</span><strong>{filteredWines.length}</strong></article>
          <article><span>{t.icons.avgScore} {t.card.avgScore}</span><strong>{avgCatalogScore.toFixed(1)}</strong></article>
          <article><span>{t.icons.rewards} {t.card.reward}</span><strong>{awardCount}</strong></article>
        </div>
      </section>

      <section className="catalog-layout">
        <aside className="filters-panel">
          {filterControls}
        </aside>

        <section className="cards-panel">
          <div className="cards-grid">
            {filteredWines.map((wine) => {
              const isFeatured = wine.avgScore >= 90
              const scoreTier = wine.avgScore >= 90 ? 'gold' : wine.avgScore >= 80 ? 'silver' : wine.avgScore >= 70 ? 'bronze' : 'base'

              return (
                <article
                  key={wine.id}
                  className={`wine-card ${isFeatured ? 'featured' : ''} score-tier-${scoreTier}`}
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
                    <img src={wine.image} alt={wine.name} loading="lazy" />
                    <div className="wine-card-overlay" />
                    <div className="wine-card-badges">
                      {isFeatured ? <span className="gold-chip">{t.card.featured90}</span> : null}
                      {wine.rewardBadgeImage ? (
                        <span className="wine-card-award-corner-tag" aria-label={`${wine.reward?.name ?? 'Award'} ${wine.reward?.score ?? ''}`.trim()}>
                          <img src={wine.rewardBadgeImage} alt="" loading="lazy" />
                        </span>
                      ) : null}
                    </div>
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

                    <section className="wine-card-info-section" aria-label="Informacio del vi">
                      <p className="wine-card-info-title">INFORMACIO DEL VI</p>
                      <dl className="wine-card-meta">
                      <div className="wine-card-meta-box-do">
                        <dt>{t.icons.region} DO</dt>
                        <dd className="origin-with-do">
                          <span className="country-flag-badge" aria-label={wine.country} title={wine.country}>{countryFlagEmoji(wine.country)}</span>
                          {wine.doLogoImage ? (
                            <span className="do-logo-tooltip">
                              <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} DO`} loading="lazy" />
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
                        <dt>🍷 Crianza</dt>
                        <dd>{wine.aging}</dd>
                      </div>
                      <div className="wine-card-meta-box-vintage"><dt>{t.icons.vintage} {t.card.vintage}</dt><dd>{wine.vintage}</dd></div>
                      <div className="wine-card-meta-box-grapes">
                        <dt>{t.icons.grape} {t.filters.grape}</dt>
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
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </button>
                          ))}
                        </dd>
                      </div>
                      </dl>
                    </section>

                    <div className="wine-card-mobile-summary" aria-label="mobile summary">
                      <div>{wine.region}</div>
                      <div>{wine.vintage}</div>
                      <div>{wine.mariaScore != null ? `M ${wine.mariaScore.toFixed(1)}` : 'M n/d'}</div>
                      <div>{wine.adriaScore != null ? `A ${wine.adriaScore.toFixed(1)}` : 'A n/d'}</div>
                    </div>

                    <section className="wine-card-review-section" aria-label="review summary">
                      <p className="wine-card-review-title">Valoració</p>
                      <div className="wine-card-review-block">
                        <article className="wine-card-mini-box wine-card-mini-maria">
                          <span className="mini-label">👩 {t.modal.mariaScore}</span>
                          <strong>{wine.mariaScore != null ? wine.mariaScore.toFixed(2) : 'n/d'}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-adria">
                          <span className="mini-label">🧑 {t.modal.adriaScore}</span>
                          <strong>{wine.adriaScore != null ? wine.adriaScore.toFixed(2) : 'n/d'}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-date">
                          <span className="mini-label">📅 {t.modal.tastedAt}</span>
                          <strong>{wine.tastedAt}</strong>
                        </article>
                      </div>
                    </section>

                    <div className="wine-card-footer">
                      <span className="card-link">{t.card.viewDetails}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <section className="mobile-about-anchor" id="about" aria-hidden="true" />

      {selectedWine ? (
        <div className="public-modal-backdrop" role="presentation" onClick={() => setSelectedWineId(null)}>
          <section
            className="public-wine-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-wine-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="public-wine-modal-header">
              <div>
                <p className="eyebrow">{t.modal.details}</p>
                <h2 id="public-wine-modal-title">{selectedWine.name}</h2>
                <p className="muted-line">{selectedWine.winery}</p>
              </div>
              <button type="button" className="ghost-close" onClick={() => setSelectedWineId(null)}>
                {t.modal.close}
              </button>
            </header>

            <div className="public-wine-modal-grid">
              <div className="public-wine-gallery">
                <div className="public-wine-main-image">
                  <img src={selectedWine.gallery[activeModalImageIndex] ?? selectedWine.image} alt={selectedWine.name} />
                </div>
                <div className="public-wine-thumbs" aria-label={t.modal.gallery}>
                  {selectedWine.gallery.map((src, index) => (
                    <button
                      key={`${selectedWine.id}-${src}-${index}`}
                      type="button"
                      className={`public-wine-thumb ${activeModalImageIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveModalImageIndex(index)}
                    >
                      <img src={src} alt={`${selectedWine.name} ${index + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="public-wine-details">
                <section className="detail-card">
                  <h3>{t.icons.details} {t.modal.details}</h3>
                  <dl>
                    <div><dt>{t.icons.winery} {t.modal.winery}</dt><dd>{selectedWine.winery}</dd></div>
                    <div>
                      <dt>{t.icons.origin} DO</dt>
                      <dd className="origin-with-do">
                        <span className="country-flag-badge" aria-label={selectedWine.country} title={selectedWine.country}>{countryFlagEmoji(selectedWine.country)}</span>
                        {selectedWine.doLogoImage ? (
                          <span className="do-logo-tooltip">
                            <img className="do-logo-badge" src={selectedWine.doLogoImage} alt={`${selectedWine.region} DO`} loading="lazy" />
                            <span className="do-logo-tooltip-panel" role="tooltip" aria-hidden="true">
                              <img src={selectedWine.doLogoImage} alt="" loading="lazy" />
                              <span>{selectedWine.region}</span>
                            </span>
                          </span>
                        ) : null}
                        <span>{selectedWine.region}</span>
                      </dd>
                    </div>
                    <div><dt>{t.icons.type} {t.modal.style}</dt><dd>{t.wineType[selectedWine.type]} · {selectedWine.vintage}</dd></div>
                    <div className="detail-grapes-row">
                      <dt>{t.icons.grape} {t.modal.grapes}</dt>
                      <dd>
                        <div className="grape-variety-list">
                          {splitGrapeVarieties(selectedWine.grapes).map((grape) => (
                            <span key={`${selectedWine.id}-grape-${grape}`} className="grape-variety-pill">
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div><dt>{t.icons.type} {t.modal.aging}</dt><dd>{selectedWine.aging}</dd></div>
                    <div><dt>{t.icons.price} {t.modal.alcohol}</dt><dd>{selectedWine.alcohol}</dd></div>
                    <div><dt>📅 {t.modal.tastedAt}</dt><dd>{selectedWine.tastedAt}</dd></div>
                    <div><dt>🗓 {t.modal.month}</dt><dd>{selectedWine.month}</dd></div>
                    <div><dt>📍 {t.modal.place}</dt><dd>{selectedWine.place} · {selectedWine.city}</dd></div>
                    <div><dt>{t.icons.avgScore} {t.card.avgScore}</dt><dd>{selectedWine.avgScore.toFixed(1)} {t.card.points}</dd></div>
                    <div><dt>{t.icons.price} {t.card.priceFrom}</dt><dd>{euro.format(selectedWine.priceFrom)}</dd></div>
                    <div><dt>{t.icons.reward} {t.card.reward}</dt><dd>{selectedWine.reward ? `${selectedWine.reward.name}${selectedWine.reward.score ? ` · ${selectedWine.reward.score}` : ''}` : t.modal.rewardNone}</dd></div>
                  </dl>
                </section>

                <section className="detail-card score-detail-card">
                  <h3>{t.icons.avgScore} {t.card.avgScore}</h3>
                  <p className="score-detail-date">📅 {selectedWine.tastedAt} · {selectedWine.month}</p>
                  <div className="reviewer-score-grid">
                    <article className="reviewer-score reviewer-score-maria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">👩</span>
                        <strong>{t.modal.mariaScore}</strong>
                      </header>
                      <p>{selectedWine.mariaScore != null ? selectedWine.mariaScore.toFixed(2) : 'n/d'}</p>
                    </article>
                    <article className="reviewer-score reviewer-score-adria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">🧑</span>
                        <strong>{t.modal.adriaScore}</strong>
                      </header>
                      <p>{selectedWine.adriaScore != null ? selectedWine.adriaScore.toFixed(2) : 'n/d'}</p>
                    </article>
                  </div>
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tasting} {t.modal.tasting}</h3>
                  <p>{selectedWine.notes}</p>
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tags} {t.modal.tags}</h3>
                  <div className="detail-tags">
                    {selectedWine.tags.map((tag) => <span key={`${selectedWine.id}-${tag}`}>{tag}</span>)}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
