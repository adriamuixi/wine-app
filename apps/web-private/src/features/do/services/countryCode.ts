import type { CountryFilterValue } from '../types'

const COUNTRY_CODE_BY_FILTER: Record<Exclude<CountryFilterValue, 'all'>, string> = {
  spain: 'ES',
  france: 'FR',
  italy: 'IT',
  portugal: 'PT',
  germany: 'DE',
  argentina: 'AR',
  chile: 'CL',
  united_states: 'US',
  south_africa: 'ZA',
  australia: 'AU',
}

export function toCountryIsoCode(country: Exclude<CountryFilterValue, 'all'>): string {
  return COUNTRY_CODE_BY_FILTER[country]
}
