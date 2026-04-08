import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'

type DashboardMetrics = {
  totalWines: number
  reviewedWines: number
  totalReviews: number
  reviewCoveragePct: number
  avgScore: number
  medianScore: number
}

type DashboardAnalytics = {
  reviewTimeline: Array<{ label: string; reviews: number; avg: number | null; median: number | null }>
  activitySummary: {
    lastMonthReviews: number
    avgReviewsPerMonth: number
    bestMonth: { month: string; reviews: number } | null
    lastActiveMonth: string | null
  }
  scoreBuckets: Array<{ label: string; count: number }>
  distributionSummary: {
    approved70Pct: number
    great80Pct: number
    minScore: number
    maxScore: number
    stdDev: number
  }
  valueSummary: {
    priceScoreCorrelation: number
    regressionSlope: number
    medianPrice: number
    minPrice: number
    maxPrice: number
    under10HighScoreCount: number
    under10HighScorePct: number
    under10HighScoreThreshold: number
    priceBands: Array<{ label: string; wines: number; avgScore: number | null }>
    topValueWines: Array<{ wineId: number; name: string; doName: string | null; price: number; avgScore: number; valueIndex: number }>
    priceVsScore: Array<{ price: number; score: number; name: string }>
    regressionLine: Array<{ price: number; score: number }>
  }
  healthSummary: {
    winesWithoutReviews: number
    winesWithoutPhotos: number
    winesWithAwards: number
    winesWithoutAwards: number
    photoCoveragePct: number
    grapeCoveragePct: number
    reviewCoveragePct: number
    doLogoCoveragePct: number
    regionLogoCoveragePct: number
    doMapCoveragePct: number
    placesWithMapPct: number
  }
  pairAgreementSummary: {
    pairsCount: number
    avgDiff: number
    diffGe10Pct: number
    diffGe15Pct: number
    syncIndex: number
    scatterPoints: Array<{ x: number; y: number; wine: string }>
    byDo: Array<{ doName: string; comparedWines: number; avgDiff: number }>
  }
}

type DashboardPanelProps = {
  t: (key: string) => string
  labels: {
    dashboard: {
      metrics: {
        totalWines: string
        reviewedWines: string
        totalReviews: string
        reviewCoverage: string
        avgScore: string
        medianScore: string
        catalogHint: string
        reviewedHint: string
        globalReviewsHint: string
        coverageHint: string
        avgScoreHint: string
        medianScoreHint: string
      }
    }
  }
  metrics: DashboardMetrics
  dashboardAnalytics: DashboardAnalytics
  coverageStatus: 'idle' | 'loading' | 'ready' | 'error'
  coverageError: string | null
  activityStatus: 'idle' | 'loading' | 'ready' | 'error'
  activityError: string | null
  distributionStatus: 'idle' | 'loading' | 'ready' | 'error'
  distributionError: string | null
  valueStatus: 'idle' | 'loading' | 'ready' | 'error'
  valueError: string | null
  catalogHealthStatus: 'idle' | 'loading' | 'ready' | 'error'
  catalogHealthError: string | null
  pairAgreementStatus: 'idle' | 'loading' | 'ready' | 'error'
  pairAgreementError: string | null
  priceFormatter: Intl.NumberFormat
  onGoToReviews: () => void
}

export function DashboardPanel({
  t,
  labels,
  metrics,
  dashboardAnalytics,
  coverageStatus,
  coverageError,
  activityStatus,
  activityError,
  distributionStatus,
  distributionError,
  valueStatus,
  valueError,
  catalogHealthStatus,
  catalogHealthError,
  pairAgreementStatus,
  pairAgreementError,
  priceFormatter,
  onGoToReviews,
}: DashboardPanelProps) {
  const dashboardIcons = {
    totalWines: '/images/icons/wine/wine_3bottles.png',
    reviewedWines: '/images/icons/wine/glass_and_grapes.png',
    totalReviews: '/images/icons/wine/wine_comment.png',
    reviewCoverage: '/images/icons/wine/wine_lens.png',
    avgScore: '/images/icons/wine/wineyard_bottle.png',
    medianScore: '/images/icons/wine/wine_card.png',
    activity: '/images/icons/wine/calendar_grapes.png',
    distribution: '/images/icons/wine/leaves.png',
    value: '/images/icons/wine/wine_and_glass.png',
    health: '/images/icons/wine/wine_shield.png',
    pairAgreement: '/images/icons/wine/wine_couple.png',
  } as const

  return (
    <section className="screen-grid">
      <div className="stat-grid">
        <article className="stat-card">
          <img className="stat-card-icon" src={dashboardIcons.totalWines} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.totalWines}</p>
          <strong>{metrics.totalWines}</strong>
          <span>{labels.dashboard.metrics.catalogHint}</span>
        </article>
        <article className="stat-card">
          <img className="stat-card-icon" src={dashboardIcons.reviewedWines} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.reviewedWines}</p>
          <strong>{metrics.reviewedWines}</strong>
          <span>{labels.dashboard.metrics.reviewedHint}</span>
        </article>
        <article className="stat-card">
          <img className="stat-card-icon" src={dashboardIcons.totalReviews} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.totalReviews}</p>
          <strong>{metrics.totalReviews}</strong>
          <span>{labels.dashboard.metrics.globalReviewsHint}</span>
        </article>
        <article className="stat-card accent">
          <img className="stat-card-icon" src={dashboardIcons.reviewCoverage} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.reviewCoverage}</p>
          <strong>{metrics.reviewCoveragePct.toFixed(1)}%</strong>
          <span>{labels.dashboard.metrics.coverageHint}</span>
        </article>
        <article className="stat-card accent">
          <img className="stat-card-icon" src={dashboardIcons.avgScore} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.avgScore}</p>
          <strong>{metrics.avgScore.toFixed(1)}</strong>
          <span>{labels.dashboard.metrics.avgScoreHint}</span>
        </article>
        <article className="stat-card accent">
          <img className="stat-card-icon" src={dashboardIcons.medianScore} alt="" aria-hidden="true" />
          <p>{labels.dashboard.metrics.medianScore}</p>
          <strong>{metrics.medianScore.toFixed(1)}</strong>
          <span>{labels.dashboard.metrics.medianScoreHint}</span>
        </article>
      </div>
      {coverageStatus === 'error' ? (
        <p className="panel-inline-error">
          {t('ui.not_have_could_load_indicators_general')}
          {coverageError ? ` (${coverageError})` : ''}
        </p>
      ) : null}

      <section className="dashboard-rich-grid">
        <section className="panel dashboard-hero-panel">
          <div className="panel-header">
            <div className="panel-header-heading-with-icon">
              <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.activity} alt="" aria-hidden="true" />
              <div className="panel-header-heading-copy">
              <p className="eyebrow">{t('ui.activity')}</p>
              <h3>{t('ui.pace_reviews_and_quality')}</h3>
              </div>
            </div>
            <button type="button" className="secondary-button small" onClick={onGoToReviews}>
              {t('ui.go_to_reviews')}
            </button>
          </div>
          <div className="chart-shell chart-shell-tall" aria-label={t('ui.chart_pace_reviews_and_score')}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashboardAnalytics.reviewTimeline} margin={{ top: 8, right: 10, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.18)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} minTickGap={18} />
                <YAxis yAxisId="reviews" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={28} domain={[0, 'dataMax + 1']} allowDecimals={false} />
                <YAxis yAxisId="score" orientation="right" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={34} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Bar yAxisId="reviews" dataKey="reviews" name={t('ui.reviews')} fill="#c39a7f" radius={[6, 6, 0, 0]} />
                <Line yAxisId="score" type="monotone" dataKey="median" name={t('ui.median_score_series')} stroke="#8f3851" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {activityStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_have_could_load_stats_chart')}
              {activityError ? ` (${activityError})` : ''}
            </p>
          ) : null}
          <div className="dashboard-hero-footnote">
            <span>{t('ui.last_month_reviews')}: {dashboardAnalytics.activitySummary.lastMonthReviews}</span>
            <span>{t('ui.avg_reviews_per_month')}: {dashboardAnalytics.activitySummary.avgReviewsPerMonth.toFixed(1)}</span>
            <span>{t('ui.best_month')}: {dashboardAnalytics.activitySummary.bestMonth?.month ?? '-'}</span>
          </div>
        </section>

        <section className="panel dashboard-distribution-panel">
          <div className="panel-header">
            <div className="panel-header-heading-with-icon">
              <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.distribution} alt="" aria-hidden="true" />
              <div className="panel-header-heading-copy">
              <p className="eyebrow">{t('ui.distribution')}</p>
              <h3>{t('ui.quality_catalog')}</h3>
              </div>
            </div>
          </div>
          <div className="bucket-stack">
            {dashboardAnalytics.scoreBuckets.map((bucket) => {
              const maxBucket = Math.max(...dashboardAnalytics.scoreBuckets.map((entry) => entry.count), 1)
              const width = `${(bucket.count / maxBucket) * 100}%`
              const tone = bucket.label === '90+' ? 'gold' : bucket.label === '80-89' ? 'silver' : bucket.label === '70-79' ? 'bronze' : 'default'
              return (
                <div key={bucket.label} className="bucket-row">
                  <span>{bucket.label}</span>
                  <div className="bucket-track" aria-hidden="true">
                    <div className={`bucket-fill ${tone}`} style={{ width }} />
                  </div>
                  <strong>{bucket.count}</strong>
                </div>
              )
            })}
          </div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.passed_7')}</span><strong>{dashboardAnalytics.distributionSummary.approved70Pct.toFixed(1)}%</strong></article>
            <article><span>{t('ui.wines_80')}</span><strong>{dashboardAnalytics.distributionSummary.great80Pct.toFixed(1)}%</strong></article>
            <article><span>{t('ui.score_max_min')}</span><strong>{dashboardAnalytics.distributionSummary.maxScore} · {dashboardAnalytics.distributionSummary.minScore}</strong></article>
            <article><span>{t('ui.deviation_standard')}</span><strong>{dashboardAnalytics.distributionSummary.stdDev.toFixed(2)}</strong></article>
          </div>
          {distributionStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_has_could_load_distribution_score')}
              {distributionError ? ` (${distributionError})` : ''}
            </p>
          ) : null}
        </section>

        <section className="panel dashboard-price-panel">
          <div className="panel-header">
            <div className="panel-header-heading-with-icon">
              <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.value} alt="" aria-hidden="true" />
              <div className="panel-header-heading-copy">
                <p className="eyebrow">{t('ui.price_vs_quality')}</p>
                <h3>{t('ui.ratio_price_score')}</h3>
              </div>
            </div>
          </div>
          <div className="chart-shell" aria-label={t('ui.scatter_price_and_score')}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                <XAxis type="number" dataKey="price" name={t('ui.price')} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="score" name={t('ui.score_label')} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Scatter data={dashboardAnalytics.valueSummary.priceVsScore} fill="#8f3851" />
                <Scatter data={dashboardAnalytics.valueSummary.regressionLine} fill="transparent" line={{ stroke: '#c39a7f', strokeWidth: 2 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.price_correlation')}: {dashboardAnalytics.valueSummary.priceScoreCorrelation.toFixed(3)}</span>
            <span>{t('ui.slope_regression')}: {dashboardAnalytics.valueSummary.regressionSlope.toFixed(3)}</span>
            <span>{t('ui.median_price_label')}: {priceFormatter.format(dashboardAnalytics.valueSummary.medianPrice)}</span>
          </div>
          {valueStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_could_load_value_stats')}
              {valueError ? ` (${valueError})` : ''}
            </p>
          ) : null}
        </section>

        <section className="panel dashboard-kpi-panel">
          <div className="panel-header">
            <div className="panel-header-heading-with-icon">
              <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.value} alt="" aria-hidden="true" />
              <div className="panel-header-heading-copy">
              <p className="eyebrow">{t('ui.indicators')}</p>
              <h3>{t('ui.value_picks')}</h3>
              </div>
            </div>
          </div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.value_10_with_score_8')}</span><strong>{dashboardAnalytics.valueSummary.under10HighScoreCount} ({dashboardAnalytics.valueSummary.under10HighScorePct.toFixed(1)}%)</strong></article>
            <article><span>{t('ui.range_prices_tasted')}</span><strong>{priceFormatter.format(dashboardAnalytics.valueSummary.minPrice)} - {priceFormatter.format(dashboardAnalytics.valueSummary.maxPrice)}</strong></article>
          </div>
          <div className="mini-table">
            {dashboardAnalytics.valueSummary.topValueWines.slice(0, 5).map((wine) => (
              <div key={wine.wineId} className="mini-table-row">
                <span>{wine.name}</span>
                <strong>{wine.valueIndex.toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className="mini-table">
            {dashboardAnalytics.valueSummary.priceBands.map((band) => (
              <div key={band.label} className="mini-table-row">
                <span>{t('ui.range_label')} {band.label}</span>
                <strong>{band.avgScore == null ? '-' : band.avgScore.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel dashboard-general-panel">
          <div className="panel-header">
            <div className="panel-header-heading-with-icon">
              <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.health} alt="" aria-hidden="true" />
              <div className="panel-header-heading-copy">
                <p className="eyebrow">{t('ui.general')}</p>
                <h3>{t('ui.catalog_health')}</h3>
              </div>
            </div>
          </div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.wines_without_reviews')}</span><strong>{dashboardAnalytics.healthSummary.winesWithoutReviews}</strong></article>
            <article><span>{t('ui.wines_without_photos')}</span><strong>{dashboardAnalytics.healthSummary.winesWithoutPhotos}</strong></article>
            <article><span>{t('ui.wines_with_awards')}</span><strong>{dashboardAnalytics.healthSummary.winesWithAwards}</strong></article>
            <article><span>{t('ui.wines_without_awards')}</span><strong>{dashboardAnalytics.healthSummary.winesWithoutAwards}</strong></article>
          </div>
          <div className="mini-table">
            <div className="mini-table-row"><span>{t('ui.photo_coverage')}</span><strong>{dashboardAnalytics.healthSummary.photoCoveragePct.toFixed(1)}%</strong></div>
            <div className="mini-table-row"><span>{t('ui.grape_coverage')}</span><strong>{dashboardAnalytics.healthSummary.grapeCoveragePct.toFixed(1)}%</strong></div>
            <div className="mini-table-row"><span>{t('ui.do_logo_coverage')}</span><strong>{dashboardAnalytics.healthSummary.doLogoCoveragePct.toFixed(1)}%</strong></div>
            <div className="mini-table-row"><span>{t('ui.region_logo_coverage')}</span><strong>{dashboardAnalytics.healthSummary.regionLogoCoveragePct.toFixed(1)}%</strong></div>
            <div className="mini-table-row"><span>{t('ui.do_map_coverage')}</span><strong>{dashboardAnalytics.healthSummary.doMapCoveragePct.toFixed(1)}%</strong></div>
            <div className="mini-table-row"><span>{t('ui.place_map_coverage')}</span><strong>{dashboardAnalytics.healthSummary.placesWithMapPct.toFixed(1)}%</strong></div>
          </div>
          {catalogHealthStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_could_load_catalog_health')}
              {catalogHealthError ? ` (${catalogHealthError})` : ''}
            </p>
          ) : null}
        </section>

        {dashboardAnalytics.pairAgreementSummary.pairsCount > 0 ? (
          <section className="panel dashboard-couple-panel">
            <div className="panel-header">
              <div className="panel-header-heading-with-icon">
                <img className="panel-header-section-icon dashboard-panel-section-icon" src={dashboardIcons.pairAgreement} alt="" aria-hidden="true" />
                <div className="panel-header-heading-copy">
                  <p className="eyebrow">{t('ui.comparison')}</p>
                  <h3>{t('ui.maria_vs_adria')}</h3>
                </div>
              </div>
            </div>
            <div className="chart-shell" aria-label={t('ui.scatter_maria_versus_adria')}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                  <XAxis type="number" dataKey="x" name={t('ui.maria_axis')} domain={[0, 100]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                  <YAxis type="number" dataKey="y" name={t('ui.adria_axis')} domain={[0, 100]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#c39a7f" strokeDasharray="4 4" />
                  <Scatter data={dashboardAnalytics.pairAgreementSummary.scatterPoints} fill="#8f3851" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="dashboard-kpi-list">
              <article><span>{t('ui.compared_wines')}</span><strong>{dashboardAnalytics.pairAgreementSummary.pairsCount}</strong></article>
              <article><span>{t('ui.difference_average')}</span><strong>{dashboardAnalytics.pairAgreementSummary.avgDiff.toFixed(2)}</strong></article>
              <article><span>{t('ui.disagreements_10')}</span><strong>{dashboardAnalytics.pairAgreementSummary.diffGe10Pct.toFixed(1)}%</strong></article>
              <article><span>{t('ui.disagreements_15')}</span><strong>{dashboardAnalytics.pairAgreementSummary.diffGe15Pct.toFixed(1)}%</strong></article>
              <article><span>{t('ui.index_sync')}</span><strong>{dashboardAnalytics.pairAgreementSummary.syncIndex.toFixed(1)}</strong></article>
            </div>
            <div className="mini-table">
              {dashboardAnalytics.pairAgreementSummary.byDo.slice(0, 5).map((row) => (
                <div key={row.doName} className="mini-table-row">
                  <span>{row.doName}</span>
                  <strong>{row.avgDiff.toFixed(2)}</strong>
                </div>
              ))}
            </div>
            {pairAgreementStatus === 'error' ? (
              <p className="panel-inline-error">
                {t('ui.not_could_load_pair_agreement')}
                {pairAgreementError ? ` (${pairAgreementError})` : ''}
              </p>
            ) : null}
          </section>
        ) : null}
      </section>
    </section>
  )
}
