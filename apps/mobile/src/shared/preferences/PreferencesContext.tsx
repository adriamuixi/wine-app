import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AppTheme = 'light' | 'dark'
export type AppMode = 'public' | 'private'

type StoredPreferences = {
  onboarded: boolean
  theme: AppTheme
  mode: AppMode
}

type PreferencesValue = {
  isReady: boolean
  onboarded: boolean
  theme: AppTheme
  mode: AppMode
  setTheme: (theme: AppTheme) => void
  setMode: (mode: AppMode) => void
  completeOnboarding: () => void
}

const STORAGE_KEY = 'wine.mobile.preferences.v1'

const defaultPreferences: StoredPreferences = {
  onboarded: false,
  theme: 'light',
  mode: 'public',
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [prefs, setPrefs] = useState<StoredPreferences>(defaultPreferences)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw == null) {
          return
        }

        const parsed = JSON.parse(raw) as Partial<StoredPreferences>
        setPrefs({
          onboarded: parsed.onboarded ?? defaultPreferences.onboarded,
          theme: parsed.theme === 'dark' ? 'dark' : 'light',
          mode: parsed.mode === 'private' ? 'private' : 'public',
        })
      })
      .catch(() => {})
      .finally(() => setIsReady(true))
  }, [])

  const persist = (next: StoredPreferences): void => {
    setPrefs(next)
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const value = useMemo<PreferencesValue>(() => ({
    isReady,
    onboarded: prefs.onboarded,
    theme: prefs.theme,
    mode: prefs.mode,
    setTheme: (theme) => {
      persist({ ...prefs, theme })
    },
    setMode: (mode) => {
      persist({ ...prefs, mode })
    },
    completeOnboarding: () => {
      persist({ ...prefs, onboarded: true })
    },
  }), [isReady, prefs])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext)
  if (context == null) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }

  return context
}

