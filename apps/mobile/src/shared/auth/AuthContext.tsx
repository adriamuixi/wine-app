import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import type { AuthUser } from '@wine-app/api-client'

import { apiClient } from '../api/client'
import { clearToken, readToken, writeToken } from './tokenStore'

type AuthContextValue = {
  isReady: boolean
  user: AuthUser | null
  token: string | null
  loginWithToken: (email: string, password: string) => Promise<void>
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    readToken()
      .then((storedToken) => {
        setToken(storedToken)
      })
      .finally(() => {
        setIsReady(true)
      })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    isReady,
    user,
    token,
    loginWithToken: async (email: string, password: string) => {
      const issued = await apiClient.issueToken({ email, password })
      await writeToken(issued.access_token)
      setToken(issued.access_token)
      setUser(issued.user)
    },
    refreshMe: async () => {
      const me = await apiClient.me()
      setUser(me.user)
    },
    logout: async () => {
      try {
        await apiClient.logout()
      } finally {
        await clearToken()
        setToken(null)
        setUser(null)
      }
    },
  }), [isReady, token, user])

  useEffect(() => {
    if (token === null) {
      setUser(null)
      return
    }

    value.refreshMe().catch(async () => {
      await clearToken()
      setToken(null)
      setUser(null)
    })
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
