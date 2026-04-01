import type { FormEventHandler, SyntheticEvent } from 'react'
import type { CountryFilterValue, DoCreateDraft } from '../types'

type CountryOption = {
  value: Exclude<CountryFilterValue, 'all'>
  label: string
}

type DoCreatePanelProps = {
  t: (key: string) => string
  labels: {
    eyebrow: string
    title: string
    submit: string
  }
  doCreateSubmitting: boolean
  showSubmitButton?: boolean
  photoEditorSaving: boolean
  doCreateDraft: DoCreateDraft
  doCreateError: string | null
  doCreateLogoPath: string | null
  doCreateLogoCaption: string
  countryOptions: CountryOption[]
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onNameChange: (value: string) => void
  onRegionChange: (value: string) => void
  onCountryChange: (value: Exclude<CountryFilterValue, 'all'>) => void
  onCountryCodeChange: (value: string) => void
  onStartLogoPick: () => void
  onClearLogo: () => void
  onFallbackAsset: (event: SyntheticEvent<HTMLImageElement>) => void
}

export function DoCreatePanel({
  t,
  labels,
  doCreateSubmitting,
  showSubmitButton = true,
  photoEditorSaving,
  doCreateDraft,
  doCreateError,
  doCreateLogoPath,
  doCreateLogoCaption,
  countryOptions,
  onBack,
  onSubmit,
  onNameChange,
  onRegionChange,
  onCountryChange,
  onCountryCodeChange,
  onStartLogoPick,
  onClearLogo,
  onFallbackAsset,
}: DoCreatePanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h3>{labels.title}</h3>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="ghost-button small review-editor-back-button" onClick={onBack}>
              <svg className="review-editor-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                  fill="currentColor"
                />
              </svg>
              <span className="review-editor-back-text">{t('ui.back_list')}</span>
            </button>
            {showSubmitButton ? (
              <button type="submit" className="primary-button small" form="do-create-form" disabled={doCreateSubmitting}>
                {doCreateSubmitting ? t('ui.creating_do') : labels.submit}
              </button>
            ) : null}
          </div>
        </div>

        <form id="do-create-form" className="stack-form wine-create-form" onSubmit={onSubmit}>
          <fieldset className="form-block">
            <legend>{t('ui.data_basic')}</legend>
            <div className="inline-grid triple">
              <label>
                {t('ui.name')}
                <input
                  name="name"
                  type="text"
                  placeholder="Rioja"
                  value={doCreateDraft.name}
                  onChange={(event) => onNameChange(event.target.value)}
                  required
                />
              </label>
              <label>
                {t('ui.region')}
                <input
                  name="region"
                  type="text"
                  placeholder="La Rioja"
                  value={doCreateDraft.region}
                  onChange={(event) => onRegionChange(event.target.value)}
                  required
                />
              </label>
              <label>
                {t('common.country')}
                <select
                  name="country"
                  value={doCreateDraft.country}
                  onChange={(event) => onCountryChange(event.target.value as Exclude<CountryFilterValue, 'all'>)}
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inline-grid triple">
              <label>
                {t('ui.code_country')}
                <input
                  name="country_code"
                  type="text"
                  minLength={2}
                  maxLength={2}
                  placeholder="ES"
                  value={doCreateDraft.country_code}
                  onChange={(event) => onCountryCodeChange(event.target.value)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-block">
            <legend>{t('ui.logo_do')}</legend>
            <div className="do-edit-image-grid">
              <section className="do-edit-image-card">
                <header className="do-edit-image-head">
                  <div>
                    <p className="eyebrow">{t('ui.image_main')}</p>
                    <h4>{t('ui.free_crop_zoom')}</h4>
                  </div>
                  <div className="wine-photo-actions">
                    <button
                      type="button"
                      className="ghost-button tiny photo-icon-button"
                      aria-label={t('ui.edit_logo_do')}
                      disabled={doCreateSubmitting || photoEditorSaving}
                      onClick={onStartLogoPick}
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
                      disabled={doCreateSubmitting || photoEditorSaving}
                      onClick={onClearLogo}
                    >
                      <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 4h6l1 2h4v2H4V6h4l1-2Z" fill="currentColor" />
                        <path d="M7 9h10l-.8 10.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L7 9Z" fill="currentColor" opacity="0.78" />
                      </svg>
                    </button>
                  </div>
                </header>
                <div className="do-edit-image-preview">
                  {doCreateLogoPath ? (
                    <img src={doCreateLogoPath} alt="" loading="lazy" onError={onFallbackAsset} />
                  ) : (
                    <span className="do-edit-image-fallback">{t('common.doAbbreviation')}</span>
                  )}
                </div>
                <p className="muted do-edit-image-caption">{doCreateLogoCaption}</p>
              </section>
            </div>
          </fieldset>

          {doCreateError ? <p className="error-message">{doCreateError}</p> : null}
        </form>
      </section>
    </section>
  )
}
