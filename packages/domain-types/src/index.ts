export type Locale = 'es' | 'ca' | 'en'
export type Country =
  | 'spain'
  | 'france'
  | 'italy'
  | 'portugal'
  | 'germany'
  | 'argentina'
  | 'chile'
  | 'united_states'
  | 'south_africa'
  | 'australia'

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified'
export type AgingType = 'young' | 'crianza' | 'reserve' | 'grand_reserve'
export type ReviewBullet = 'fruity' | 'floral' | 'mineral' | 'oak_forward' | 'powerful'
export type ScoreBucket = 'any' | 'lt70' | '70_80' | '80_90' | '90_plus'

export type MobileReviewDraft = {
  aroma: number
  appearance: number
  palateEntry: number
  body: number
  persistence: number
  score: number | null
  bullets: ReviewBullet[]
}

export type MobileCatalogFilters = {
  search?: string
  wineType?: WineType
  country?: Country
  scoreBucket?: ScoreBucket
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'vintage_year' | 'score'
  sortDir?: 'asc' | 'desc'
}

export const SUPPORTED_LOCALES: Locale[] = ['es', 'ca', 'en']
