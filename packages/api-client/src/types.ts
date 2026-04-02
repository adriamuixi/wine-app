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
export type ReviewBulletValue = 'fruity' | 'floral' | 'mineral' | 'oak_forward' | 'powerful'
export type WinePhotoType = 'front_label' | 'back_label' | 'bottle' | 'situation'
export type DoAssetType = 'do_logo' | 'region_logo'
export type ReviewSortBy = 'score' | 'name' | 'do'
export type ReviewSortDir = 'asc' | 'desc'
export type WineSortBy = 'created_at' | 'updated_at' | 'name' | 'vintage_year' | 'score'
export type WineSortDir = 'asc' | 'desc'
export type ScoreBucket = 'any' | 'lt70' | '70_80' | '80_90' | '90_plus'
export type UserFilter = number | 'me'

export interface PaginationMeta {
  page: number
  limit: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ApiHealthResponse {
  status: string
  service: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateAuthUserRequest {
  email: string
  name: string
  lastname: string
  password: string
}

export interface DeleteAuthUserRequest {
  email: string
}

export interface UpdateCurrentUserRequest {
  name: string
  lastname: string
  password?: string | null
}

export interface AuthUser {
  id: number
  email: string
  name: string
  lastname: string
}

export interface AuthUserResponse {
  user: AuthUser
}

export interface AuthTokenRequest extends LoginRequest {}

export interface AuthTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_at: string
  user: AuthUser
}

export interface ReviewListUser {
  id: number
  name: string
  lastname: string
}

export interface ReviewListDo {
  id: number
  name: string
}

export interface ReviewListWine {
  id: number
  name: string
  do: ReviewListDo | null
}

export interface ReviewListItem {
  id: number
  user: ReviewListUser
  wine: ReviewListWine
  score: number | null
  aroma: number
  appearance: number
  palate_entry: number
  body: number
  persistence: number
  bullets: ReviewBulletValue[]
  created_at: string
}

export interface ReviewListResponse {
  items: ReviewListItem[]
  pagination: PaginationMeta
}

export interface CreateReviewRequest {
  created_at?: string | null
  score?: number | null
  aroma: number
  appearance: number
  palate_entry: number
  body: number
  persistence: number
  bullets?: ReviewBulletValue[]
}

export interface UpdateReviewRequest extends CreateReviewRequest {}

export interface Review {
  id: number
  user_id: number
  wine_id: number
  score: number | null
  aroma: number
  appearance: number
  palate_entry: number
  body: number
  persistence: number
  bullets: ReviewBulletValue[]
  created_at: string | null
}

export interface ReviewResponse {
  review: Review
}

export interface CreateReviewResponse {
  review: {
    id: number
  }
}

export interface WineListDo {
  id: number
  name: string
  do_logo: string | null
  region_logo: string | null
}

export interface WineListPhoto {
  type: WinePhotoType
  url: string | null
}

export interface WineListGrape {
  id: number
  name: string
  color: 'red' | 'white' | null
  percentage: number | null
}

export interface WineListAward {
  name: string
  score: number | null
  year: number | null
}

export interface WineListReview {
  user_id: number
  name: string
  lastname: string
  created_at: string
  score: number | null
}

export interface WineListItem {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  aging_type: AgingType | null
  country: Country | null
  do: WineListDo | null
  vintage_year: number | null
  avg_score: number | null
  updated_at: string
  grapes: WineListGrape[]
  awards: WineListAward[]
  photos: WineListPhoto[]
  reviews: WineListReview[]
}

export interface WineListResponse {
  items: WineListItem[]
  pagination: PaginationMeta
}

export interface WineDetailGrape {
  id: number
  name: string
  color: 'red' | 'white'
  percentage: number | null
}

export interface WineDetailPurchasePlace {
  id: number
  place_type: 'supermarket' | 'restaurant'
  name: string
  address: string | null
  city: string | null
  country: Country
  map_data: {
    lat: number
    lng: number
    zoom?: number
  } | null
}

export interface WineDetailPurchase {
  id: number
  place: WineDetailPurchasePlace
  price_paid: number
  purchased_at: string
}

export interface WineDetailAward {
  id: number
  name: string
  score: number | null
  year: number | null
}

export interface WineDetailPhoto {
  id: number
  type: WinePhotoType | null
  url: string
  hash: string
  size: number
  extension: string
}

export interface WineDetailReviewUser {
  id: number
  name: string
  lastname: string
}

export interface WineDetailReview {
  id: number
  user: WineDetailReviewUser
  score: number | null
  aroma: number
  appearance: number
  palate_entry: number
  body: number
  persistence: number
  bullets: ReviewBulletValue[]
  created_at: string
}

export interface WineDetails {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  do: {
    id: number
    name: string
    region: string
    country: Country
    country_code: string
    do_logo: string | null
    region_logo: string | null
  } | null
  country: Country | null
  aging_type: AgingType | null
  vintage_year: number | null
  alcohol_percentage: number | null
  created_at: string
  updated_at: string
  grapes: WineDetailGrape[]
  purchases: WineDetailPurchase[]
  awards: WineDetailAward[]
  photos: WineDetailPhoto[]
  reviews: WineDetailReview[]
}

export interface WineDetailsResponse {
  wine: WineDetails
}

export interface CreateWineGrapeInput {
  grape_id: number
  percentage?: number | null
}

export interface CreateWinePlaceInput {
  place_type: 'supermarket' | 'restaurant'
  name: string
  address?: string | null
  city?: string | null
  country: Country
  map_data?: {
    lat: number
    lng: number
    zoom?: number
  } | null
}

export interface CreateWinePurchaseInput {
  place: CreateWinePlaceInput
  price_paid: number
  purchased_at: string
}

export interface CreateWineAwardInput {
  name: 'penin' | 'parker' | 'wine_spectator' | 'decanter' | 'james_suckling' | 'guia_proensa'
  score?: number | null
  year?: number | null
}

export interface CreateWineRequest {
  name: string
  winery?: string | null
  wine_type?: WineType | null
  do_id?: number | null
  country?: Country | null
  aging_type?: AgingType | null
  vintage_year?: number | null
  alcohol_percentage?: number | null
  grapes?: CreateWineGrapeInput[]
  purchases?: CreateWinePurchaseInput[]
  awards?: CreateWineAwardInput[]
}

export interface UpdateWineRequest {
  name?: string | null
  winery?: string | null
  wine_type?: WineType | null
  do_id?: number | null
  country?: Country | null
  aging_type?: AgingType | null
  vintage_year?: number | null
  alcohol_percentage?: number | null
  grapes?: CreateWineGrapeInput[]
  purchases?: CreateWinePurchaseInput[]
  awards?: CreateWineAwardInput[]
}

export interface CreateWineResponse {
  wine: {
    id: number
  }
}

export interface CreateWinePhotoResponse {
  photo: {
    id: number
    wine_id: number
    type: WinePhotoType
    url: string
    hash: string
    size: number
    extension: string
  }
}

export interface GrapeListItem {
  id: number
  name: string
  color: 'red' | 'white'
}

export interface GrapeListResponse {
  items: GrapeListItem[]
}

export interface DoListItem {
  id: number
  name: string
  region: string
  country: Country
  country_code: string
  do_logo: string | null
  region_logo: string | null
  map_data: {
    lat: number
    lng: number
    zoom?: number
  } | null
}

export interface DoListResponse {
  items: DoListItem[]
}

export interface CreateDoRequest {
  name: string
  region: string
  country: Country
  country_code: string
  do_logo?: string | null
  map_data?: {
    lat: number
    lng: number
    zoom?: number
  } | null
}

export interface UpdateDoRequest extends Partial<CreateDoRequest> {}

export interface CreateDoResponse {
  do: {
    id: number
  }
}

export interface CreateDoAssetResponse {
  asset: {
    do_id: number
    type: DoAssetType
    filename: string
    url: string
  }
}

export interface ReviewsPerMonthStatsResponse {
  months: string[]
  review_counts: number[]
  median_scores: Array<number | null>
}

export interface GenericStatsResponse {
  total_wines: number
  total_reviews: number
  my_reviews: number
  average_red: number
  average_white: number
}

export interface ScoringGenericStatsResponse {
  items: Array<{
    label: '<60' | '60-69' | '70-79' | '80-89' | '90+'
    count: number
  }>
}

export interface ReviewListQuery {
  page?: number
  limit?: number
  user_id?: UserFilter
  sort_by?: ReviewSortBy
  sort_dir?: ReviewSortDir
}

export interface WineListQuery {
  page?: number
  limit?: number
  search?: string
  wine_type?: WineType
  country?: Country
  do_id?: number
  grape_id?: number
  score_min?: number
  score_max?: number
  score_bucket?: ScoreBucket
  sort_by?: WineSortBy
  sort_dir?: WineSortDir
}

export interface DoListQuery {
  name?: string
  country?: Country
  region?: string
  user_ids?: string
  sort_by_1?: 'country' | 'region' | 'name'
  sort_by_2?: 'country' | 'region' | 'name'
  sort_by_3?: 'country' | 'region' | 'name'
}
