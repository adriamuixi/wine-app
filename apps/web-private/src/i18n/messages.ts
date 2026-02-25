import { parse } from 'yaml'

import caRaw from './locales/ca.yaml?raw'
import esRaw from './locales/es.yaml?raw'

export type Locale = 'es' | 'ca'

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  ca: 'Català',
}

const esMessages = parse(esRaw)
const caMessages = parse(caRaw)

export const messages = {
  es: esMessages,
  ca: caMessages,
} as const

