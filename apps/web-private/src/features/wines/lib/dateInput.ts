export function formatIsoDateToDdMmYyyy(value: string | null | undefined): string {
  if (value == null || value.trim() === '') {
    return ''
  }

  const trimmed = value.trim()
  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch
    return `${day}/${month}/${year}`
  }

  const isoDateTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/)
  if (isoDateTimeMatch) {
    const [, year, month, day] = isoDateTimeMatch
    return `${day}/${month}/${year}`
  }

  return trimmed
}

export function parseDateInputToIso(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, isoYear, isoMonth, isoDay] = isoMatch
    const year = Number(isoYear)
    const month = Number(isoMonth)
    const day = Number(isoDay)
    return isValidDateParts(year, month, day) ? `${isoYear}-${isoMonth}-${isoDay}` : null
  }

  const displayMatch = trimmed.match(/^(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{4})$/)
  if (!displayMatch) {
    return null
  }

  const day = Number(displayMatch[1])
  const month = Number(displayMatch[2])
  const year = Number(displayMatch[3])
  if (!isValidDateParts(year, month, day)) {
    return null
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }

  const candidate = new Date(Date.UTC(year, month - 1, day))
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day
}
