import { DEFAULT_PUBLIC_WINE_IMAGE_LIGHT } from '../../../app/config/constants'
import type { Locale } from '../../../i18n/messages'
import { messages } from '../../../i18n/messages'
import { resolveApiBaseUrl } from '../../../shared/lib/env'
import { localeToIntl } from '../../../shared/lib/locale'
import type { AwardApiName, AwardApiValue, WineCard, WineDetailsApiResponse, WineListApiItem, WineType } from '../types'

function awardLabel(name: AwardApiName): string {
  if (name === 'penin') return 'Peñín'
  if (name === 'wine_spectator') return 'Wine Spectator'
  if (name === 'james_suckling') return 'James Suckling'
  if (name === 'guia_proensa') return 'Guía Proensa'
  if (name === 'decanter') return 'Decanter'
  return 'Parker'
}

function peninBadgeImagePath(score: number | null | undefined): string | undefined {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return undefined
  }

  const rounded = Math.round(score)
  if (rounded < 86 || rounded > 99) {
    return undefined
  }

  return `/images/icons/awards/penin/penin-${rounded}.png`
}

function decanterBadgeImagePath(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === '') {
    return undefined
  }

  const map: Record<string, string> = {
    platinum: '/images/icons/awards/decanter/decanter_platinum.png',
    gold: '/images/icons/awards/decanter/decanter_gold.png',
    silver: '/images/icons/awards/decanter/decanter_silver.png',
    bronze: '/images/icons/awards/decanter/decanter_bronze.png',
  }

  return map[normalized]
}

function awardBadgeImagePath(award: Pick<AwardApiValue, 'name' | 'score' | 'value'>): string | undefined {
  if (award.name === 'penin') {
    return peninBadgeImagePath(award.score)
  }

  if (award.name === 'decanter') {
    return decanterBadgeImagePath(award.value)
  }

  if (award.name === 'wine_spectator') {
    return '/images/icons/awards/wine_spectator/logo.png'
  }

  return undefined
}

function mapPrimaryAwardToReward(
  award: Pick<AwardApiValue, 'name' | 'score' | 'value'> | undefined,
): { reward?: WineCard['reward']; rewardBadgeImage?: string } {
  if (!award) {
    return {}
  }

  const rewardScore = typeof award.score === 'number' && Number.isFinite(award.score)
    ? Math.round(award.score)
    : undefined
  const reward: WineCard['reward'] = {
    name: awardLabel(award.name),
    score: rewardScore,
  }

  return {
    reward,
    rewardBadgeImage: awardBadgeImagePath(award),
  }
}

export function resolveApiAssetUrl(path: string): string {
  const trimmed = path.trim()
  if (trimmed === '') {
    return DEFAULT_PUBLIC_WINE_IMAGE_LIGHT
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  const base = resolveApiBaseUrl()
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

function mapApiWineType(value: WineListApiItem['wine_type']): WineType {
  if (value === 'white' || value === 'rose' || value === 'sparkling') {
    return value
  }
  return 'red'
}

export function countryCodeToLabel(value: WineListApiItem['country']): string {
  const map: Record<NonNullable<WineListApiItem['country']>, string> = {
    spain: 'Spain',
    france: 'France',
    italy: 'Italy',
    portugal: 'Portugal',
    germany: 'Germany',
    argentina: 'Argentina',
    chile: 'Chile',
    united_states: 'United States',
    south_africa: 'South Africa',
    australia: 'Australia',
  }
  if (!value) return 'Spain'
  return map[value]
}

export function doLogoPathFromImageName(logoImage: string | null | undefined): string | undefined {
  if (!logoImage || logoImage.trim() === '') {
    return undefined
  }

  return `/images/icons/DO/${logoImage}`
}

export function regionLogoPathFromImageName(regionLogo: string | null | undefined): string | undefined {
  if (!regionLogo || regionLogo.trim() === '') {
    return undefined
  }

  if (regionLogo === 'united_states.png') {
    return `/images/flags/country/${regionLogo}`
  }

  return `/images/flags/regions/${regionLogo}`
}

function mapAgingTypeLabel(value: WineListApiItem['aging_type'], locale: Locale): string {
  const fallback = messages[locale].common.notAvailableShort
  if (value == null) return fallback
  const label = messages[locale].common?.agingType?.[value]
  if (typeof label === 'string' && label.trim() !== '') {
    return label
  }
  return fallback
}

function mapWineGrapesLabel(grapes: Array<{ name: string }> | undefined): string {
  if (!Array.isArray(grapes) || grapes.length === 0) {
    return '-'
  }

  const names = grapes
    .map((grape) => grape.name.trim())
    .filter((name) => name !== '')

  return names.length > 0 ? names.join(', ') : '-'
}

function mapUserScoresFromListReviews(
  reviews: WineListApiItem['reviews'] | undefined,
): { adriaScore: number | null; mariaScore: number | null } {
  const adria = Array.isArray(reviews) ? reviews.find((review) => review.user_id === 1) : undefined
  const maria = Array.isArray(reviews) ? reviews.find((review) => review.user_id === 2) : undefined

  return {
    adriaScore: typeof adria?.score === 'number' ? adria.score : null,
    mariaScore: typeof maria?.score === 'number' ? maria.score : null,
  }
}

function mapUserScoresFromDetailReviews(
  reviews: NonNullable<WineDetailsApiResponse['wine']>['reviews'] | undefined,
): { adriaScore: number | null; mariaScore: number | null } {
  const adria = Array.isArray(reviews) ? reviews.find((review) => review.user?.id === 1) : undefined
  const maria = Array.isArray(reviews) ? reviews.find((review) => review.user?.id === 2) : undefined

  return {
    adriaScore: typeof adria?.score === 'number' ? adria.score : null,
    mariaScore: typeof maria?.score === 'number' ? maria.score : null,
  }
}

export function mapWineListItemToWineCard(item: WineListApiItem, locale: Locale): WineCard {
  const byType: Record<'bottle' | 'front_label' | 'back_label' | 'situation', string> = {
    bottle: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    front_label: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    back_label: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    situation: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
  }

  ;(item.photos ?? []).forEach((photo) => {
    if (!photo?.url || !photo?.type) return
    byType[photo.type] = resolveApiAssetUrl(photo.url)
  })

  const gallery = [byType.bottle, byType.front_label, byType.back_label, byType.situation]
  const avgScore = typeof item.avg_score === 'number' && Number.isFinite(item.avg_score)
    ? Math.round(item.avg_score * 10) / 10
    : 0
  const firstReviewCreatedAt = Array.isArray(item.reviews) && item.reviews.length > 0
    ? item.reviews[0]?.created_at
    : undefined
  const tastingSourceDate = typeof item.purchased_at === 'string' && item.purchased_at.trim() !== ''
    ? item.purchased_at
    : typeof firstReviewCreatedAt === 'string' && firstReviewCreatedAt.trim() !== ''
    ? firstReviewCreatedAt
    : item.updated_at
  const tastingDate = new Date(tastingSourceDate)
  const dateLocale = localeToIntl(locale)
  const tastedAt = Number.isNaN(tastingDate.getTime())
    ? '-'
    : new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tastingDate)
  const month = Number.isNaN(tastingDate.getTime())
    ? '-'
    : new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(tastingDate)
  const region = item.do?.name?.trim() || '-'
  const type = mapApiWineType(item.wine_type)
  const { reward, rewardBadgeImage } = mapPrimaryAwardToReward(item.awards?.[0])
  const userScores = mapUserScoresFromListReviews(item.reviews)

  return {
    id: item.id,
    name: item.name?.trim() || '-',
    winery: item.winery?.trim() || '-',
    country: countryCodeToLabel(item.country),
    region,
    type,
    vintage: item.vintage_year ?? new Date().getFullYear(),
    avgScore,
    priceFrom: typeof item.price_paid === 'number' && Number.isFinite(item.price_paid) ? item.price_paid : 0,
    tastedAt,
    month,
    grapes: mapWineGrapesLabel(item.grapes),
    aging: mapAgingTypeLabel(item.aging_type, locale),
    alcohol: messages[locale].common.notAvailableShort,
    mariaScore: userScores.mariaScore,
    adriaScore: userScores.adriaScore,
    place: item.winery?.trim() || '-',
    city: '-',
    purchaseAddress: null,
    purchaseCountry: null,
    purchaseDateIso: typeof item.purchased_at === 'string' && item.purchased_at.trim() !== '' ? item.purchased_at : null,
    purchaseMap: null,
    techSheet: false,
    reward,
    doLogoImage: doLogoPathFromImageName(item.do?.do_logo),
    regionLogoImage: regionLogoPathFromImageName(item.do?.region_logo),
    rewardBadgeImage,
    notes: '',
    tags: [region, type],
    image: byType.bottle,
    gallery,
    tastingDateSortTs: Number.isNaN(tastingDate.getTime()) ? null : tastingDate.getTime(),
  }
}

export function mergeWineCardWithDetails(card: WineCard, details: NonNullable<WineDetailsApiResponse['wine']>, locale: Locale): WineCard {
  const byType: Record<'bottle' | 'front_label' | 'back_label' | 'situation', string> = {
    bottle: card.gallery[0] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    front_label: card.gallery[1] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    back_label: card.gallery[2] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    situation: card.gallery[3] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
  }

  ;(details.photos ?? []).forEach((photo) => {
    if (!photo?.type || !photo?.url) return
    byType[photo.type] = resolveApiAssetUrl(photo.url)
  })

  const gallery = [byType.bottle, byType.front_label, byType.back_label, byType.situation]
  const lastPurchase = Array.isArray(details.purchases) && details.purchases.length > 0 ? details.purchases[0] : null
  const rewardMapping = mapPrimaryAwardToReward(Array.isArray(details.awards) ? details.awards[0] : undefined)
  const userScores = mapUserScoresFromDetailReviews(details.reviews)
  const tastedDate = lastPurchase?.purchased_at ? new Date(lastPurchase.purchased_at) : null
  const dateLocale = localeToIntl(locale)

  return {
    ...card,
    name: details.name?.trim() || card.name,
    winery: details.winery?.trim() || card.winery,
    country: countryCodeToLabel(details.country) || card.country,
    region: details.do?.name?.trim() || card.region,
    type: mapApiWineType(details.wine_type),
    vintage: details.vintage_year ?? card.vintage,
    grapes: mapWineGrapesLabel(details.grapes),
    aging: mapAgingTypeLabel(details.aging_type, locale),
    mariaScore: userScores.mariaScore ?? card.mariaScore,
    adriaScore: userScores.adriaScore ?? card.adriaScore,
    alcohol: typeof details.alcohol_percentage === 'number' ? `${details.alcohol_percentage}%` : card.alcohol,
    priceFrom: typeof lastPurchase?.price_paid === 'number' ? lastPurchase.price_paid : card.priceFrom,
    tastedAt: tastedDate && !Number.isNaN(tastedDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tastedDate)
      : card.tastedAt,
    month: tastedDate && !Number.isNaN(tastedDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(tastedDate)
      : card.month,
    place: lastPurchase?.place?.name || card.place,
    city: lastPurchase?.place?.city || card.city,
    purchaseAddress: lastPurchase?.place?.address ?? card.purchaseAddress,
    purchaseCountry: lastPurchase?.place?.country ? countryCodeToLabel(lastPurchase.place.country) : card.purchaseCountry,
    purchaseDateIso: lastPurchase?.purchased_at ?? card.purchaseDateIso,
    purchaseMap: lastPurchase?.place?.map_data ?? card.purchaseMap,
    reward: rewardMapping.reward ?? card.reward,
    rewardBadgeImage: rewardMapping.rewardBadgeImage ?? card.rewardBadgeImage,
    doLogoImage: doLogoPathFromImageName(details.do?.do_logo) ?? card.doLogoImage,
    regionLogoImage: regionLogoPathFromImageName(details.do?.region_logo) ?? card.regionLogoImage,
    image: byType.bottle,
    gallery,
    tastingDateSortTs: tastedDate && !Number.isNaN(tastedDate.getTime())
      ? tastedDate.getTime()
      : card.tastingDateSortTs,
  }
}
