import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type AuthUser = {
  id: number
  email: string
  name: string
  lastname: string
}

type AuthResponse = {
  user: AuthUser
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const errorBody = (await response.json()) as { error?: string }
      if (errorBody.error) {
        message = errorBody.error
      }
    } catch {
      // keep default message when response body is not JSON
    }

    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function App() {
  const [bootstrapping, setBootstrapping] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo1234')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        const data = await apiRequest<AuthResponse>('/auth/me', { method: 'GET' })
        if (active) {
          setUser(data.user)
        }
      } catch (err) {
        const status = (err as { status?: number }).status
        if (active && status !== 401) {
          setError((err as Error).message)
        }
      } finally {
        if (active) {
          setBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      active = false
    }
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(data.user)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setSubmitting(true)
    setError(null)

    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (bootstrapping) {
    return (
      <main className="app-shell">
        <section className="panel loading-panel" aria-busy="true">
          <p>Loading session...</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="panel auth-panel" aria-labelledby="login-title">
          <div className="auth-header">
            <p className="eyebrow">Wine App</p>
            <h1 id="login-title">Private Backoffice</h1>
            <p className="subtitle">Sign in to manage your wine reviews from desktop or mobile.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
                required
              />
            </label>

            {error ? (
              <p className="error-message" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="panel dashboard-panel">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Backoffice</p>
            <h1>Welcome, {user.name}</h1>
            <p className="subtitle">
              Signed in as {user.email}. This shell is ready for dashboard modules.
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={handleLogout} disabled={submitting}>
            {submitting ? 'Signing out...' : 'Logout'}
          </button>
        </header>

        {error ? (
          <p className="error-message inline" role="alert">
            {error}
          </p>
        ) : null}

        <div className="dashboard-grid">
          <article className="card">
            <h2>Authentication</h2>
            <p>Session bootstrap uses <code>/api/auth/me</code> with cookies.</p>
          </article>
          <article className="card">
            <h2>Next Step</h2>
            <p>Add routes and feature modules for wines, reviews, and admin tools.</p>
          </article>
          <article className="card">
            <h2>Responsive Ready</h2>
            <p>This layout is mobile-friendly so the private site works on phones and tablets.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
