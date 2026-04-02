import type { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'
import type { MyWineReviewEntry, ReviewListApiItem, WineDetailsApiReview } from '../types'
import type { Locale } from '../../../i18n/messages'

type ReviewsPanelProps = {
  t: (key: string) => string
  labels: {
    reviews: {
      edit: {
        title: string
        editAction: string
      }
      create: {
        palateEntry: string
      }
    }
  }
  reviewTotalWines: number
  showCreateButton?: boolean
  myReviewEntries: MyWineReviewEntry[]
  reviewComparisonByMyReviewId: Record<number, ReviewListApiItem>
  myReviewSummaryStatus: 'idle' | 'loading' | 'ready' | 'error'
  myReviewSummaryError: string | null
  reviewActionError: string | null
  reviewSortOrder: 'score_desc' | 'score_asc' | 'name_asc' | 'name_desc' | 'do_asc' | 'do_desc'
  reviewDeleteBusyId: number | null
  locale: Locale
  reviewEnumToTag: Record<WineDetailsApiReview['bullets'][number], string>
  onOpenReviewCreate: () => void
  onReviewSortOrderChange: (value: 'score_desc' | 'score_asc' | 'name_asc' | 'name_desc' | 'do_asc' | 'do_desc') => void
  onOpenReviewEdit: (entry: MyWineReviewEntry) => void
  onDeleteReview: (entry: MyWineReviewEntry) => void
  countryFlagPath: (country: string) => string | null
  countryFlagEmoji: (country: string) => string
  localizedCountryName: (country: string, locale: Locale) => string
  doLogoPathFromImageName: (imageName: string | null) => string | null
  fallbackToDefaultWineIcon: (event: SyntheticEvent<HTMLImageElement>) => void
  fallbackToAdminAsset: (event: SyntheticEvent<HTMLImageElement>) => void
  formatApiDate: (value: string, locale: Locale) => string
  medalToneFromTen: (score: number | null) => string
  medalToneFromHundred: (score: number | null) => string
}

export function ReviewsPanel({
  t,
  labels,
  reviewTotalWines,
  showCreateButton = true,
  myReviewEntries,
  reviewComparisonByMyReviewId,
  myReviewSummaryStatus,
  myReviewSummaryError,
  reviewActionError,
  reviewSortOrder,
  reviewDeleteBusyId,
  locale,
  reviewEnumToTag,
  onOpenReviewCreate,
  onReviewSortOrderChange,
  onOpenReviewEdit,
  onDeleteReview,
  countryFlagPath,
  countryFlagEmoji,
  localizedCountryName,
  doLogoPathFromImageName,
  fallbackToDefaultWineIcon,
  fallbackToAdminAsset,
  formatApiDate,
  medalToneFromTen,
  medalToneFromHundred,
}: ReviewsPanelProps) {
  const [openComparisonReviewId, setOpenComparisonReviewId] = useState<number | null>(null)

  useEffect(() => {
    if (openComparisonReviewId == null) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      const clickedInsideComparison = target instanceof Element && target.closest('.review-compare-anchor') != null
      if (clickedInsideComparison) {
        return
      }

      setOpenComparisonReviewId(null)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenComparisonReviewId(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openComparisonReviewId])

  const formatScoreDifference = (ownValue: number | null, otherValue: number | null): string => {
    if (ownValue == null || otherValue == null) {
      return '—'
    }

    const diff = otherValue - ownValue
    if (diff > 0) {
      return `+${diff}`
    }

    return String(diff)
  }

  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header review-summary-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/glass_hand.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{labels.reviews.edit.title}</p>
              <h3>{t('ui.summary_reviews')}</h3>
            </div>
          </div>
          <div className="panel-header-actions">
            {showCreateButton ? (
              <button type="button" className="primary-button" onClick={onOpenReviewCreate}>
                {t('ui.create_review')}
              </button>
            ) : null}
          </div>
        </div>

        <div className="review-kpi-strip">
          <article className="review-kpi-card">
            <p>{t('ui.wines_total')}</p>
            <strong>{reviewTotalWines}</strong>
            <span>{t('ui.catalog_global')}</span>
          </article>
          <article className="review-kpi-card review-kpi-card-mine">
            <p>{t('ui.my_reviews')}</p>
            <strong>{myReviewEntries.length}</strong>
            <span>{t('ui.current_account')}</span>
          </article>
          <article className="review-kpi-card review-kpi-card-pending">
            <p>{t('ui.pending')}</p>
            <strong>{Math.max(0, reviewTotalWines - myReviewEntries.length)}</strong>
            <span>{t('ui.wines_by_to_review')}</span>
          </article>
        </div>

        {myReviewSummaryStatus === 'error' ? (
          <p className="error-message">{myReviewSummaryError ?? t('ui.not_could_calculate_summary')}</p>
        ) : null}
        {reviewActionError ? <p className="error-message">{reviewActionError}</p> : null}

        <section className="review-my-list">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t('ui.my_reviews_section')}</p>
              <h3>{t('ui.list_reviews_your_cuenta')}</h3>
            </div>
            <div className="panel-header-actions">
              <label className="review-list-filter">
                <span>{t('ui.sort_order')}</span>
                <select
                  value={reviewSortOrder}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === 'score_desc' || value === 'score_asc' || value === 'name_asc' || value === 'name_desc' || value === 'do_asc' || value === 'do_desc') {
                      onReviewSortOrderChange(value)
                    }
                  }}
                >
                  <option value="score_desc">{t('ui.sort_score')} · {t('ui.sort_direction_desc')}</option>
                  <option value="score_asc">{t('ui.sort_score')} · {t('ui.sort_direction_asc')}</option>
                  <option value="name_asc">{t('ui.sort_wine_name')} · {t('ui.sort_direction_asc')}</option>
                  <option value="name_desc">{t('ui.sort_wine_name')} · {t('ui.sort_direction_desc')}</option>
                  <option value="do_asc">{t('ui.sort_do')} · {t('ui.sort_direction_asc')}</option>
                  <option value="do_desc">{t('ui.sort_do')} · {t('ui.sort_direction_desc')}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="list-stack">
            {myReviewEntries.length > 0 ? myReviewEntries.map((entry) => {
              const doRegion = entry.wine.doName ?? entry.wine.region
              const doLabel = doRegion && doRegion !== '-' ? doRegion : t('ui.without_do')
              const doLogoPath = doLogoPathFromImageName(entry.wine.doLogo)
              const countryFlagPathValue = countryFlagPath(entry.wine.country)
              const comparisonReview = reviewComparisonByMyReviewId[entry.review.id]
              const isComparisonOpen = openComparisonReviewId === entry.review.id

              return (
                <article key={`my-review-${entry.review.id}`} className="review-card">
                  <div className="review-main-col">
                    <div className="review-card-top">
                      <img
                        src={entry.wine.thumbnailSrc}
                        alt={`${entry.wine.name} bottle`}
                        className="review-wine-thumb"
                       
                        onError={fallbackToDefaultWineIcon}
                      />
                      <div className="review-card-header">
                        <div>
                          <h4>{entry.wine.name}</h4>
                          <p>{entry.wine.winery} · {formatApiDate(entry.review.created_at, locale)}</p>
                          <div className="review-origin-row">
                            <span className="review-origin-chip">
                              {countryFlagPathValue
                                ? <img className="review-origin-flag" src={countryFlagPathValue} alt={localizedCountryName(entry.wine.country, locale)} />
                                : <span className="review-origin-emoji" aria-hidden="true">{countryFlagEmoji(entry.wine.country)}</span>}
                              <span>{entry.wine.country}</span>
                            </span>
                            <span className="review-origin-chip">
                              {doLogoPath ? <img className="review-origin-do-logo" src={doLogoPath} alt={`${doLabel} logo`} onError={fallbackToAdminAsset} /> : null}
                              <span>{doLabel}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="review-bullets">
                      {entry.review.bullets.length > 0 ? entry.review.bullets.map((bullet) => (
                        <span key={`${entry.review.id}-${bullet}`} className="review-bullet-chip">
                          {reviewEnumToTag[bullet] ?? bullet}
                        </span>
                      )) : <span className="review-bullet-chip muted">-</span>}
                    </div>
                  </div>
                  <div className="review-metrics-col">
                    <dl className="review-metrics-grid review-metrics-grid-inline">
                      <div>
                        <dt>{t('ui.aroma')}</dt>
                        <dd className={`review-metric-value ${medalToneFromTen(entry.review.aroma)}`}>{entry.review.aroma}/10</dd>
                      </div>
                      <div>
                        <dt>{t('ui.appearance')}</dt>
                        <dd className={`review-metric-value ${medalToneFromTen(entry.review.appearance)}`}>{entry.review.appearance}/10</dd>
                      </div>
                      <div>
                        <dt>{labels.reviews.create.palateEntry}</dt>
                        <dd className={`review-metric-value ${medalToneFromTen(entry.review.palate_entry)}`}>{entry.review.palate_entry}/10</dd>
                      </div>
                      <div>
                        <dt>{t('ui.body')}</dt>
                        <dd className={`review-metric-value ${medalToneFromTen(entry.review.body)}`}>{entry.review.body}/10</dd>
                      </div>
                      <div>
                        <dt>{t('ui.persistence')}</dt>
                        <dd className={`review-metric-value ${medalToneFromTen(entry.review.persistence)}`}>{entry.review.persistence}/10</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="review-score-col">
                    <div className="review-card-header-right">
                      <div className="review-score-summary">
                        <span className={`score-pill ${medalToneFromHundred(entry.review.score)}`}>{entry.review.score == null ? '-' : `${entry.review.score}/100`}</span>
                        <small>{t('ui.score_total_100')}</small>
                      </div>
                      <div className="review-actions review-actions-inline review-actions-end">
                        {comparisonReview ? (
                          <div className="review-compare-anchor">
                            <button
                              type="button"
                              className="table-icon-button"
                              aria-label={t('ui.view_other_review_comparison')}
                              title={t('ui.view_other_review_comparison')}
                              aria-expanded={isComparisonOpen}
                              onClick={() => {
                                setOpenComparisonReviewId((current) => (current === entry.review.id ? null : entry.review.id))
                              }}
                            >
                              <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M12 5C6 5 1.73 9.11.46 11.03a1.76 1.76 0 0 0 0 1.94C1.73 14.89 6 19 12 19s10.27-4.11 11.54-6.03a1.76 1.76 0 0 0 0-1.94C22.27 9.11 18 5 12 5Zm0 12c-4.92 0-8.58-3.21-9.86-5 1.28-1.79 4.94-5 9.86-5s8.58 3.21 9.86 5c-1.28 1.79-4.94 5-9.86 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill="currentColor" />
                              </svg>
                            </button>
                            {isComparisonOpen ? (
                              <div className="review-compare-tooltip" role="tooltip">
                                <p className="review-compare-title">{t('ui.other_review')} · {comparisonReview.user.name} {comparisonReview.user.lastname}</p>
                                <p className="review-compare-date">{formatApiDate(comparisonReview.created_at, locale)}</p>
                                <dl className="review-compare-grid">
                                  <div>
                                    <dt>{t('ui.score_total_100')}</dt>
                                    <dd>{comparisonReview.score == null ? '-' : `${comparisonReview.score}/100`}</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.score, comparisonReview.score)}</span>
                                  </div>
                                  <div>
                                    <dt>{t('ui.aroma')}</dt>
                                    <dd>{comparisonReview.aroma}/10</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.aroma, comparisonReview.aroma)}</span>
                                  </div>
                                  <div>
                                    <dt>{t('ui.appearance')}</dt>
                                    <dd>{comparisonReview.appearance}/10</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.appearance, comparisonReview.appearance)}</span>
                                  </div>
                                  <div>
                                    <dt>{labels.reviews.create.palateEntry}</dt>
                                    <dd>{comparisonReview.palate_entry}/10</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.palate_entry, comparisonReview.palate_entry)}</span>
                                  </div>
                                  <div>
                                    <dt>{t('ui.body')}</dt>
                                    <dd>{comparisonReview.body}/10</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.body, comparisonReview.body)}</span>
                                  </div>
                                  <div>
                                    <dt>{t('ui.persistence')}</dt>
                                    <dd>{comparisonReview.persistence}/10</dd>
                                    <span className="review-compare-diff">{formatScoreDifference(entry.review.persistence, comparisonReview.persistence)}</span>
                                  </div>
                                </dl>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="table-icon-button"
                          aria-label={labels.reviews.edit.editAction}
                          title={labels.reviews.edit.editAction}
                          onClick={() => onOpenReviewEdit(entry)}
                        >
                          <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.33-2.33a1 1 0 0 0-1.41 0l-1.18 1.18 3.75 3.75 1.17-1.19Z" fill="currentColor" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="table-icon-button danger"
                          aria-label={t('ui.delete_review')}
                          title={t('ui.delete_review')}
                          disabled={reviewDeleteBusyId === entry.review.id}
                          onClick={() => onDeleteReview(entry)}
                        >
                          <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            }) : (
              <p className="muted">{t('ui.yet_not_has_created_reviews')}</p>
            )}
          </div>
        </section>
      </section>
    </section>
  )
}
