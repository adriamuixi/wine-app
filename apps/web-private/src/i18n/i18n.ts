import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { messages } from './messages'

if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init({
      lng: 'es',
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false,
      },
      resources: {
        es: { translation: messages.es },
        ca: { translation: messages.ca },
      },
    })
}

export { i18n }

