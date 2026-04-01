import type { HTMLAttributes, ReactNode } from 'react'
import hljs from 'highlight.js/lib/common'
import ReactMarkdown from 'react-markdown'
import { escapeHtml } from '../../../shared/lib/text'

type ApiGuideStatus = 'idle' | 'loading' | 'ready' | 'error'

type ApiDocLabels = {
  eyebrow: string
  title: string
  refresh: string
  description: string
  loading: string
  error: string
  copy: string
  copied: string
}

type ApiDocPanelProps = {
  labels: ApiDocLabels
  apiGuideStatus: ApiGuideStatus
  apiGuideMarkdown: string
  apiGuideUrl: string | null
  apiGuideError: string | null
  copiedApiCodeKey: string | null
  onRefresh: () => void
  onCopyApiCodeBlock: (rawCode: string, copyKey: string) => Promise<void>
}

export function ApiDocPanel({
  labels,
  apiGuideStatus,
  apiGuideMarkdown,
  apiGuideUrl,
  apiGuideError,
  copiedApiCodeKey,
  onRefresh,
  onCopyApiCodeBlock,
}: ApiDocPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/wines_book.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{labels.eyebrow}</p>
              <h3>{labels.title}</h3>
            </div>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="secondary-button small" onClick={onRefresh}>
              {labels.refresh}
            </button>
          </div>
        </div>

        <p className="muted">{labels.description}</p>

        {apiGuideStatus === 'loading' ? <div className="api-doc-state">{labels.loading}</div> : null}

        {apiGuideStatus === 'error' ? (
          <div className="api-doc-state api-doc-state-error">
            <p>{labels.error}</p>
            {apiGuideUrl ? <p className="api-doc-error-detail">{apiGuideUrl}</p> : null}
            {apiGuideError ? <p className="api-doc-error-detail">{apiGuideError}</p> : null}
          </div>
        ) : null}

        {apiGuideStatus === 'ready' ? (
          <article className="api-doc-viewer">
            <div className="api-doc-markdown">
              <ReactMarkdown
                components={{
                  code(componentProps) {
                    const { inline, className, children, ...props } = componentProps as {
                      inline?: boolean
                      className?: string
                      children?: ReactNode
                    } & Record<string, unknown>
                    const rawCode = String(children).replace(/\n$/, '')
                    if (inline) {
                      return (
                        <code className={className} {...(props as HTMLAttributes<HTMLElement>)}>
                          {children}
                        </code>
                      )
                    }

                    const language = className?.replace('language-', '').trim().toLowerCase() || ''
                    if (language !== 'bash' && language !== 'json') {
                      return (
                        <code className={className} {...(props as HTMLAttributes<HTMLElement>)}>
                          {children}
                        </code>
                      )
                    }

                    const copyKey = `${language}:${rawCode.slice(0, 90)}`
                    let highlightedCode: string
                    try {
                      highlightedCode = hljs.highlight(rawCode, { language, ignoreIllegals: true }).value
                    } catch {
                      highlightedCode = escapeHtml(rawCode)
                    }

                    return (
                      <div className="api-doc-code-block">
                        <div className="api-doc-code-header">
                          <span className="api-doc-code-lang">{language}</span>
                          <button
                            type="button"
                            className="api-doc-code-copy"
                            onClick={() => {
                              void onCopyApiCodeBlock(rawCode, copyKey)
                            }}
                          >
                            {copiedApiCodeKey === copyKey ? labels.copied : labels.copy}
                          </button>
                        </div>
                        <pre>
                          <code
                            className="hljs"
                            // Trusted source: internal API guide markdown.
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                          />
                        </pre>
                      </div>
                    )
                  },
                }}
              >
                {apiGuideMarkdown}
              </ReactMarkdown>
            </div>
          </article>
        ) : null}
      </section>
    </section>
  )
}
