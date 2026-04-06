import type { ChangeEvent, FormEventHandler } from 'react'

type WineAiCreatePanelProps = {
  t: (key: string) => string
  frontLabelImageName: string | null
  backLabelImageName: string | null
  ticketImageName: string | null
  notes: string
  priceOverride: string
  placeType: 'restaurant' | 'supermarket'
  locationName: string
  locationAddress: string
  locationCity: string
  locationCountry: string
  locationLatitude: string
  locationLongitude: string
  submitting: boolean
  error: string | null
  locating: boolean
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onFrontLabelImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBackLabelImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onTicketImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onNotesChange: (value: string) => void
  onPriceOverrideChange: (value: string) => void
  onPlaceTypeChange: (value: 'restaurant' | 'supermarket') => void
  onLocationFieldChange: (field: 'locationName' | 'locationAddress' | 'locationCity' | 'locationCountry' | 'locationLatitude' | 'locationLongitude', value: string) => void
  onCaptureLocation: () => void
}

export function WineAiCreatePanel({
  t,
  frontLabelImageName,
  backLabelImageName,
  ticketImageName,
  notes,
  priceOverride,
  placeType,
  locationName,
  locationAddress,
  locationCity,
  locationCountry,
  locationLatitude,
  locationLongitude,
  submitting,
  error,
  locating,
  onBack,
  onSubmit,
  onFrontLabelImageChange,
  onBackLabelImageChange,
  onTicketImageChange,
  onNotesChange,
  onPriceOverrideChange,
  onPlaceTypeChange,
  onLocationFieldChange,
  onCaptureLocation,
}: WineAiCreatePanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel ai-create-panel" aria-busy={submitting}>
        <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{t('ui.ai_wine_creation')}</p>
            <h3>{t('ui.create_wine_with_ai')}</h3>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="ghost-button small review-editor-back-button" onClick={onBack}>
              <span className="review-editor-back-text">{t('ui.back_list')}</span>
            </button>
          </div>
        </div>

        <form className="stack-form wine-create-form" onSubmit={onSubmit}>
          <fieldset className="form-block">
            <legend>{t('ui.ai_evidence')}</legend>
            <div className="inline-grid">
              <label>
                {t('ui.front_label_image')}
                <input name="wine_image" type="file" accept="image/*" onChange={onFrontLabelImageChange} required />
                <small>{frontLabelImageName ?? t('ui.no_file_selected')}</small>
              </label>
              <label>
                {t('ui.back_label_image_optional')}
                <input name="back_label_image" type="file" accept="image/*" onChange={onBackLabelImageChange} />
                <small>{backLabelImageName ?? t('ui.no_file_selected')}</small>
              </label>
            </div>
            <div className="inline-grid">
              <label>
                {t('ui.ticket_image_optional')}
                <input name="ticket_image" type="file" accept="image/*" onChange={onTicketImageChange} />
                <small>{ticketImageName ?? t('ui.no_file_selected')}</small>
              </label>
            </div>
            <label>
              {t('ui.extra_notes')}
              <textarea rows={4} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder={t('ui.ai_notes_placeholder')} />
            </label>
          </fieldset>

          <fieldset className="form-block">
            <legend>{t('ui.purchase_and_place_tasting')}</legend>
            <div className="inline-grid triple">
              <label>
                {t('ui.type_place')}
                <select value={placeType} onChange={(event) => onPlaceTypeChange(event.target.value as 'restaurant' | 'supermarket')}>
                  <option value="restaurant">{t('common.placeType.restaurant')}</option>
                  <option value="supermarket">{t('common.placeType.supermarket')}</option>
                </select>
              </label>
              <label>
                {t('ui.price_override_optional')}
                <input type="number" min="0" step="0.01" value={priceOverride} onChange={(event) => onPriceOverrideChange(event.target.value)} />
              </label>
              <label>
                {t('ui.current_location')}
                <button type="button" className="secondary-button small" onClick={onCaptureLocation} disabled={locating}>
                  {locating ? t('ui.locating') : t('ui.use_current_location')}
                </button>
              </label>
            </div>

            <div className="inline-grid triple">
              <label>
                {t('ui.place_name_optional')}
                <input type="text" value={locationName} onChange={(event) => onLocationFieldChange('locationName', event.target.value)} />
              </label>
              <label>
                {t('ui.address_place')}
                <input type="text" value={locationAddress} onChange={(event) => onLocationFieldChange('locationAddress', event.target.value)} />
              </label>
              <label>
                {t('ui.city')}
                <input type="text" value={locationCity} onChange={(event) => onLocationFieldChange('locationCity', event.target.value)} />
              </label>
            </div>

            <div className="inline-grid triple">
              <label>
                {t('common.purchaseCountry')}
                <input type="text" value={locationCountry} onChange={(event) => onLocationFieldChange('locationCountry', event.target.value)} />
              </label>
              <label>
                {t('ui.latitude')}
                <input type="text" value={locationLatitude} onChange={(event) => onLocationFieldChange('locationLatitude', event.target.value)} />
              </label>
              <label>
                {t('ui.longitude')}
                <input type="text" value={locationLongitude} onChange={(event) => onLocationFieldChange('locationLongitude', event.target.value)} />
              </label>
            </div>
          </fieldset>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="panel-header-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? t('ui.analyzing_with_ai') : t('ui.analyze_with_ai')}
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}
