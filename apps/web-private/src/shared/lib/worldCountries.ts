export type WorldCountryOption = {
  value: string
  label: string
}

const FALLBACK_REGION_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR',
  'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL',
  'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM',
  'DO', 'DZ', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FM', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT',
  'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW',
  'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT',
  'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NL', 'NO',
  'NP', 'NR', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PT', 'PW',
  'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG',
  'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SY', 'SZ',
  'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VN', 'VU', 'WS', 'YE',
  'ZA', 'ZM', 'ZW',
] as const

function getRegionCodes(): string[] {
  const withSupportedValues = Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
  if (typeof withSupportedValues.supportedValuesOf === 'function') {
    try {
      const values = withSupportedValues.supportedValuesOf('region')
      if (Array.isArray(values) && values.length > 0) {
        return values
      }
    } catch {
      // Fallback list is used when runtime does not support region introspection.
    }
  }

  return [...FALLBACK_REGION_CODES]
}

function normalizeCountryValue(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

export const WORLD_COUNTRY_OPTIONS: WorldCountryOption[] = (() => {
  try {
    const regionCodes = getRegionCodes()
    const hasDisplayNames = typeof Intl.DisplayNames === 'function'
    const displayNames = hasDisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null

    const options = regionCodes
      .map((code): WorldCountryOption | null => {
        const label = displayNames?.of(code)
        if (typeof label !== 'string' || label.trim() === '' || label.toUpperCase() === code.toUpperCase()) {
          return {
            value: code.toLowerCase(),
            label: code,
          }
        }

        return {
          value: normalizeCountryValue(label),
          label,
        }
      })
      .filter((option): option is WorldCountryOption => option !== null)
      .sort((left, right) => left.label.localeCompare(right.label))

    if (options.length > 0) {
      return options
    }
  } catch {
    // Hard fallback below.
  }

  return [
    { value: 'spain', label: 'Spain' },
    { value: 'france', label: 'France' },
    { value: 'italy', label: 'Italy' },
    { value: 'portugal', label: 'Portugal' },
    { value: 'germany', label: 'Germany' },
    { value: 'argentina', label: 'Argentina' },
    { value: 'chile', label: 'Chile' },
    { value: 'united states', label: 'United States' },
    { value: 'south africa', label: 'South Africa' },
    { value: 'australia', label: 'Australia' },
  ]
})()

const WORLD_COUNTRY_VALUES = new Set(WORLD_COUNTRY_OPTIONS.map((option) => option.value))

export function toWorldCountryValue(raw: string): string {
  return normalizeCountryValue(raw)
}

export function isWorldCountryValue(raw: string): boolean {
  return WORLD_COUNTRY_VALUES.has(normalizeCountryValue(raw))
}
