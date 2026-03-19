import { WORLD_COUNTRY_VALUES, isWorldCountryValue, toWorldCountryValue } from '../lib/worldCountries'
import { useI18n } from '../../i18n/I18nProvider'

type WorldCountrySelectProps = {
  name: string
  defaultValue: string
}

export function WorldCountrySelect({ name, defaultValue }: WorldCountrySelectProps) {
  const { t } = useI18n()
  const normalizedDefaultValue = toWorldCountryValue(defaultValue)
  const safeDefaultValue = isWorldCountryValue(normalizedDefaultValue)
    ? normalizedDefaultValue
    : WORLD_COUNTRY_VALUES[0] ?? 'spain'

  return (
    <select name={name} defaultValue={safeDefaultValue}>
      {WORLD_COUNTRY_VALUES.map((countryValue) => {
        const key = `common.worldCountries.${countryValue}`
        const translated = t(key)
        const label = translated === key
          ? countryValue.replace(/_/g, ' ').replace(/\b\w/g, (chunk) => chunk.toUpperCase())
          : translated

        return <option key={countryValue} value={countryValue}>{label}</option>
      })}
    </select>
  )
}
