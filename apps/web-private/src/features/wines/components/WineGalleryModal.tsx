import type { SyntheticEvent } from 'react'

type GalleryImageKey = 'bottle' | 'front' | 'back' | 'situation'

type WineGalleryModalProps = {
  open: boolean
  t: (key: string) => string
  wineName: string
  winery: string
  images: ReadonlyArray<{ key: GalleryImageKey; src: string }>
  activeKey: GalleryImageKey
  galleryLabels: Record<GalleryImageKey, string>
  compact: boolean
  onClose: () => void
  onSetActiveKey: (key: GalleryImageKey) => void
  onEditActive: () => void
  onDeleteActive: () => void
  deleteDisabled: boolean
  onFallbackWineImage: (event: SyntheticEvent<HTMLImageElement>) => void
}

export function WineGalleryModal({
  open,
  t,
  wineName,
  winery,
  images,
  activeKey,
  galleryLabels,
  compact,
  onClose,
  onSetActiveKey,
  onEditActive,
  onDeleteActive,
  deleteDisabled,
  onFallbackWineImage,
}: WineGalleryModalProps) {
  if (!open) {
    return null
  }

  const activeImage = images.find((image) => image.key === activeKey) ?? images[0]

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={`image-modal ${compact ? 'compact' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wine-gallery-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="image-modal-header">
          <div className="image-modal-head-main">
            <p className="eyebrow">{t('wineProfile.galleryEyebrow')}</p>
            <div className="image-modal-title-row">
              <h3 id="wine-gallery-title">{wineName}</h3>
              <div className="image-modal-left-actions">
                <button
                  type="button"
                  className="ghost-button small image-modal-icon-button"
                  onClick={onEditActive}
                  title={t('wineProfile.photoActions.edit')}
                  aria-label={t('wineProfile.photoActions.edit')}
                >
                  <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.62-9.62.92.92-9.62 9.62zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={onDeleteActive}
                  disabled={deleteDisabled}
                  title={t('wineProfile.photoActions.delete')}
                  aria-label={t('wineProfile.photoActions.delete')}
                >
                  🗑
                </button>
                <button
                  type="button"
                  className="ghost-button small image-modal-icon-button image-modal-close-button"
                  onClick={onClose}
                  title={t('ui.close_gallery')}
                  aria-label={t('wineProfile.closeGalleryAria')}
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="muted">{winery}</p>
          </div>
        </header>

        <div className="image-modal-stage">
          <div className="image-modal-rail" role="tablist" aria-label={t('wineProfile.imageViewsAria')}>
            {images.map((image) => {
              const isActive = image.key === activeKey
              return (
                <button
                  key={image.key}
                  type="button"
                  className={`image-modal-thumb ${isActive ? 'active' : ''}`}
                  onClick={() => onSetActiveKey(image.key)}
                  aria-pressed={isActive}
                >
                  <img src={image.src} alt={`${wineName} ${galleryLabels[image.key]}`} loading="lazy" onError={onFallbackWineImage} />
                  <span>{galleryLabels[image.key]}</span>
                </button>
              )
            })}
          </div>

          <figure className="image-modal-viewer">
            <img src={activeImage.src} alt={`${wineName} ${galleryLabels[activeImage.key]}`} onError={onFallbackWineImage} />
            <figcaption>
              <strong>{galleryLabels[activeImage.key]}</strong>
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  )
}
