import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { WineType } from '../types'

type DashboardMetrics = {
  totalWines: number
  totalReviews: number
  myReviews: number
  averageRed: number
  averageWhite: number
}

type DashboardAnalytics = {
  reviewTimeline: Array<{ label: string; reviews: number; median: number | null }>
  scoreBuckets: Array<{ label: string; count: number }>
  webVsMyTimeline: Array<{ label: string; web: number; mine: number }>
  highScoreCount: number
  lowScoreCount: number
  scoreSpread: number
  averagePrice: number
  qualityIndex: number
  byType: Array<{ type: WineType; avg: number; count: number }>
  awardsWith: number
  awardsWithout: number
  awardTypes: Array<{ label: string; count: number }>
  scoreMedian: number
  scoreStdDev: number
  approvedRate: number
  maxScore: number
  minScore: number
  minPrice: number
  maxPrice: number
  priceVsScore: Array<{ price: number; score: number }>
  regressionLine: Array<{ price: number; score: number }>
  regressionSlope: number
  sweetSpotPrice: number
  underTenGreatCount: number
  underTenGreatPct: number
  topValueWines: Array<{ id: number; name: string; valueIndex: number }>
  scoreBands: Array<{ label: string; count: number; avgPrice: number }>
  byVintage: Array<{ year: number | string; avgScore: number }>
  bestVintage: { year: number | string; avgScore: number } | null
  oldVsRecent: { oldAvg: number; recentAvg: number }
  doRanking: Array<{ region: string; avgScore: number; bestValue: number }>
  doMostConsistent: { region: string; consistency: number } | null
  coupleScatter: Array<{ x: number; y: number }>
  mariaAvg: number
  adriaAvg: number
  avgDifference: number
  disagreementPct: number
  syncIndex: number
  disagreementByDo: Array<{ region: string; avgDiff: number }>
  rollingAverage10: Array<{ index: number | string; avg: number }>
  placeComparison: {
    restaurantAvgScore: number
    restaurantAvgPrice: number
    supermarketAvgScore: number
    supermarketAvgPrice: number
  }
}

type DashboardPanelProps = {
  t: (key: string) => string
  labels: {
    dashboard: {
      metrics: {
        totalWines: string
        catalogHint: string
        totalReviews: string
        globalReviewsHint: string
        myReviews: string
        myReviewsHint: string
        avgRed: string
        avgRedHint: string
        avgWhite: string
        avgWhiteHint: string
      }
    }
  }
  metrics: DashboardMetrics
  dashboardAnalytics: DashboardAnalytics
  genericStatsStatus: 'idle' | 'loading' | 'ready' | 'error'
  genericStatsError: string | null
  reviewsPerMonthStatus: 'idle' | 'loading' | 'ready' | 'error'
  reviewsPerMonthError: string | null
  scoringGenericStatsStatus: 'idle' | 'loading' | 'ready' | 'error'
  scoringGenericStatsError: string | null
  wineItemsLength: number
  wineTypeLabel: (type: WineType) => string
  priceFormatter: Intl.NumberFormat
  onGoToReviews: () => void
}

export function DashboardPanel({
  t,
  labels,
  metrics,
  dashboardAnalytics,
  genericStatsStatus,
  genericStatsError,
  reviewsPerMonthStatus,
  reviewsPerMonthError,
  scoringGenericStatsStatus,
  scoringGenericStatsError,
  wineItemsLength,
  wineTypeLabel,
  priceFormatter,
  onGoToReviews,
}: DashboardPanelProps) {
  return (
    <section className="screen-grid">
      <div className="stat-grid">
        <article className="stat-card">
          <p>{labels.dashboard.metrics.totalWines}</p>
          <strong>{metrics.totalWines}</strong>
          <span>{labels.dashboard.metrics.catalogHint}</span>
        </article>
        <article className="stat-card">
          <p>{labels.dashboard.metrics.totalReviews}</p>
          <strong>{metrics.totalReviews}</strong>
          <span>{labels.dashboard.metrics.globalReviewsHint}</span>
        </article>
        <article className="stat-card">
          <p>{labels.dashboard.metrics.myReviews}</p>
          <strong>{metrics.myReviews}</strong>
          <span>{labels.dashboard.metrics.myReviewsHint}</span>
        </article>
        <article className="stat-card accent">
          <p>{labels.dashboard.metrics.avgRed}</p>
          <strong>{metrics.averageRed.toFixed(1)}</strong>
          <span>{labels.dashboard.metrics.avgRedHint}</span>
        </article>
        <article className="stat-card accent">
          <p>{labels.dashboard.metrics.avgWhite}</p>
          <strong>{metrics.averageWhite.toFixed(1)}</strong>
          <span>{labels.dashboard.metrics.avgWhiteHint}</span>
        </article>
      </div>
      {genericStatsStatus === 'error' ? (
        <p className="panel-inline-error">
          {t('ui.not_have_could_load_indicators_general')}
          {genericStatsError ? ` (${genericStatsError})` : ''}
        </p>
      ) : null}

      <section className="dashboard-rich-grid">
        <section className="panel dashboard-hero-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t('ui.activity')}</p>
              <h3>{t('ui.pace_reviews_and_quality')}</h3>
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
                <YAxis yAxisId="avg" orientation="right" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={34} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Bar yAxisId="reviews" dataKey="reviews" name={t('ui.reviews')} fill="#c39a7f" radius={[6, 6, 0, 0]} />
                <Line yAxisId="avg" type="monotone" dataKey="median" name={t('ui.median_score_series')} stroke="#8f3851" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {reviewsPerMonthStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_have_could_load_stats_chart')}
              {reviewsPerMonthError ? ` (${reviewsPerMonthError})` : ''}
            </p>
          ) : null}
          <div className="dashboard-hero-footnote">
            <span>{t('ui.bar_light_reviews')}</span>
            <span>{t('ui.line_wine_median_score')}</span>
          </div>
        </section>

        <section className="panel dashboard-distribution-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t('ui.distribution')}</p>
              <h3>{t('ui.quality_catalog')}</h3>
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
          {scoringGenericStatsStatus === 'error' ? (
            <p className="panel-inline-error">
              {t('ui.not_has_could_load_distribution_score')}
              {scoringGenericStatsError ? ` (${scoringGenericStatsError})` : ''}
            </p>
          ) : null}
        </section>

        <section className="panel dashboard-frequency-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t('ui.frequency')}</p>
              <h3>{t('ui.reviews_web_vs_mine')}</h3>
            </div>
          </div>
          <div className="chart-shell" aria-label={t('ui.comparison_reviews_web_vs_mine')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardAnalytics.webVsMyTimeline} margin={{ top: 8, right: 8, left: -20, bottom: 2 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Bar dataKey="web" name={t('ui.web_label')} fill="#c39a7f" radius={[5, 5, 0, 0]} />
                <Bar dataKey="mine" name={t('ui.mine')} fill="#8f3851" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.web_global_label')}</span>
            <span>{t('ui.mine_label')}</span>
          </div>
        </section>

        <section className="panel dashboard-kpi-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t('ui.indicators')}</p>
              <h3>Qualifications</h3>
            </div>
          </div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.wines_80')}</span><strong>{dashboardAnalytics.highScoreCount}</strong></article>
            <article><span>{t('ui.wines_65')}</span><strong>{dashboardAnalytics.lowScoreCount}</strong></article>
            <article><span>{t('ui.dispersion_score')}</span><strong>{dashboardAnalytics.scoreSpread.toFixed(1)}</strong></article>
            <article><span>{t('ui.average_price')}</span><strong>{priceFormatter.format(dashboardAnalytics.averagePrice)}</strong></article>
            <article><span>{t('ui.index_quality_price')}</span><strong>{dashboardAnalytics.qualityIndex.toFixed(2)}</strong></article>
          </div>
        </section>

        <section className="panel dashboard-type-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.by_type')}</p><h3>{t('ui.scores_average_by_type_wine')}</h3></div></div>
          <div className="type-performance-grid">
            {dashboardAnalytics.byType.map((row) => (
              <article key={row.type}>
                <header><span>{wineTypeLabel(row.type)}</span><strong>{row.avg ? row.avg.toFixed(1) : '-'}</strong></header>
                <div className="type-performance-track" aria-hidden="true"><div className="type-performance-fill" style={{ width: `${Math.max(6, (row.avg / 100) * 100)}%` }} /></div>
                <small>{row.count} {t('ui.wines')}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="panel dashboard-awards-panel">
          <div className="panel-header"><div><p className="eyebrow">AWARDS</p><h3>{t('ui.award_vs_without_award')}</h3></div></div>
          <div className="awards-split">
            <div className="awards-donut" aria-hidden="true">
              <div className="awards-donut-ring" style={{ background: `conic-gradient(#8f3851 0 ${(dashboardAnalytics.awardsWith / Math.max(1, wineItemsLength)) * 360}deg, rgba(82,46,28,0.12) 0 360deg)` }} />
              <div className="awards-donut-center"><strong>{dashboardAnalytics.awardsWith}</strong><span>{t('ui.award_label')}</span></div>
            </div>
            <div className="awards-breakdown">
              <div className="awards-breakdown-row"><span>{t('ui.award_label')}</span><strong>{dashboardAnalytics.awardsWith}</strong></div>
              <div className="awards-breakdown-row"><span>{t('ui.without_award')}</span><strong>{dashboardAnalytics.awardsWithout}</strong></div>
              {dashboardAnalytics.awardTypes.map((award) => (
                <div key={award.label} className="awards-breakdown-row compact"><span>{award.label}</span><strong>{award.count}</strong></div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel dashboard-general-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.general')}</p><h3>{t('ui.stats_base_tasting')}</h3></div></div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.median_score')}</span><strong>{dashboardAnalytics.scoreMedian.toFixed(1)}</strong></article>
            <article><span>{t('ui.deviation_standard')}</span><strong>{dashboardAnalytics.scoreStdDev.toFixed(2)}</strong></article>
            <article><span>{t('ui.passed_7')}</span><strong>{dashboardAnalytics.approvedRate.toFixed(1)}%</strong></article>
            <article><span>{t('ui.score_max_min')}</span><strong>{dashboardAnalytics.maxScore.toFixed(1)} · {dashboardAnalytics.minScore.toFixed(1)}</strong></article>
            <article><span>{t('ui.range_prices_tasted')}</span><strong>{priceFormatter.format(dashboardAnalytics.minPrice)} - {priceFormatter.format(dashboardAnalytics.maxPrice)}</strong></article>
          </div>
        </section>

        <section className="panel dashboard-price-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.price_vs_quality')}</p><h3>{t('ui.ratio_price_score')}</h3></div></div>
          <div className="chart-shell" aria-label={t('ui.scatter_price_and_score')}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                <XAxis type="number" dataKey="price" name={t('ui.price')} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="score" name={t('ui.score_label')} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Scatter data={dashboardAnalytics.priceVsScore} fill="#8f3851" />
                <Scatter data={dashboardAnalytics.regressionLine} fill="transparent" line={{ stroke: '#c39a7f', strokeWidth: 2 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.slope_regression')}: {dashboardAnalytics.regressionSlope.toFixed(3)}</span>
            <span>{t('ui.price_sweet_estimated')}: {priceFormatter.format(dashboardAnalytics.sweetSpotPrice)}</span>
            <span>{t('ui.value_10_with_score_8')}: {dashboardAnalytics.underTenGreatCount} ({dashboardAnalytics.underTenGreatPct.toFixed(1)}%)</span>
          </div>
          <div className="mini-table">
            {dashboardAnalytics.topValueWines.slice(0, 5).map((wine) => (<div key={wine.id} className="mini-table-row"><span>{wine.name}</span><strong>{wine.valueIndex.toFixed(2)}</strong></div>))}
          </div>
          <div className="mini-table">
            {dashboardAnalytics.scoreBands.map((band) => (<div key={band.label} className="mini-table-row"><span>{t('ui.range_label')} {band.label}</span><strong>{band.count > 0 ? priceFormatter.format(band.avgPrice) : '-'}</strong></div>))}
          </div>
        </section>

        <section className="panel dashboard-vintage-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.vintage_label')}</p><h3>{t('ui.evolution_by_vintage')}</h3></div></div>
          <div className="chart-shell" aria-label={t('ui.average_by_vintage')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardAnalytics.byVintage} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Bar dataKey="avgScore" fill="#8f3851" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.best_vintage')}: {dashboardAnalytics.bestVintage?.year ?? '-'} ({dashboardAnalytics.bestVintage?.avgScore.toFixed(1) ?? '-'})</span>
            <span>{t('ui.old_2018')}: {dashboardAnalytics.oldVsRecent.oldAvg.toFixed(1)}</span>
            <span>{t('ui.recent_2019')}: {dashboardAnalytics.oldVsRecent.recentAvg.toFixed(1)}</span>
          </div>
        </section>

        <section className="panel dashboard-do-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.do')}</p><h3>{t('ui.ranking_dos')}</h3></div></div>
          <div className="mini-table">
            {dashboardAnalytics.doRanking.slice(0, 6).map((row) => (<div key={row.region} className="mini-table-row"><span>{row.region}</span><strong>{row.avgScore.toFixed(1)} · {row.bestValue.toFixed(2)}</strong></div>))}
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.do_most_consistent')}: {dashboardAnalytics.doMostConsistent?.region ?? '-'}</span>
            <span>{t('ui.minimum')}: {dashboardAnalytics.doMostConsistent?.consistency.toFixed(2) ?? '-'}</span>
          </div>
        </section>

        <section className="panel dashboard-couple-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.comparison')}</p><h3>{t('ui.maria_vs_adria')}</h3></div></div>
          <div className="chart-shell" aria-label={t('ui.scatter_maria_versus_adria')}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                <XAxis type="number" dataKey="x" name={t('ui.maria_axis')} domain={[4, 10]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" name={t('ui.adria_axis')} domain={[4, 10]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <ReferenceLine segment={[{ x: 4, y: 4 }, { x: 10, y: 10 }]} stroke="#c39a7f" strokeDasharray="4 4" />
                <Scatter data={dashboardAnalytics.coupleScatter} fill="#8f3851" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-kpi-list">
            <article><span>{t('ui.average_maria')}</span><strong>{dashboardAnalytics.mariaAvg.toFixed(2)}</strong></article>
            <article><span>{t('ui.average_adria')}</span><strong>{dashboardAnalytics.adriaAvg.toFixed(2)}</strong></article>
            <article><span>{t('ui.difference_average')}</span><strong>{dashboardAnalytics.avgDifference.toFixed(2)}</strong></article>
            <article><span>{t('ui.disagreements_2')}</span><strong>{dashboardAnalytics.disagreementPct.toFixed(1)}%</strong></article>
            <article><span>{t('ui.index_sync')}</span><strong>{dashboardAnalytics.syncIndex.toFixed(1)}</strong></article>
          </div>
          <div className="mini-table">
            {dashboardAnalytics.disagreementByDo.slice(0, 5).map((row) => (<div key={row.region} className="mini-table-row"><span>{row.region}</span><strong>{row.avgDiff.toFixed(2)}</strong></div>))}
          </div>
        </section>

        <section className="panel dashboard-temporal-panel">
          <div className="panel-header"><div><p className="eyebrow">{t('ui.evolution')}</p><h3>{t('ui.rolling_average_10_wines')}</h3></div></div>
          <div className="chart-shell" aria-label={t('ui.average_rolling_10_wines')}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashboardAnalytics.rollingAverage10} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                <XAxis dataKey="index" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }} />
                <Line type="monotone" dataKey="avg" stroke="#8f3851" strokeWidth={2.2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-hero-footnote">
            <span>{t('ui.restaurant_score_price')} {dashboardAnalytics.placeComparison.restaurantAvgScore.toFixed(1)} / {priceFormatter.format(dashboardAnalytics.placeComparison.restaurantAvgPrice)}</span>
            <span>{t('ui.supermarket_score_price')} {dashboardAnalytics.placeComparison.supermarketAvgScore.toFixed(1)} / {priceFormatter.format(dashboardAnalytics.placeComparison.supermarketAvgPrice)}</span>
          </div>
        </section>
      </section>
    </section>
  )
}
