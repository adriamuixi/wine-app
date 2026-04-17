import type { FormEventHandler, SyntheticEvent } from 'react'
import type { CountryFilterValue, DoEditDraft } from '../types'

type DoEditModalProps = {
  open: boolean
  formId?: string
  t: (key: string) => string
  targetName: string
  doEditDraft: DoEditDraft | null
  doEditDoLogoPath: string | null
  doEditRegionLogoPath: string | null
  doAssetUploadingType: string | null
  doEditSubmitting: boolean
  photoEditorSaving: boolean
  doEditError: string | null
  countryOptions: Array<{ value: Exclude<CountryFilterValue, 'all'>; label: string }>
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onNameChange: (value: string) => void
  onRegionChange: (value: string) => void
  onCountryChange: (value: Exclude<CountryFilterValue, 'all'>) => void
  onCountryCodeChange: (value: string) => void
  onStartDoEditLogoPick: () => void
  onClearDoLogo: () => void
  onFallbackAsset: (event: SyntheticEvent<HTMLImageElement>) => void
}

export function DoEditModal({
  open,
  formId = 'do-edit-form',
  t,
  targetName,
  doEditDraft,
  doEditDoLogoPath,
  doEditRegionLogoPath,
  doAssetUploadingType,
  doEditSubmitting,
  photoEditorSaving,
  doEditError,
  countryOptions,
  onClose,
  onSubmit,
  onNameChange,
  onRegionChange,
  onCountryChange,
  onCountryCodeChange,
  onStartDoEditLogoPick,
  onClearDoLogo,
  onFallbackAsset,
}: DoEditModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop wine-delete-backdrop do-edit-backdrop" role="presentation" onClick={onClose}>
      <section
        className="confirm-modal do-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-do-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="confirm-modal-header">
          <p className="eyebrow">{t('ui.edit_do')}</p>
          <h3 id="edit-do-title">{targetName}</h3>
        </header>
        <form id={formId} className="stack-form do-edit-form" onSubmit={onSubmit}>
          <div className="do-edit-image-grid">
            <section className="do-edit-image-card">
              <header className="do-edit-image-head">
                <div>
                  <p className="eyebrow">{t('ui.do_logo_section')}</p>
                  <h4>{t('ui.main_image')}</h4>
                </div>
                <div className="wine-photo-actions">
                  <button
                    type="button"
                    className="ghost-button tiny photo-icon-button"
                    aria-label={t('ui.edit_logo_do')}
                    disabled={doAssetUploadingType != null || doEditSubmitting || photoEditorSaving}
                    onClick={onStartDoEditLogoPick}
                  >
                    <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 20h4l10-10-4-4L4 16v4Z" fill="currentColor" />
                      <path d="m13 7 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ghost-button tiny danger photo-icon-button"
                    aria-label={t('ui.delete_logo_do')}
                    disabled={doAssetUploadingType != null || doEditSubmitting}
                    onClick={onClearDoLogo}
                  >
                    <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 4h6l1 2h4v2H4V6h4l1-2Z" fill="currentColor" />
                      <path d="M7 9h10l-.8 10.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L7 9Z" fill="currentColor" opacity="0.78" />
                    </svg>
                  </button>
                </div>
              </header>
              <div className="do-edit-image-preview">
                {doEditDoLogoPath ? (
                  <img src={doEditDoLogoPath} alt="" loading="lazy" onError={onFallbackAsset} />
                ) : (
                  <span className="do-edit-image-fallback">{t('common.doAbbreviation')}</span>
                )}
              </div>
              <p className="muted do-edit-image-caption">
                {doAssetUploadingType === 'do_logo'
                  ? t('ui.uploading_image')
                  : (doEditDraft?.do_logo?.trim() !== '' ? doEditDraft?.do_logo : t('ui.without_logo_assigned'))}
              </p>
            </section>

            <section className="do-edit-image-card">
              <header className="do-edit-image-head">
                <div>
                  <p className="eyebrow">{t('ui.logo_region')}</p>
                  <h4>{t('ui.image_territorial')}</h4>
                </div>
                <span className="muted">{t('common.notEditable')}</span>
              </header>
              <div className="do-edit-image-preview do-edit-image-preview-region">
                {doEditRegionLogoPath ? (
                  <img src={doEditRegionLogoPath} alt="" loading="lazy" onError={onFallbackAsset} />
                ) : (
                  <span className="do-edit-image-fallback">REG</span>
                )}
              </div>
              <p className="muted do-edit-image-caption">
                {doEditDraft?.region_logo?.trim() !== '' ? doEditDraft?.region_logo : t('ui.without_logo_assigned')}
              </p>
            </section>
          </div>

          <div className="inline-grid triple do-form-fields-grid">
            <label>
              {t('ui.name')}
              <input name="name" type="text" value={doEditDraft?.name ?? ''} onChange={(event) => onNameChange(event.target.value)} required />
            </label>
            <label>
              {t('ui.region')}
              <input name="region" type="text" value={doEditDraft?.region ?? ''} onChange={(event) => onRegionChange(event.target.value)} required />
            </label>
            <label>
              {t('common.country')}
              <select
                name="country"
                value={doEditDraft?.country ?? 'spain'}
                onChange={(event) => onCountryChange(event.target.value as Exclude<CountryFilterValue, 'all'>)}
              >
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </select>
            </label>
            <label>
              {t('ui.code_country')}
              <input
                name="country_code"
                type="text"
                minLength={2}
                maxLength={2}
                value={doEditDraft?.country_code ?? ''}
                onChange={(event) => onCountryCodeChange(event.target.value)}
                required
              />
            </label>
          </div>
          {doEditError ? <p className="error-message">{doEditError}</p> : null}
          <footer className="confirm-modal-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={doEditSubmitting}>
              {t('ui.cancel')}
            </button>
            <button type="submit" className="primary-button" disabled={doEditSubmitting}>
              {doEditSubmitting ? t('ui.saving_changes') : t('ui.save_changes')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
