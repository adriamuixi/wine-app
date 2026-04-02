import type {
  ApiHealthResponse,
  AuthTokenRequest,
  AuthTokenResponse,
  AuthUserResponse,
  CreateAuthUserRequest,
  CreateDoAssetResponse,
  CreateDoRequest,
  CreateDoResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  CreateWinePhotoResponse,
  CreateWineRequest,
  CreateWineResponse,
  DeleteAuthUserRequest,
  DoListQuery,
  DoListResponse,
  GenericStatsResponse,
  GrapeListResponse,
  LoginRequest,
  ReviewListQuery,
  ReviewListResponse,
  ReviewResponse,
  ReviewsPerMonthStatsResponse,
  ScoringGenericStatsResponse,
  UpdateCurrentUserRequest,
  UpdateDoRequest,
  UpdateReviewRequest,
  UpdateWineRequest,
  WineDetailsResponse,
  WineListQuery,
  WineListResponse,
} from './types'

export class ApiError extends Error {
  public readonly status: number
  public readonly payload: unknown

  public constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export type Awaitable<T> = T | Promise<T>

export interface ApiClientOptions {
  baseUrl: string
  fetchImpl?: typeof fetch
  getAccessToken?: () => Awaitable<string | null | undefined>
  withCredentials?: boolean
}

type RequestBody = BodyInit | undefined

type QueryValue = string | number | boolean | null | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function appendQuery(url: URL, params: Record<string, QueryValue>): void {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    url.searchParams.set(key, String(value))
  }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (text.length === 0) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export class WineAppApiClient {
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch
  private readonly getAccessToken: (() => Awaitable<string | null | undefined>) | undefined
  private readonly withCredentials: boolean

  public constructor(options: ApiClientOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl)
    this.fetchImpl = options.fetchImpl ?? fetch
    this.getAccessToken = options.getAccessToken
    this.withCredentials = options.withCredentials ?? false
  }

  public async health(): Promise<ApiHealthResponse> {
    return this.request<ApiHealthResponse>('/api')
  }

  public async login(payload: LoginRequest): Promise<AuthUserResponse> {
    return this.request<AuthUserResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    })
  }

  public async issueToken(payload: AuthTokenRequest): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>('/api/auth/token', {
      method: 'POST',
      body: payload,
    })
  }

  public async me(): Promise<AuthUserResponse> {
    return this.request<AuthUserResponse>('/api/auth/me', { auth: true })
  }

  public async updateMe(payload: UpdateCurrentUserRequest): Promise<AuthUserResponse> {
    return this.request<AuthUserResponse>('/api/auth/me', {
      method: 'PUT',
      auth: true,
      body: payload,
    })
  }

  public async logout(): Promise<void> {
    await this.request<void>('/api/auth/logout', {
      method: 'POST',
      auth: true,
      expectJson: false,
    })
  }

  public async createUser(payload: CreateAuthUserRequest): Promise<AuthUserResponse> {
    return this.request<AuthUserResponse>('/api/auth/users', {
      method: 'POST',
      auth: true,
      body: payload,
    })
  }

  public async deleteUser(payload: DeleteAuthUserRequest): Promise<void> {
    await this.request<void>('/api/auth/users', {
      method: 'DELETE',
      auth: true,
      body: payload,
      expectJson: false,
    })
  }

  public async listReviews(query: ReviewListQuery = {}): Promise<ReviewListResponse> {
    return this.request<ReviewListResponse>('/api/reviews', { query: query as Record<string, QueryValue> })
  }

  public async createReview(wineId: number, payload: CreateReviewRequest): Promise<CreateReviewResponse> {
    return this.request<CreateReviewResponse>(`/api/wines/${wineId}/reviews`, {
      method: 'POST',
      auth: true,
      body: payload,
    })
  }

  public async getReview(wineId: number, reviewId: number): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/api/wines/${wineId}/reviews/${reviewId}`)
  }

  public async updateReview(wineId: number, reviewId: number, payload: UpdateReviewRequest): Promise<void> {
    await this.request<void>(`/api/wines/${wineId}/reviews/${reviewId}`, {
      method: 'PUT',
      auth: true,
      body: payload,
      expectJson: false,
    })
  }

  public async deleteReview(wineId: number, reviewId: number): Promise<void> {
    await this.request<void>(`/api/wines/${wineId}/reviews/${reviewId}`, {
      method: 'DELETE',
      auth: true,
      expectJson: false,
    })
  }

  public async listWines(query: WineListQuery = {}): Promise<WineListResponse> {
    return this.request<WineListResponse>('/api/wines', { query: query as Record<string, QueryValue> })
  }

  public async getWine(wineId: number): Promise<WineDetailsResponse> {
    return this.request<WineDetailsResponse>(`/api/wines/${wineId}`)
  }

  public async createWine(payload: CreateWineRequest): Promise<CreateWineResponse> {
    return this.request<CreateWineResponse>('/api/wines', {
      method: 'POST',
      auth: true,
      body: payload,
    })
  }

  public async updateWine(wineId: number, payload: UpdateWineRequest): Promise<void> {
    await this.request<void>(`/api/wines/${wineId}`, {
      method: 'PUT',
      auth: true,
      body: payload,
      expectJson: false,
    })
  }

  public async deleteWine(wineId: number): Promise<void> {
    await this.request<void>(`/api/wines/${wineId}`, {
      method: 'DELETE',
      auth: true,
      expectJson: false,
    })
  }

  public async uploadWinePhoto(
    wineId: number,
    payload: { type: 'front_label' | 'back_label' | 'bottle' | 'situation'; file: Blob; filename?: string },
  ): Promise<CreateWinePhotoResponse> {
    const formData = new FormData()
    formData.set('type', payload.type)
    if (payload.filename !== undefined) {
      formData.set('file', payload.file, payload.filename)
    } else {
      formData.set('file', payload.file)
    }

    return this.request<CreateWinePhotoResponse>(`/api/wines/${wineId}/photos`, {
      method: 'POST',
      auth: true,
      body: formData,
      isFormData: true,
    })
  }

  public async listGrapes(): Promise<GrapeListResponse> {
    return this.request<GrapeListResponse>('/api/grapes')
  }

  public async listDos(query: DoListQuery = {}): Promise<DoListResponse> {
    return this.request<DoListResponse>('/api/dos', { query: query as Record<string, QueryValue> })
  }

  public async createDo(payload: CreateDoRequest): Promise<CreateDoResponse> {
    return this.request<CreateDoResponse>('/api/dos', {
      method: 'POST',
      auth: true,
      body: payload,
    })
  }

  public async updateDo(doId: number, payload: UpdateDoRequest): Promise<void> {
    await this.request<void>(`/api/dos/${doId}`, {
      method: 'PUT',
      auth: true,
      body: payload,
      expectJson: false,
    })
  }

  public async deleteDo(doId: number): Promise<void> {
    await this.request<void>(`/api/dos/${doId}`, {
      method: 'DELETE',
      auth: true,
      expectJson: false,
    })
  }

  public async uploadDoAsset(
    doId: number,
    payload: { type: 'do_logo' | 'region_logo'; file: Blob; filename?: string },
  ): Promise<CreateDoAssetResponse> {
    const formData = new FormData()
    formData.set('type', payload.type)
    if (payload.filename !== undefined) {
      formData.set('file', payload.file, payload.filename)
    } else {
      formData.set('file', payload.file)
    }

    return this.request<CreateDoAssetResponse>(`/api/dos/${doId}/assets`, {
      method: 'POST',
      auth: true,
      body: formData,
      isFormData: true,
    })
  }

  public async reviewsPerMonthStats(): Promise<ReviewsPerMonthStatsResponse> {
    return this.request<ReviewsPerMonthStatsResponse>('/api/stats/reviews-per-month', { auth: true })
  }

  public async genericStats(): Promise<GenericStatsResponse> {
    return this.request<GenericStatsResponse>('/api/stats/generic', { auth: true })
  }

  public async scoringGenericStats(): Promise<ScoringGenericStatsResponse> {
    return this.request<ScoringGenericStatsResponse>('/api/stats/scoring-generic', { auth: true })
  }

  private async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      auth?: boolean
      body?: unknown
      query?: Record<string, QueryValue>
      expectJson?: boolean
      isFormData?: boolean
    } = {},
  ): Promise<T> {
    const url = new URL(path, `${this.baseUrl}/`)
    if (options.query !== undefined) {
      appendQuery(url, options.query)
    }

    const headers = new Headers()
    headers.set('Accept', 'application/json')

    let body: RequestBody
    if (options.body !== undefined) {
      if (options.isFormData === true) {
        body = options.body as BodyInit
      } else {
        headers.set('Content-Type', 'application/json')
        body = JSON.stringify(options.body)
      }
    }

    if (options.auth === true) {
      const accessToken = await this.getAccessToken?.()
      if (accessToken !== undefined && accessToken !== null && accessToken !== '') {
        headers.set('Authorization', `Bearer ${accessToken}`)
      }
    }

    const requestInit: RequestInit = {
      method: options.method ?? 'GET',
      headers,
      credentials: this.withCredentials ? 'include' : 'omit',
    }
    if (body !== undefined) {
      requestInit.body = body
    }

    const response = await this.fetchImpl(url, requestInit)

    if (!response.ok) {
      const payload = await this.safeParseJson(response)
      const message = this.extractErrorMessage(payload, response.statusText || `HTTP ${response.status}`)
      throw new ApiError(response.status, message, payload)
    }

    if (options.expectJson === false) {
      return undefined as T
    }

    if (response.status === 204) {
      return undefined as T
    }

    return readJsonResponse<T>(response)
  }

  private async safeParseJson(response: Response): Promise<unknown> {
    try {
      return await response.json()
    } catch {
      return undefined
    }
  }

  private extractErrorMessage(payload: unknown, fallback: string): string {
    if (isRecord(payload) && typeof payload.error === 'string' && payload.error.trim() !== '') {
      return payload.error.trim()
    }
    return fallback
  }
}

export function createApiClient(options: ApiClientOptions): WineAppApiClient {
  return new WineAppApiClient(options)
}
