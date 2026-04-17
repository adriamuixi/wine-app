export type {
  GrapeApiItem,
  GrapeApiResponse,
} from '../../../shared/types/backoffice'

export type GrapeColorFilter = 'all' | 'red' | 'white'
export type GrapeSortField = 'color' | 'name'
export type GrapeSortPresetKey = 'color_name' | 'name_color'

export type GrapeEditDraft = {
  name: string
  color: Exclude<GrapeColorFilter, 'all'>
}

