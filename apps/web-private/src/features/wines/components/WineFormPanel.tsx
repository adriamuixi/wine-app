import type { FormEventHandler, ReactNode, RefObject, SyntheticEvent } from 'react'
import { WorldCountrySelect } from '../../../shared/components/WorldCountrySelect'
import type {
  AwardRow,
  CountryFilterValue,
  GrapeBlendRow,
  WineDetailsApiWine,
  WineItem,
} from '../types'

type DoOption = {
  id: number
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
  region_logo: string | null
}

type CreateDoOption = {
  id: number
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
}

type GrapeGroup = {
  key: string
  label: string
  grapes: Array<{ id: number; name: string }>
}

type PurchaseDraft = {
  place: {
    place_type: string
    name: string
    country: string
    address: string | null
    city: string | null
  }
  price_paid: number | null
  purchased_at: string | null
}

type WineFormPanelProps = {
  t: (key: string) => string
  labels: {
    wines: {
      add: {
        eyebrow: string
        title: string
        submit: string
        name: string
        type: string
        vintage: string
        winery: string
        place: string
        price: string
      }
    }
    wineType: Record<string, string>
    common: {
      allCountries: string
    }
  }
  mode: 'wineCreate' | 'wineEdit'
  wineFormId: string
  wineSubmitLabel: string
  wineFormSubmitting: boolean
  wineEditStatus: 'idle' | 'loading' | 'ready' | 'error'
  wineFormError: string | null
  selectedWineForEdit: WineItem | null
  wineEditDetails: WineDetailsApiWine | null
  agingOptions: readonly string[]
  vintageYearOptions: string[]
  countryOptions: Array<{ value: Exclude<CountryFilterValue, 'all'>; label: string }>
  placeTypeOptions: readonly string[]
  awardOptions: readonly string[]
  manufacturingCountry: Exclude<CountryFilterValue, 'all'>
  createDoCountryFilter: CountryFilterValue
  createDoSearchText: string
  createDoId: number | 'all'
  isCreateDoDropdownOpen: boolean
  selectedCreateDoOption: CreateDoOption | null
  selectedCreateDoCommunityFlagPath: string | null
  createFilteredDosBySearch: DoOption[]
  createDoDropdownRef: RefObject<HTMLDivElement | null>
  grapeBlendRows: GrapeBlendRow[]
  grapesByColor: GrapeGroup[]
  awardRows: AwardRow[]
  primaryEditPurchase: PurchaseDraft | null
  currentDateInput: string
  wineEditPhotoManager: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  onManufacturingCountryChange: (value: Exclude<CountryFilterValue, 'all'>) => void
  onCreateDoCountryFilterChange: (value: CountryFilterValue) => void
  onCreateDoSearchTextChange: (value: string) => void
  onCreateDoDropdownToggle: () => void
  onCreateDoDropdownClose: () => void
  onCreateDoIdChange: (value: number | 'all') => void
  onCreateDoSelect: (item: DoOption) => void
  updateGrapeBlendRow: (rowId: number, patch: Partial<GrapeBlendRow>) => void
  removeGrapeBlendRow: (rowId: number) => void
  addGrapeBlendRow: () => void
  updateAwardRow: (rowId: number, patch: Partial<AwardRow>) => void
  removeAwardRow: (rowId: number) => void
  addAwardRow: () => void
  onFallbackAsset: (event: SyntheticEvent<HTMLImageElement>) => void
  regionLogoPathFromImageName: (imageName: string | null) => string | null
  formatIsoDateToDdMmYyyy: (value: string) => string
}

export function WineFormPanel({
  t,
  labels,
  mode,
  wineFormId,
  wineSubmitLabel,
  wineFormSubmitting,
  wineEditStatus,
  wineFormError,
  selectedWineForEdit,
  wineEditDetails,
  agingOptions,
  vintageYearOptions,
  countryOptions,
  placeTypeOptions,
  awardOptions,
  manufacturingCountry,
  createDoCountryFilter,
  createDoSearchText,
  createDoId,
  isCreateDoDropdownOpen,
  selectedCreateDoOption,
  selectedCreateDoCommunityFlagPath,
  createFilteredDosBySearch,
  createDoDropdownRef,
  grapeBlendRows,
  grapesByColor,
  awardRows,
  primaryEditPurchase,
  currentDateInput,
  wineEditPhotoManager,
  onSubmit,
  onBack,
  onManufacturingCountryChange,
  onCreateDoCountryFilterChange,
  onCreateDoSearchTextChange,
  onCreateDoDropdownToggle,
  onCreateDoDropdownClose,
  onCreateDoIdChange,
  onCreateDoSelect,
  updateGrapeBlendRow,
  removeGrapeBlendRow,
  addGrapeBlendRow,
  updateAwardRow,
  removeAwardRow,
  addAwardRow,
  onFallbackAsset,
  regionLogoPathFromImageName,
  formatIsoDateToDdMmYyyy,
}: WineFormPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{labels.wines.add.eyebrow}</p>
            <h3>{mode === 'wineEdit' ? t('ui.edit_wine') : labels.wines.add.title}</h3>
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
            <button type="submit" className="primary-button small" form={wineFormId} disabled={wineFormSubmitting}>
              {wineSubmitLabel}
            </button>
          </div>
        </div>

        <form
          id={wineFormId}
          key={`wine-form-${mode}-${selectedWineForEdit?.id ?? 'new'}-${wineEditDetails?.id ?? 'none'}-${wineEditStatus}`}
          className="stack-form wine-create-form"
          onSubmit={onSubmit}
        >
          <div className={`wine-edit-basic-row${mode === 'wineEdit' && selectedWineForEdit ? ' is-edit' : ''}`}>
            <fieldset className="form-block wine-edit-basic-main">
              <legend>{t('ui.data_basic')}</legend>
              <label>
                {labels.wines.add.name}
                <input name="name" type="text" placeholder="Clos de la Serra" defaultValue={wineEditDetails?.name ?? selectedWineForEdit?.name ?? ''} required />
              </label>
              <div className="inline-grid triple">
                <label>
                  {labels.wines.add.type}
                  <select name="wine_type" defaultValue={wineEditDetails?.wine_type ?? selectedWineForEdit?.type ?? 'red'}>
                    <option value="red">{labels.wineType.red}</option>
                    <option value="white">{labels.wineType.white}</option>
                    <option value="rose">{labels.wineType.rose}</option>
                    <option value="sparkling">{labels.wineType.sparkling}</option>
                    <option value="sweet">{t('ui.sweet')}</option>
                    <option value="fortified">{t('ui.fortified')}</option>
                  </select>
                </label>
                <label>
                  {t('ui.crianza')}
                  <select name="aging_type" defaultValue={wineEditDetails?.aging_type ?? 'crianza'}>
                    {agingOptions.map((aging) => (
                      <option key={aging} value={aging}>{aging}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {labels.wines.add.vintage}
                  <select name="vintage_year" defaultValue={String(wineEditDetails?.vintage_year ?? selectedWineForEdit?.vintageYear ?? new Date().getFullYear())}>
                    {vintageYearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="inline-grid triple">
                <label>
                  {t('ui.alcohol_content')}
                  <input
                    name="alcohol_percentage"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    placeholder="13.5"
                    defaultValue={wineEditDetails?.alcohol_percentage ?? (selectedWineForEdit ? (selectedWineForEdit.type === 'red' ? 14 : 13) : '')}
                  />
                </label>
                <label>
                  {labels.wines.add.winery}
                  <input name="winery" type="text" placeholder="Bodega Nova" defaultValue={wineEditDetails?.winery ?? selectedWineForEdit?.winery ?? ''} />
                </label>
                <label>
                  {t('ui.country_production')}
                  <select
                    value={manufacturingCountry}
                    onChange={(event) => onManufacturingCountryChange(event.target.value as Exclude<CountryFilterValue, 'all'>)}
                  >
                    {countryOptions.map((country) => (
                      <option key={country.value} value={country.value}>{country.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            {mode === 'wineEdit' && selectedWineForEdit ? (
              <div className="wine-edit-photo-manager">
                {wineEditPhotoManager}
              </div>
            ) : null}
          </div>

          <fieldset className="form-block form-block-half">
            <legend>{t('ui.origin_and_do')}</legend>
            <div className="inline-grid">
              <label>
                {t('common.doCountry')}
                <select
                  value={createDoCountryFilter}
                  onChange={(event) => onCreateDoCountryFilterChange(event.target.value as CountryFilterValue)}
                >
                  <option value="all">{labels.common.allCountries}</option>
                  {countryOptions.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </label>
              <label>
                {t('ui.search_do')}
                <input
                  type="search"
                  value={createDoSearchText}
                  onChange={(event) => onCreateDoSearchTextChange(event.target.value)}
                  placeholder={createDoCountryFilter === 'all' ? t('ui.first_select_country') : t('ui.do_name_or_region')}
                  disabled={createDoCountryFilter === 'all'}
                />
              </label>
            </div>
            <div className="inline-grid">
              <label>
                {t('common.doAbbreviation')}
                <div className={`do-combobox${createDoCountryFilter === 'all' ? ' is-disabled' : ''}`} ref={createDoDropdownRef}>
                  <button
                    type="button"
                    className="do-combobox-trigger"
                    aria-expanded={isCreateDoDropdownOpen}
                    aria-haspopup="listbox"
                    onClick={onCreateDoDropdownToggle}
                    disabled={createDoCountryFilter === 'all'}
                  >
                    <span className="do-combobox-trigger-main">
                      {selectedCreateDoOption?.country === 'spain' ? (
                        <>
                          {selectedCreateDoCommunityFlagPath ? (
                            <img
                              src={selectedCreateDoCommunityFlagPath}
                              alt=""
                              className="do-combobox-flag"
                              loading="lazy"
                              aria-hidden="true"
                              onError={onFallbackAsset}
                            />
                          ) : (
                            <span className="do-combobox-flag-fallback" aria-hidden="true">🏳️</span>
                          )}
                          <span>{selectedCreateDoOption.name}</span>
                        </>
                      ) : (
                        <span>
                          {selectedCreateDoOption
                            ? `${selectedCreateDoOption.region} · ${selectedCreateDoOption.name}`
                            : (createDoCountryFilter === 'all' ? t('ui.select_country_before') : t('ui.without_do'))}
                        </span>
                      )}
                    </span>
                    <span className="do-combobox-caret" aria-hidden="true">▾</span>
                  </button>

                  {isCreateDoDropdownOpen && createDoCountryFilter !== 'all' ? (
                    <div className="do-combobox-menu" role="listbox" aria-label={t('common.doAbbreviation')}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={createDoId === 'all'}
                        className={`do-combobox-option${createDoId === 'all' ? ' is-selected' : ''}`}
                        onClick={() => {
                          onCreateDoIdChange('all')
                          onCreateDoDropdownClose()
                        }}
                      >
                        <span>{t('ui.without_do')}</span>
                      </button>
                      {createFilteredDosBySearch.map((item) => {
                        const isSpanishDo = item.country === 'spain'
                        const communityFlagPath = isSpanishDo ? regionLogoPathFromImageName(item.region_logo) : null
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={createDoId === item.id}
                            className={`do-combobox-option${createDoId === item.id ? ' is-selected' : ''}`}
                            onClick={() => {
                              onCreateDoSelect(item)
                              onCreateDoDropdownClose()
                            }}
                          >
                            {isSpanishDo ? (
                              communityFlagPath ? (
                                <img
                                  src={communityFlagPath}
                                  alt=""
                                  className="do-combobox-flag"
                                  loading="lazy"
                                  aria-hidden="true"
                                  onError={onFallbackAsset}
                                />
                              ) : (
                                <span className="do-combobox-flag-fallback" aria-hidden="true">🏳️</span>
                              )
                            ) : null}
                            <span>{item.country === 'spain' ? item.name : `${item.region} · ${item.name}`}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-block form-block-half">
            <legend>{t('ui.composition_and_grape')}</legend>
            <div className="grape-blend-head"><span>{t('ui.variety')}</span><span>{t('ui.percentage')}</span><span aria-hidden="true" /></div>
            <div className="grape-blend-list">
              {grapeBlendRows.map((row) => (
                <div key={row.id} className="grape-blend-row">
                  <label className="sr-only" htmlFor={`grape-row-${row.id}`}>{t('ui.variety')}</label>
                  <select id={`grape-row-${row.id}`} value={row.grapeId} onChange={(event) => updateGrapeBlendRow(row.id, { grapeId: event.target.value })}>
                    {grapesByColor.map((group) => (
                      <optgroup key={group.key} label={group.label}>
                        {group.grapes.map((grape) => (
                          <option key={grape.id} value={String(grape.id)}>{grape.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor={`grape-row-pct-${row.id}`}>{t('ui.percentage_label')}</label>
                  <input
                    id={`grape-row-pct-${row.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="%"
                    value={row.percentage}
                    onChange={(event) => updateGrapeBlendRow(row.id, { percentage: event.target.value })}
                  />
                  <button
                    type="button"
                    className="icon-square-button"
                    onClick={() => removeGrapeBlendRow(row.id)}
                    disabled={grapeBlendRows.length === 1}
                    aria-label={t('ui.delete_variety')}
                    title={t('ui.delete_variety')}
                  >
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="grape-blend-actions"><button type="button" className="secondary-button small" onClick={addGrapeBlendRow}>{t('ui.add_variety')}</button></div>
          </fieldset>

          <fieldset className="form-block">
            <legend>{t('ui.purchase_and_place_tasting')}</legend>
            <div className="inline-grid triple">
              <label>
                {t('ui.type_place')}
                <select name="place_type" defaultValue={primaryEditPurchase?.place.place_type ?? 'restaurant'}>
                  {placeTypeOptions.map((placeType) => (
                    <option key={placeType} value={placeType}>{t(`common.placeType.${placeType}`)}</option>
                  ))}
                </select>
              </label>
              <label>
                {labels.wines.add.place}
                <input name="place_name" type="text" placeholder="Celler del Centre" defaultValue={primaryEditPurchase?.place.name ?? ''} required />
              </label>
              <label>
                {labels.wines.add.price}
                <input name="price_paid" type="number" min="0" step="0.01" placeholder="18.50" defaultValue={primaryEditPurchase?.price_paid ?? selectedWineForEdit?.pricePaid ?? ''} required />
              </label>
            </div>
            <div className="inline-grid">
              <label>
                {t('ui.date_purchase')}
                <input
                  name="purchased_at"
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  pattern="(?:\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{4})"
                  defaultValue={formatIsoDateToDdMmYyyy(primaryEditPurchase?.purchased_at?.slice(0, 10) ?? currentDateInput)}
                  required
                />
              </label>
              <label>
                {t('common.purchaseCountry')}
                <WorldCountrySelect name="place_country" defaultValue={primaryEditPurchase?.place.country ?? manufacturingCountry} />
              </label>
            </div>
            <div className="inline-grid">
              <label>
                {t('ui.address_place')}
                <input name="place_address" type="text" placeholder="Carrer Major 12" defaultValue={primaryEditPurchase?.place.address ?? ''} />
              </label>
              <label>
                {t('ui.city')}
                <input name="place_city" type="text" placeholder="Barcelona" defaultValue={primaryEditPurchase?.place.city ?? ''} />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-block">
            <legend>{t('ui.awards')}</legend>
            <div className="award-rows-scroll">
              <div className="award-rows-head"><span>{t('ui.award_label')}</span><span>{t('ui.score')}</span><span>{t('ui.year')}</span><span aria-hidden="true" /></div>
              <div className="award-rows-list">
                {awardRows.map((row) => (
                  <div key={row.id} className="award-row">
                    <label className="sr-only" htmlFor={`award-name-${row.id}`}>{t('ui.award_label')}</label>
                    <select id={`award-name-${row.id}`} value={row.award} onChange={(event) => updateAwardRow(row.id, { award: event.target.value })}>
                      {awardOptions.map((award) => (
                        <option key={award} value={award}>{award}</option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor={`award-score-${row.id}`}>{t('ui.score')}</label>
                    <input id={`award-score-${row.id}`} type="number" min="0" max="100" step="0.1" placeholder="92.0" value={row.score} onChange={(event) => updateAwardRow(row.id, { score: event.target.value })} />
                    <label className="sr-only" htmlFor={`award-year-${row.id}`}>{t('ui.year')}</label>
                    <input id={`award-year-${row.id}`} type="number" min="1900" max="2030" placeholder="2024" value={row.year} onChange={(event) => updateAwardRow(row.id, { year: event.target.value })} />
                    <button type="button" className="icon-square-button" onClick={() => removeAwardRow(row.id)} aria-label={t('ui.delete_award')} title={t('ui.delete_award')}>
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="award-rows-actions"><button type="button" className="secondary-button small" onClick={addAwardRow}>{t('ui.add_award')}</button></div>
          </fieldset>

          {mode === 'wineEdit' && wineEditStatus === 'loading' ? <p className="muted">{t('ui.loading_data_wine')}</p> : null}
          {wineFormError ? <p className="error-message">{wineFormError}</p> : null}
        </form>
      </section>
    </section>
  )
}
