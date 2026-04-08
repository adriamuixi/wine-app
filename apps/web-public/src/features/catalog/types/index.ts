export type ThemeMode = 'light' | 'dark'
export type WineType = 'red' | 'white' | 'rose' | 'sparkling'
export type SortKey = 'score_desc' | 'price_asc' | 'price_desc' | 'latest' | 'tasting_date_desc' | 'tasting_date_asc'
export type ScoreFilterBucket = 'all' | 'lt70' | '70_80' | '80_90' | 'gte90'

export type UrlCatalogState = {
  q: string
  type: 'all' | WineType
  country: string
  region: string
  grape: string
  minScore: ScoreFilterBucket
  sort: SortKey
  wineId: number | null
}

export type WineCard = {
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
  purchaseAddress: string | null
  purchaseCountry: string | null
  purchaseDateIso: string | null
  purchaseMap: {
    lat: number
    lng: number
  } | null
  techSheet: boolean
  reward?: {
    name: string
    score?: number
  }
  rewardBadgeImage?: string
  doLogoImage?: string
  regionLogoImage?: string
  notes: string
  tags: string[]
  image: string
  gallery: string[]
  tastingDateSortTs: number | null
}

export type AwardApiName = 'penin' | 'parker' | 'wine_spectator' | 'decanter' | 'james_suckling' | 'guia_proensa'
export type AwardApiValue = {
  name: AwardApiName
  score: number | null
  year: number | null
  value?: string | null
}

export type WineListApiItem = {
  id: number
  name: string
  winery: string | null
  wine_type: 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified' | null
  aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  country: 'spain' | 'france' | 'italy' | 'portugal' | 'germany' | 'argentina' | 'chile' | 'united_states' | 'south_africa' | 'australia' | null
  do: {
    id: number
    name: string
    do_logo: string | null
    region_logo: string | null
  } | null
  vintage_year: number | null
  avg_score: number | null
  updated_at: string
  grapes: Array<{
    id: number
    name: string
    color: 'red' | 'white' | null
    percentage: number | null
  }>
  awards: AwardApiValue[]
  reviews: Array<{
    user_id: number
    name: string
    lastname: string
    created_at: string
    score: number | null
  }>
  photos: Array<{
    type: 'front_label' | 'back_label' | 'bottle' | 'situation'
    url: string | null
  }>
}

export type WineListApiResponse = {
  items: WineListApiItem[]
  pagination: {
    page: number
    limit: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export type WineDetailsApiResponse = {
  wine?: {
    id: number
    name: string
    winery: string | null
    wine_type: 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified' | null
    aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
    country: 'spain' | 'france' | 'italy' | 'portugal' | 'germany' | 'argentina' | 'chile' | 'united_states' | 'south_africa' | 'australia' | null
    do: {
      id: number
      name: string
      do_logo: string | null
      region_logo: string | null
    } | null
    vintage_year: number | null
    alcohol_percentage: number | null
    grapes: Array<{
      id: number
      name: string
      color: 'red' | 'white' | null
      percentage: number | null
    }>
    awards: Array<{
      id: number
      name: AwardApiName
      score: number | null
      year: number | null
      value?: string | null
    }>
    photos: Array<{
      id: number
      type: 'front_label' | 'back_label' | 'bottle' | 'situation' | null
      url: string
    }>
    purchases: Array<{
      id: number
      place: {
        id: number
        name: string
        address: string | null
        city: string | null
        country: 'spain' | 'france' | 'italy' | 'portugal' | 'germany' | 'argentina' | 'chile' | 'united_states' | 'south_africa' | 'australia'
        map_data: {
          lat: number
          lng: number
        } | null
      }
      price_paid: number
      purchased_at: string
    }>
    reviews: Array<{
      id: number
      user: {
        id: number
        name: string
        lastname: string
      }
      score: number | null
      aroma: number
      appearance: number
      palate_entry: number
      body: number
      persistence: number
      bullets: Array<'fruity' | 'floral' | 'mineral' | 'oak_forward' | 'powerful'>
      created_at: string
    }>
  }
}
