import { WORLD_COUNTRY_OPTIONS, isWorldCountryValue, toWorldCountryValue } from '../lib/worldCountries'

type WorldCountrySelectProps = {
  name: string
  defaultValue: string
}

export function WorldCountrySelect({ name, defaultValue }: WorldCountrySelectProps) {
  const normalizedDefaultValue = toWorldCountryValue(defaultValue)
  const safeDefaultValue = isWorldCountryValue(normalizedDefaultValue)
    ? normalizedDefaultValue
    : WORLD_COUNTRY_OPTIONS[0]?.value ?? 'spain'

  return (
    <select name={name} defaultValue={safeDefaultValue}>
      {WORLD_COUNTRY_OPTIONS.map((country) => (
        <option key={country.value} value={country.value}>{country.label}</option>
      ))}
    </select>
  )
}
