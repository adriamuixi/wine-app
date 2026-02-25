import { useI18n } from '../i18n/I18nProvider'
import type { Locale } from '../i18n/messages'

type LanguageSelectorProps = {
  compact?: boolean
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { locale, setLocale, localeLabels } = useI18n()

  return (
    <label className={`language-selector ${compact ? 'compact' : ''}`}>
      <span className="sr-only">Language</span>
      <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
        <option value="es">{localeLabels.es}</option>
        <option value="ca">{localeLabels.ca}</option>
      </select>
    </label>
  )
}

