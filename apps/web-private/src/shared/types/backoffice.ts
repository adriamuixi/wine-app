export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified'

export type CountryFilterValue =
  | 'all'
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

export type WineItem = {
  id: number
  name: string
  winery: string
  type: WineType
  country: string
  region: string
  doName: string | null
  doLogo: string | null
  regionLogo: string | null
  thumbnailSrc: string
  galleryPreview: {
    bottle: string
    front: string
    back: string
    situation: string
  }
  vintageYear: number | null
  agingType: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  pricePaid: number
  averageScore: number | null
}

export type ReviewItem = {
  id: number
  wineId: number
  wineName: string
  score: number
  createdAt: string
  notes: string
  aroma?: number
  appearance?: number
  palateEntry?: number
  body?: number
  persistence?: number
  tags?: string[]
}

export type WineListApiItem = {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  country: Exclude<CountryFilterValue, 'all'> | null
  do: { id: number; name: string; do_logo: string | null; region_logo: string | null } | null
  aging_type?: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  vintage_year: number | null
  avg_score: number | null
  photos?: Array<{
    type: 'front_label' | 'back_label' | 'bottle' | 'situation'
    url: string
  }>
}

export type WineListApiPagination = {
  page: number
  limit: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type WineListApiResponse = {
  items: WineListApiItem[]
  pagination: WineListApiPagination
}

export type ReviewListApiItem = {
  id: number
  user: {
    id: number
    name: string
    lastname: string
  }
  wine: {
    id: number
    name: string
    do: {
      id: number
      name: string
    } | null
  }
  score: number | null
  aroma: number
  appearance: number
  palate_entry: number
  body: number
  persistence: number
  bullets: Array<'fruity' | 'floral' | 'mineral' | 'oak_forward' | 'powerful'>
  created_at: string
}

export type ReviewListApiResponse = {
  items: ReviewListApiItem[]
  pagination: WineListApiPagination
}

export type GrapeApiItem = {
  id: number
  name: string
  color: 'red' | 'white'
}

export type GrapeApiResponse = {
  items: GrapeApiItem[]
}

export type DoApiItem = {
  id: number
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
  country_code: string
  do_logo: string | null
  region_logo: string | null
}

export type DoApiResponse = {
  items: DoApiItem[]
}

export type DoAssetUploadResponse = {
  asset: {
    do_id: number
    type: 'do_logo' | 'region_logo'
    filename: string
    url: string
  }
}

export type DoEditDraft = {
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
  country_code: string
  do_logo: string
  region_logo: string
}

export type DoCreateDraft = {
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
  country_code: string
  do_logo: string
}

export type DoSortField = 'country' | 'region' | 'name'
export type DoSortPresetKey = 'country_region_name' | 'name_country_region' | 'region_name_country'

export type ReviewsPerMonthStatsApiResponse = {
  months: string[]
  review_counts: number[]
  median_scores: Array<number | null>
}

export type GenericStatsApiResponse = {
  total_wines: number
  total_reviews: number
  my_reviews: number
  average_red: number
  average_white: number
}

export type ScoringGenericStatsApiResponse = {
  items: Array<{
    label: '<60' | '60-69' | '70-79' | '80-89' | '90+'
    count: number
  }>
}

export type ReviewTimelinePoint = {
  label: string
  reviews: number
  median: number | null
}

export type WineDetailsApiGrape = {
  id: number
  name: string
  color: 'red' | 'white'
  percentage: number | null
}

export type WineDetailsApiPurchase = {
  id: number
  place: {
    id: number
    place_type: 'restaurant' | 'supermarket'
    name: string
    address: string | null
    city: string | null
    country: Exclude<CountryFilterValue, 'all'>
    map_data: {
      lat: number
      lng: number
    } | null
  }
  price_paid: number
  purchased_at: string
}

export type WineDetailsApiAward = {
  id: number
  name: string
  score: number | null
  year: number | null
}

export type WineDetailsApiPhoto = {
  id: number
  type: 'front_label' | 'back_label' | 'bottle' | 'situation' | null
  url: string
  hash: string
  size: number
  extension: string
}

export type WineDetailsApiReview = {
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
}

export type WineDetailsApiWine = {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  do: {
    id: number
    name: string
    region: string
    country: Exclude<CountryFilterValue, 'all'>
    country_code: string
    do_logo: string | null
    region_logo: string | null
  } | null
  country: Exclude<CountryFilterValue, 'all'> | null
  aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  vintage_year: number | null
  alcohol_percentage: number | null
  created_at: string
  updated_at: string
  grapes: WineDetailsApiGrape[]
  purchases: WineDetailsApiPurchase[]
  awards: WineDetailsApiAward[]
  photos: WineDetailsApiPhoto[]
  reviews: WineDetailsApiReview[]
}

export type WineDetailsApiResponse = {
  wine: WineDetailsApiWine
}

export type MenuKey = 'dashboard' | 'wines' | 'dos' | 'varieties' | 'doCreate' | 'wineCreate' | 'wineEdit' | 'reviews' | 'reviewCreate' | 'reviewEdit' | 'admin' | 'apiDocs' | 'settings' | 'wineProfile'
export type ThemeMode = 'light' | 'dark'
export type GalleryModalVariant = 'full' | 'compact'
export type WinePhotoSlotType = 'bottle' | 'front_label' | 'back_label' | 'situation'
export type PhotoEditorAssetType = WinePhotoSlotType | 'do_logo'
export type DoLogoCropRatio = 'photo' | '1:1' | '3:4' | '4:3' | '16:9' | '9:16'

export type AppUser = {
  id: number
  name: string
  lastname: string
  email: string
}

export type AuthApiUser = {
  id: number
  email: string
  name: string
  lastname: string
}

export type AuthApiResponse = {
  user: AuthApiUser
}

export type GrapeBlendRow = {
  id: number
  grapeId: string
  percentage: string
}

export type AwardRow = {
  id: number
  award: string
  score: string
  year: string
}

export type ReviewFormPreset = {
  wineId: string
  tastingDate: string
  overallScore: number
  aroma: number
  appearance: number
  palateEntry: number
  body: number
  persistence: number
  tags: string[]
  notes: string
}

export type MyWineReviewEntry = {
  wine: WineItem
  review: WineDetailsApiReview
}
