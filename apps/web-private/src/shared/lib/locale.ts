export function localeToIntl(locale: string): string {
  if (locale === 'ca') return 'ca-ES'
  if (locale === 'en') return 'en-US'
  return 'es-ES'
}
