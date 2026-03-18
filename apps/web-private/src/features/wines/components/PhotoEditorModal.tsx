import type { ChangeEventHandler, PointerEventHandler, RefObject } from 'react'
import type { DoLogoCropRatio, PhotoEditorAssetType } from '../types'

type PhotoEditorModalProps = {
  open: boolean
  t: (key: string) => string
  photoEditorType: PhotoEditorAssetType | null
  title: string
  ratioClass: string
  isMobileViewport: boolean
  zoom: number
  offsetX: number
  offsetY: number
  doLogoCropRatio: DoLogoCropRatio
  error: string | null
  saving: boolean
  canvasRef: RefObject<HTMLCanvasElement | null>
  onClose: () => void
  onSave: () => void
  onPointerDown: PointerEventHandler<HTMLDivElement>
  onPointerMove: PointerEventHandler<HTMLDivElement>
  onPointerUp: PointerEventHandler<HTMLDivElement>
  onDecreaseZoom: () => void
  onIncreaseZoom: () => void
  onZoomChange: ChangeEventHandler<HTMLInputElement>
  onOffsetXChange: ChangeEventHandler<HTMLInputElement>
  onOffsetYChange: ChangeEventHandler<HTMLInputElement>
  onDoLogoCropRatioChange: (ratio: DoLogoCropRatio) => void
}

export function PhotoEditorModal({
  open,
  t,
  photoEditorType,
  title,
  ratioClass,
  isMobileViewport,
  zoom,
  offsetX,
  offsetY,
  doLogoCropRatio,
  error,
  saving,
  canvasRef,
  onClose,
  onSave,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDecreaseZoom,
  onIncreaseZoom,
  onZoomChange,
  onOffsetXChange,
  onOffsetYChange,
  onDoLogoCropRatioChange,
}: PhotoEditorModalProps) {
  if (!open || photoEditorType == null) {
    return null
  }

  return (
    <div className="modal-backdrop modal-backdrop-top" role="presentation" onClick={onClose}>
      <section
        className="photo-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="photo-editor-header">
          <div>
            <p className="eyebrow">{t('common.photoEditorEyebrow')}</p>
            <h3 id="photo-editor-title">{title}</h3>
          </div>
          <button type="button" className="ghost-button small" onClick={onClose}>
            {t('ui.close')}
          </button>
        </header>

        <div className="photo-editor-body">
          <div
            className={`photo-editor-preview-wrap ${ratioClass}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <canvas ref={canvasRef} className="photo-editor-preview" />
            {photoEditorType !== 'situation' ? (
              <div className="photo-editor-zoom-buttons">
                <button type="button" className="ghost-button tiny photo-editor-zoom-button" onClick={onDecreaseZoom} aria-label={t('common.decreaseZoom')}>-</button>
                <button type="button" className="ghost-button tiny photo-editor-zoom-button" onClick={onIncreaseZoom} aria-label={t('ui.increase_zoom')}>+</button>
              </div>
            ) : null}
          </div>

          <div className="photo-editor-controls">
            <p className="muted">
              {photoEditorType === 'situation'
                ? t('ui.format_libre_without_crop_required')
                : photoEditorType === 'do_logo'
                  ? t('ui.logo_do_choose_ratio_arrastra_and_pellizca_for_adjust')
                  : `Format ${photoEditorType === 'bottle' ? '9:16' : '3:4'} · ${t('ui.arrastra_for_move_and_pellizca_for_zoom')}`}
            </p>
            {photoEditorType === 'do_logo' ? (
              <label>
                {t('common.crop')}
                <div className="photo-editor-crop-buttons" role="group" aria-label={t('ui.select_ratio_crop')}>
                  {(['photo', '1:1', '3:4', '4:3', '16:9', '9:16'] as DoLogoCropRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      className={`ghost-button tiny${doLogoCropRatio === ratio ? ' is-active' : ''}`}
                      onClick={() => onDoLogoCropRatioChange(ratio)}
                    >
                      {ratio === 'photo' ? t('common.photo') : ratio}
                    </button>
                  ))}
                </div>
              </label>
            ) : null}
            {photoEditorType !== 'situation' ? (
              <>
                <label>
                  {t('common.zoom')}
                  <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={onZoomChange} />
                </label>
                {!isMobileViewport ? (
                  <>
                    <label>
                      {t('ui.offset_x')}
                      <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={onOffsetXChange} />
                    </label>
                    <label>
                      {t('ui.offset_and')}
                      <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={onOffsetYChange} />
                    </label>
                  </>
                ) : null}
              </>
            ) : null}
            {error ? <p className="error-message">{error}</p> : null}
          </div>
        </div>

        <footer className="photo-editor-footer">
          <button type="button" className="ghost-button" onClick={onClose}>
            {t('ui.cancel')}
          </button>
          <button type="button" className="secondary-button" disabled={saving} onClick={onSave}>
            {saving ? t('ui.saving_photo') : t('ui.save')}
          </button>
        </footer>
      </section>
    </div>
  )
}
