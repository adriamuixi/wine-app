import { messages, type Locale } from '../../i18n/messages'

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function countryFlagEmoji(country: string): string {
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

export function countryFlagPath(country: string): string | null {
  const map: Record<string, string> = {
    Spain: '/images/flags/country/spain.png',
    France: '/images/flags/country/france.png',
    Italy: '/images/flags/country/italy.png',
    Portugal: '/images/flags/country/portugal.png',
    Germany: '/images/flags/country/germany.png',
    Argentina: '/images/flags/country/argentina.png',
    Chile: '/images/flags/country/chile.png',
    USA: '/images/flags/country/united_states.png',
    'United States': '/images/flags/country/united_states.png',
    'South Africa': '/images/flags/country/south_africa.png',
    Australia: '/images/flags/country/australia.png',
  }
  return map[country] ?? null
}

export function localizedCountryName(country: string, locale: Locale): string {
  const countries = messages[locale].common?.countries ?? {}
  const map: Record<string, string> = {
    Spain: countries.spain ?? 'Spain',
    France: countries.france ?? 'France',
    Italy: countries.italy ?? 'Italy',
    Portugal: countries.portugal ?? 'Portugal',
    Germany: countries.germany ?? 'Germany',
    Argentina: countries.argentina ?? 'Argentina',
    Chile: countries.chile ?? 'Chile',
    'United States': countries.united_states ?? 'United States',
    'South Africa': countries.south_africa ?? 'South Africa',
    Australia: countries.australia ?? 'Australia',
  }
  return map[country] ?? country
}

function spanishAutonomousCommunity(region: string): { name: string; slug: string } | null {
  const normalizeRegionKey = (value: string): string => normalizeSearchText(value).replace(/[^a-z0-9]+/g, ' ').trim()

  const slugToCommunityName: Record<string, string> = {
    andalucia: 'Andalucía',
    aragon: 'Aragón',
    asturias: 'Asturias',
    canarias: 'Canarias',
    castilla_y_leon: 'Castilla y León',
    castilla_la_mancha: 'Castilla-La Mancha',
    cataluna: 'Cataluña',
    comunidad_valenciana: 'Comunidad Valenciana',
    extremadura: 'Extremadura',
    galicia: 'Galicia',
    baleares: 'Islas Baleares',
    la_rioja: 'La Rioja',
    madrid: 'Madrid',
    murcia: 'Murcia',
    navarra: 'Navarra',
    pais_vasco: 'País Vasco',
  }

  const regionToCommunitySlug: Record<string, keyof typeof slugToCommunityName> = {
    andalucia: 'andalucia',
    aragon: 'aragon',
    asturias: 'asturias',
    canarias: 'canarias',
    'castilla y leon': 'castilla_y_leon',
    'castilla leon': 'castilla_y_leon',
    'castilla la mancha': 'castilla_la_mancha',
    cataluna: 'cataluna',
    'comunidad valenciana': 'comunidad_valenciana',
    extremadura: 'extremadura',
    galicia: 'galicia',
    'islas baleares': 'baleares',
    baleares: 'baleares',
    'la rioja': 'la_rioja',
    madrid: 'madrid',
    murcia: 'murcia',
    navarra: 'navarra',
    'pais vasco': 'pais_vasco',
    'terra alta': 'cataluna',
    penedes: 'cataluna',
    montsant: 'cataluna',
    tarragona: 'cataluna',
    priorat: 'cataluna',
    'conca de barbera': 'cataluna',
    'pla de bages': 'cataluna',
    alella: 'cataluna',
    emporda: 'cataluna',
    'costers del segre': 'cataluna',
    rioja: 'la_rioja',
    'ribera del duero': 'castilla_y_leon',
    toro: 'castilla_y_leon',
    cigales: 'castilla_y_leon',
    arlanza: 'castilla_y_leon',
    somontano: 'aragon',
    carinena: 'aragon',
    calatayud: 'aragon',
    'rias baixas': 'galicia',
  }

  const slug = regionToCommunitySlug[normalizeRegionKey(region)]
  if (!slug) {
    return null
  }

  return {
    name: slugToCommunityName[slug],
    slug,
  }
}

export function autonomousCommunityNameForRegion(region: string): string | null {
  const community = spanishAutonomousCommunity(region)
  return community?.name ?? null
}
