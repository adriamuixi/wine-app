import type { Dispatch, SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import type { WineCard } from '../types'

type DoLogoPreview = { src: string; label: string } | null

function mapEmbedUrl(lat: number, lng: number) {
  const latOffset = 0.008
  const lngOffset = 0.012
  const bbox = [lng - lngOffset, lat - latOffset, lng + lngOffset, lat + latOffset]
    .map((value) => value.toFixed(6))
    .join('%2C')

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`
}

function mapOpenUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=16/${lat.toFixed(6)}/${lng.toFixed(6)}`
}

type Props = {
  activeModalImageIndex: number
  autonomousCommunityNameForRegion: (region: string) => string | null
  closeSelectedWineModal: () => void
  countryFlagEmoji: (country: string) => string
  countryFlagPath: (country: string) => string | null
  defaultPublicWineImageForTheme: (isDark: boolean) => string
  doLogoPreview: DoLogoPreview
  euro: Intl.NumberFormat
  galleryPhotoLabels: string[]
  isDark: boolean
  locale: Locale
  localizedCountryName: (country: string, locale: Locale) => string
  resolvePublicWineImageForTheme: (src: string, isDark: boolean) => string
  selectedWine: WineCard | null
  setActiveModalImageIndex: Dispatch<SetStateAction<number>>
  setDoLogoPreview: Dispatch<SetStateAction<DoLogoPreview>>
  splitGrapeVarieties: (grapes: string) => string[]
  t: PublicMessages
}

export default function CatalogOverlays({
  activeModalImageIndex,
  autonomousCommunityNameForRegion,
  closeSelectedWineModal,
  countryFlagEmoji,
  countryFlagPath,
  defaultPublicWineImageForTheme,
  doLogoPreview,
  euro,
  galleryPhotoLabels,
  isDark,
  locale,
  localizedCountryName,
  resolvePublicWineImageForTheme,
  selectedWine,
  setActiveModalImageIndex,
  setDoLogoPreview,
  splitGrapeVarieties,
  t,
}: Props) {
  return (
    <>
      {selectedWine ? (
        <div className="public-modal-backdrop" role="presentation" onClick={closeSelectedWineModal}>
          <section
            className="public-wine-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-wine-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="public-wine-modal-header">
              <div>
                <p className="eyebrow">{t.modal.details}</p>
                <div className="public-wine-modal-title-row">
                  <h2 id="public-wine-modal-title">{selectedWine.name}</h2>
                  {selectedWine.rewardBadgeImage ? (
                    <span
                      className="public-wine-modal-award-icon"
                      aria-label={`${selectedWine.reward?.name ?? t.card.reward} ${selectedWine.reward?.score ?? ''}`.trim()}
                      title={`${selectedWine.reward?.name ?? t.card.reward} ${selectedWine.reward?.score ?? ''}`.trim()}
                    >
                      <img src={selectedWine.rewardBadgeImage} alt="" loading="lazy" />
                    </span>
                  ) : null}
                </div>
                <p className="muted-line">{selectedWine.winery}</p>
              </div>
              <button type="button" className="ghost-close public-wine-modal-close" onClick={closeSelectedWineModal}>
                <span className="public-wine-modal-close-icon" aria-hidden="true">✕</span>
                <span className="public-wine-modal-close-label">{t.modal.close}</span>
              </button>
            </header>

            <div className="public-wine-modal-grid">
              <div className="public-wine-gallery">
                <div className="public-wine-main-image">
                  <img
                    src={resolvePublicWineImageForTheme(selectedWine.gallery[activeModalImageIndex] ?? selectedWine.image, isDark)}
                    alt={selectedWine.name}
                    onError={(event) => {
                      event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                    }}
                  />
                </div>
                <div className="public-wine-thumbs" aria-label={t.modal.gallery}>
                  {selectedWine.gallery.map((src, index) => {
                    const photoLabel = galleryPhotoLabels[index] ?? `${t.modal.gallery} ${index + 1}`
                    return (
                      <button
                        key={`${selectedWine.id}-${src}-${index}`}
                        type="button"
                        className={`public-wine-thumb ${activeModalImageIndex === index ? 'active' : ''}`}
                        onClick={() => setActiveModalImageIndex(index)}
                        aria-label={photoLabel}
                        title={photoLabel}
                      >
                        <img
                          src={resolvePublicWineImageForTheme(src, isDark)}
                          alt={`${selectedWine.name} · ${photoLabel}`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                          }}
                        />
                        <span className="public-wine-thumb-label">{photoLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="public-wine-details">
                {(() => {
                  const selectedCountryFlagImage = countryFlagPath(selectedWine.country)
                  const selectedCommunityFlagImage = selectedWine.country === 'Spain' ? selectedWine.regionLogoImage ?? null : null
                  const selectedCommunityName = selectedWine.country === 'Spain' ? autonomousCommunityNameForRegion(selectedWine.region) : null
                  return (
                    <section className="detail-card">
                      <h3>{t.icons.details} {t.modal.details}</h3>
                      <dl>
                        <div><dt>{t.icons.winery} {t.modal.winery}</dt><dd>{selectedWine.winery}</dd></div>
                        <div>
                          <dt>{t.icons.origin} {t.common.doLabel}</dt>
                          <dd className="origin-with-do">
                            <span className="country-flag-badge" aria-label={selectedWine.country} title={selectedWine.country}>
                              {selectedCountryFlagImage ? <img className="flag-badge-image" src={selectedCountryFlagImage} alt={localizedCountryName(selectedWine.country, locale)} loading="lazy" /> : countryFlagEmoji(selectedWine.country)}
                            </span>
                            {selectedCommunityFlagImage && selectedCommunityName ? (
                              <span className="country-flag-badge" aria-label={`${t.common.autonomousCommunity} ${selectedCommunityName}`} title={selectedCommunityName}>
                                <img className="flag-badge-image" src={selectedCommunityFlagImage} alt={selectedCommunityName} loading="lazy" />
                              </span>
                            ) : null}
                            {selectedWine.doLogoImage ? (
                              <span className="do-logo-tooltip do-logo-tooltip-clickable">
                                <button
                                  type="button"
                                  className="do-logo-inline-button"
                                  onClick={() => setDoLogoPreview({ src: selectedWine.doLogoImage!, label: selectedWine.region })}
                                  aria-label={`${selectedWine.region} ${t.common.doShort}`}
                                  title={selectedWine.region}
                                >
                                  <img className="do-logo-badge" src={selectedWine.doLogoImage} alt={`${selectedWine.region} ${t.common.doShort}`} loading="lazy" />
                                </button>
                                <span className="do-logo-tooltip-panel" role="tooltip" aria-hidden="true">
                                  <img src={selectedWine.doLogoImage} alt="" loading="lazy" />
                                  <span>{selectedWine.region}</span>
                                </span>
                              </span>
                            ) : null}
                            <span>{selectedWine.region}</span>
                          </dd>
                        </div>
                        <div><dt>{t.icons.type} {t.modal.style}</dt><dd>{t.wineType[selectedWine.type]} · {selectedWine.vintage}</dd></div>
                        <div className="detail-grapes-row">
                          <dt>{t.icons.grape} {t.modal.grapes}</dt>
                          <dd>
                            <div className="grape-variety-list">
                              {splitGrapeVarieties(selectedWine.grapes).map((grape) => (
                                <span key={`${selectedWine.id}-grape-${grape}`} className="grape-variety-pill">
                                  <span>{grape}</span>
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                        <div><dt>{t.icons.type} {t.modal.aging}</dt><dd>{selectedWine.aging}</dd></div>
                        <div><dt>{t.icons.price} {t.modal.alcohol}</dt><dd>{selectedWine.alcohol}</dd></div>
                        <div><dt>📅 {t.modal.tastedAt}</dt><dd>{selectedWine.tastedAt}</dd></div>
                        <div><dt>🗓 {t.modal.month}</dt><dd>{selectedWine.month}</dd></div>
                        <div><dt>📍 {t.modal.place}</dt><dd>{selectedWine.place} · {selectedWine.city}</dd></div>
                        <div><dt>{t.icons.avgScore} {t.card.avgScore}</dt><dd>{selectedWine.avgScore.toFixed(1)} {t.card.points}</dd></div>
                        <div><dt>{t.icons.price} {t.card.priceFrom}</dt><dd>{euro.format(selectedWine.priceFrom)}</dd></div>
                        <div><dt>{t.icons.reward} {t.card.reward}</dt><dd>{selectedWine.reward ? `${selectedWine.reward.name}${selectedWine.reward.score ? ` · ${selectedWine.reward.score}` : ''}` : t.modal.rewardNone}</dd></div>
                      </dl>
                    </section>
                  )
                })()}

                <section className="detail-card score-detail-card">
                  <h3>{t.icons.avgScore} {t.card.avgScore}</h3>
                  <p className="score-detail-date">📅 {selectedWine.tastedAt} · {selectedWine.month}</p>
                  <div className="reviewer-score-grid">
                    <article className="reviewer-score reviewer-score-maria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">👩</span>
                        <strong>{t.modal.mariaScore}</strong>
                      </header>
                      <p>{selectedWine.mariaScore != null ? selectedWine.mariaScore.toFixed(2) : t.common.notAvailableShort}</p>
                    </article>
                    <article className="reviewer-score reviewer-score-adria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">🧑</span>
                        <strong>{t.modal.adriaScore}</strong>
                      </header>
                      <p>{selectedWine.adriaScore != null ? selectedWine.adriaScore.toFixed(2) : t.common.notAvailableShort}</p>
                    </article>
                  </div>
                </section>

                <section className="detail-card">
                  <h3>🛒 {t.modal.purchase}</h3>
                  <dl>
                    <div><dt>📍 {t.modal.place}</dt><dd>{selectedWine.place}{selectedWine.city !== '-' ? ` · ${selectedWine.city}` : ''}</dd></div>
                    <div><dt>{t.icons.price} {t.card.priceFrom}</dt><dd>{euro.format(selectedWine.priceFrom)}</dd></div>
                    <div><dt>📅 {t.modal.tastedAt}</dt><dd>{selectedWine.tastedAt}</dd></div>
                    <div><dt>{t.icons.country} {t.modal.country}</dt><dd>{selectedWine.purchaseCountry ?? '-'}</dd></div>
                    <div><dt>🏠 {t.modal.address}</dt><dd>{selectedWine.purchaseAddress ?? '-'}</dd></div>
                    {selectedWine.purchaseMap ? (
                      <div><dt>🧭 {t.modal.coordinates}</dt><dd>{selectedWine.purchaseMap.lat.toFixed(5)}, {selectedWine.purchaseMap.lng.toFixed(5)}</dd></div>
                    ) : null}
                  </dl>
                  {selectedWine.purchaseMap ? (
                    <div className="detail-map-block">
                      <iframe
                        className="detail-map-embed"
                        title={`${selectedWine.place} map`}
                        src={mapEmbedUrl(selectedWine.purchaseMap.lat, selectedWine.purchaseMap.lng)}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <a
                        className="detail-map-link"
                        href={mapOpenUrl(selectedWine.purchaseMap.lat, selectedWine.purchaseMap.lng)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.modal.openMap}
                      </a>
                    </div>
                  ) : null}
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tasting} {t.modal.tasting}</h3>
                  <p>{selectedWine.notes}</p>
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tags} {t.modal.tags}</h3>
                  <div className="detail-tags">
                    {selectedWine.tags.map((tag) => <span key={`${selectedWine.id}-${tag}`}>{tag}</span>)}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {doLogoPreview ? (
        <div className="public-modal-backdrop do-logo-lightbox-backdrop" role="presentation" onClick={() => setDoLogoPreview(null)}>
          <section
            className="do-logo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${doLogoPreview.label} ${t.common.doShort}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="ghost-close do-logo-lightbox-close" onClick={() => setDoLogoPreview(null)}>
              {t.modal.close}
            </button>
            <img src={doLogoPreview.src} alt={`${doLogoPreview.label} ${t.common.doShort}`} loading="lazy" />
            <p>{doLogoPreview.label}</p>
          </section>
        </div>
      ) : null}
    </>
  )
}
