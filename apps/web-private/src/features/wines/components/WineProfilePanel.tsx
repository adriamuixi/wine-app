import type { ReactNode, SyntheticEvent } from 'react'
import type { Locale } from '../../../i18n/messages'
import type { CountryFilterValue, WineDetailsApiReview, WineDetailsApiWine, WineType } from '../types'

type WineProfilePanelProps = {
  t: (key: string) => string
  locale: Locale
  fallbackName: string
  selectedWineSheetStatus: 'idle' | 'loading' | 'ready' | 'error'
  selectedWineSheetError: string | null
  selectedWineSheetDetails: WineDetailsApiWine | null
  selectedWineAverageScore: string | number | null
  selectedWineGrapePie: string
  selectedWineDoLogo: string | null
  selectedWineCommunityFlagPath: string | null
  winePhotoManager: ReactNode
  reviewEnumToTag: Record<WineDetailsApiReview['bullets'][number], string>
  onBack: () => void
  onEdit: () => void
  onFallbackAsset: (event: SyntheticEvent<HTMLImageElement>) => void
  formatApiDate: (value: string, locale: Locale) => string
  countryCodeToLabel: (country: Exclude<CountryFilterValue, 'all'> | null, locale: Locale) => string
  wineTypeLabel: (type: WineType) => string
  labelForAgingType: (value: WineDetailsApiWine['aging_type'], locale: Locale) => string
  labelForAwardName: (value: string) => string
  medalToneFromHundred: (score: number | null) => string
  wineryLabel: string
}

export function WineProfilePanel({
  t,
  locale,
  fallbackName,
  selectedWineSheetStatus,
  selectedWineSheetError,
  selectedWineSheetDetails,
  selectedWineAverageScore,
  selectedWineGrapePie,
  selectedWineDoLogo,
  selectedWineCommunityFlagPath,
  winePhotoManager,
  reviewEnumToTag,
  onBack,
  onEdit,
  onFallbackAsset,
  formatApiDate,
  countryCodeToLabel,
  wineTypeLabel,
  labelForAgingType,
  labelForAwardName,
  medalToneFromHundred,
  wineryLabel,
}: WineProfilePanelProps) {
  return (
    <section className="wine-profile-screen">
      <header className="wine-profile-toolbar">
        <h3>{selectedWineSheetDetails?.name ?? fallbackName}</h3>
        <div className="wine-profile-header-actions">
          <button type="button" className="ghost-button wine-profile-back-button" onClick={onBack}>
            <svg className="wine-profile-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                fill="currentColor"
              />
            </svg>
            <span className="wine-profile-back-text">{t('ui.back_list_wines')}</span>
          </button>
          <button type="button" className="primary-button" onClick={onEdit}>
            {t('ui.edit_wine')}
          </button>
        </div>
      </header>

      {selectedWineSheetStatus === 'loading' ? (
        <section className="panel">
          <p className="eyebrow">{t('ui.loading')}</p>
          <h3>{t('ui.preparing_sheet_wine')}</h3>
        </section>
      ) : null}

      {selectedWineSheetStatus === 'error' ? (
        <section className="panel">
          <p className="eyebrow">{t('common.error')}</p>
          <h3>{t('ui.not_could_load_sheet')}</h3>
          <p className="muted">{selectedWineSheetError ?? t('ui.try_again_retry_few_seconds')}</p>
        </section>
      ) : null}

      {selectedWineSheetStatus === 'ready' && selectedWineSheetDetails ? (
        <>
          <section className="wine-profile-row-one">
            {winePhotoManager}

            <section className="wine-sheet-card wine-profile-card-composition">
              <h4>
                <span className="wine-sheet-section-icon" aria-hidden="true">🍇</span>
                <span>{t('ui.composition')}</span>
              </h4>
              <div className="wine-profile-grape-layout">
                {selectedWineGrapePie !== '' ? (
                  <div className="wine-profile-grape-pie" style={{ background: selectedWineGrapePie }}>
                    <span>{t('ui.composition')}</span>
                  </div>
                ) : null}
                <div className="wine-profile-grape-list">
                  {selectedWineSheetDetails.grapes.length > 0 ? selectedWineSheetDetails.grapes.map((grape) => (
                    <div key={grape.id} className="wine-profile-grape-row">
                      <span>{grape.name}</span>
                      <strong>{grape.percentage == null ? '-' : `${grape.percentage}%`}</strong>
                    </div>
                  )) : <p className="muted">{t('ui.without_varieties_listed')}</p>}
                </div>
              </div>
            </section>
          </section>

          <section className="wine-profile-row-two">
            <section className="panel wine-profile-summary-panel wine-profile-card-maininfo">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{t('ui.sheet_technical')}</p>
                  <h3>{selectedWineSheetDetails.name}</h3>
                  <p className="wine-profile-maininfo-subtitle">{t('ui.identity_wine_information')}</p>
                </div>
                <div className="wine-profile-card-actions">
                  <button type="button" className="ghost-button small wine-profile-back-button" onClick={onBack}>
                    <svg className="wine-profile-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="wine-profile-back-text">{t('ui.back_list_wines')}</span>
                  </button>
                  <button type="button" className="primary-button small" onClick={onEdit}>
                    {t('ui.edit_wine')}
                  </button>
                </div>
              </div>

              <div className="wine-profile-kpi-strip">
                <article>
                  <span>{t('wineProfile.statAvgScore')}</span>
                  <strong>{selectedWineAverageScore ?? '-'}</strong>
                </article>
                <article>
                  <span>{t('ui.vintage_label')}</span>
                  <strong>{selectedWineSheetDetails.vintage_year ?? '-'}</strong>
                </article>
              </div>

              <div className="wine-profile-top-strip">
                {selectedWineSheetDetails.do ? (
                  <section className="wine-profile-do-showcase">
                    <div className="wine-profile-do-showcase-main">
                      {selectedWineDoLogo ? (
                        <img
                          src={selectedWineDoLogo}
                          alt={`${selectedWineSheetDetails.do.name} logo`}
                          className="wine-profile-do-showcase-logo"
                          loading="lazy"
                          onError={onFallbackAsset}
                        />
                      ) : null}
                      <div className="wine-profile-do-showcase-text">
                        <strong>{selectedWineSheetDetails.do.name}</strong>
                        <span>{selectedWineSheetDetails.do.region}</span>
                      </div>
                    </div>
                    <div className="wine-profile-do-badges">
                      <span className="wine-profile-do-badge">
                        {countryCodeToLabel(selectedWineSheetDetails.do.country, locale)}
                      </span>
                      {selectedWineSheetDetails.do.country === 'spain' && selectedWineCommunityFlagPath ? (
                        <span className="wine-profile-community-showcase">
                          <img
                            src={selectedWineCommunityFlagPath}
                            alt={selectedWineSheetDetails.do.region}
                            loading="lazy"
                            onError={onFallbackAsset}
                          />
                          <span>{selectedWineSheetDetails.do.region}</span>
                        </span>
                      ) : null}
                    </div>
                  </section>
                ) : null}
              </div>

              <dl className="wine-profile-facts-grid">
                <div><dt>{wineryLabel}</dt><dd>{selectedWineSheetDetails.winery ?? '-'}</dd></div>
                <div><dt>{t('common.doAbbreviation')}</dt><dd>{selectedWineSheetDetails.do?.name ?? t('ui.without_do')}</dd></div>
                <div><dt>{t('ui.region')}</dt><dd>{selectedWineSheetDetails.do?.region ?? '-'}</dd></div>
                <div><dt>{t('ui.by_type')}</dt><dd>{selectedWineSheetDetails.wine_type ? wineTypeLabel(selectedWineSheetDetails.wine_type) : '-'}</dd></div>
                <div><dt>{t('ui.crianza')}</dt><dd>{labelForAgingType(selectedWineSheetDetails.aging_type, locale)}</dd></div>
                <div><dt>{t('ui.alcohol_content')}</dt><dd>{selectedWineSheetDetails.alcohol_percentage ?? '-'}</dd></div>
                <div><dt>{t('ui.updated')}</dt><dd>{formatApiDate(selectedWineSheetDetails.updated_at, locale)}</dd></div>
              </dl>
            </section>

            <section className="wine-sheet-card wine-profile-card-awards">
              <h4>
                <span className="wine-sheet-section-icon" aria-hidden="true">🏅</span>
                <span>{t('ui.awards')}</span>
              </h4>
              <div className="wine-profile-list-block">
                {selectedWineSheetDetails.awards.length > 0 ? selectedWineSheetDetails.awards.map((award) => (
                  <article key={award.id} className="wine-profile-list-row">
                    <span>{labelForAwardName(award.name)}</span>
                    <strong>{award.score != null ? `${award.score}/100` : '-'} · {award.year ?? '-'}</strong>
                  </article>
                )) : <p className="muted">{t('ui.without_awards_registered')}</p>}
              </div>
            </section>

            <section className="wine-sheet-card wine-profile-card-reviews">
              <h4>
                <span className="wine-sheet-section-icon" aria-hidden="true">✍️</span>
                <span>{t('ui.reviews')}</span>
              </h4>
              <div className="wine-profile-list-block">
                {selectedWineSheetDetails.reviews.length > 0 ? selectedWineSheetDetails.reviews.slice(0, 5).map((review) => (
                  <article key={review.id} className="wine-profile-review-card">
                    <div className="wine-profile-review-head">
                      <div>
                        <strong>{review.user.name} {review.user.lastname}</strong>
                        <p className="wine-profile-review-date">{formatApiDate(review.created_at, locale)}</p>
                      </div>
                      <span className={`score-pill ${medalToneFromHundred(review.score)}`}>
                        {review.score == null ? '-' : `${review.score}/100`}
                      </span>
                    </div>
                    <div className="wine-profile-review-bullets">
                      {review.bullets.length > 0
                        ? review.bullets.map((bullet) => (
                          <span key={`${review.id}-${bullet}`} className="review-bullet-chip">
                            {reviewEnumToTag[bullet] ?? bullet}
                          </span>
                        ))
                        : <span className="review-bullet-chip muted">-</span>}
                    </div>
                  </article>
                )) : <p className="muted">{t('ui.without_reviews_registered')}</p>}
              </div>
            </section>
          </section>
        </>
      ) : null}
    </section>
  )
}
