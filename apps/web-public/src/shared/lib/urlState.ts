import { DEFAULT_SORT } from '../../app/config/constants'
import type { ScoreFilterBucket, SortKey, UrlCatalogState, WineType } from '../../features/catalog/types'

export function parseCatalogUrlState(): UrlCatalogState {
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
    sortParam === 'price_asc'
      || sortParam === 'price_desc'
      || sortParam === 'latest'
      || sortParam === 'score_desc'
      || sortParam === 'tasting_date_desc'
      || sortParam === 'tasting_date_asc'
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

type SyncCatalogUrlStateInput = {
  search: string
  typeFilter: 'all' | WineType
  countryFilter: string
  regionFilter: string
  grapeFilter: string
  minScoreFilter: ScoreFilterBucket
  sortKey: SortKey
  selectedWineId: number | null
}

export function syncCatalogUrlState(input: SyncCatalogUrlStateInput): void {
  const params = new URLSearchParams()
  if (input.search.trim()) params.set('q', input.search.trim())
  if (input.typeFilter !== 'all') params.set('type', input.typeFilter)
  if (input.countryFilter !== 'all') params.set('country', input.countryFilter)
  if (input.regionFilter !== 'all') params.set('region', input.regionFilter)
  if (input.grapeFilter !== 'all') params.set('grape', input.grapeFilter)
  if (input.minScoreFilter !== 'all') params.set('minScore', input.minScoreFilter)
  if (input.sortKey !== DEFAULT_SORT) params.set('sort', input.sortKey)
  if (input.selectedWineId != null) params.set('wine', String(input.selectedWineId))

  const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
  const current = `${window.location.pathname}${window.location.search}`
  if (next !== current) {
    window.history.replaceState(null, '', next)
  }
}
