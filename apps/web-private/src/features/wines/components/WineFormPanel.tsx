import { useEffect, useRef, useState } from 'react'
import type { FormEventHandler, ReactNode, RefObject, SyntheticEvent } from 'react'
import { WorldCountrySelect } from '../../../shared/components/WorldCountrySelect'
import { isWorldCountryValue, toWorldCountryValue } from '../../../shared/lib/worldCountries'
import type {
  AwardRow,
  CountryFilterValue,
  GrapeBlendRow,
  WineAiDraft,
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
    map_data: {
      lat: number
      lng: number
    } | null
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
  formResetKey?: number
  wineSubmitLabel: string
  wineFormSubmitting: boolean
  showSubmitButton?: boolean
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
  createDraft: WineAiDraft | null
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

type GeoapifyFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    name?: string
    formatted?: string
    address_line1?: string
    address_line2?: string
    street?: string
    housenumber?: string
    postcode?: string
    lat?: number
    lon?: number
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
    country_code?: string
    category?: string
    result_type?: string
  }
}

const GEOAPIFY_COUNTRY_BY_ISO2: Record<string, string> = {
  US: 'united_states',
  GB: 'united_kingdom',
  TR: 'turkiye',
  CI: 'cote_d_ivoire',
}

function toCountryValueFromGeoapify(properties: GeoapifyFeature['properties']): string | null {
  if (!properties) {
    return null
  }

  const normalizedIso = properties.country_code?.toUpperCase().trim() ?? ''
  if (normalizedIso.length > 0) {
    const override = GEOAPIFY_COUNTRY_BY_ISO2[normalizedIso]
    if (override) {
      return override
    }

    const regionName = new Intl.DisplayNames(['en'], { type: 'region' }).of(normalizedIso)
    if (regionName) {
      const normalizedRegion = toWorldCountryValue(regionName)
      if (isWorldCountryValue(normalizedRegion)) {
        return normalizedRegion
      }
    }
  }

  const normalizedCountry = toWorldCountryValue(properties.country ?? '')
  return isWorldCountryValue(normalizedCountry) ? normalizedCountry : null
}

function toAddressValueFromGeoapify(properties: GeoapifyFeature['properties']): string {
  if (!properties) {
    return ''
  }

  const placeName = toPlaceNameValueFromGeoapify(properties)
  const postcode = properties.postcode?.trim() ?? ''
  const appendPostcode = (base: string): string => {
    if (base.trim().length === 0) {
      return postcode
    }
    if (postcode.length === 0) {
      return base.trim()
    }
    return `${base.trim()}, ${postcode}`
  }

  const street = properties.street?.trim() ?? ''
  const houseNumber = properties.housenumber?.trim() ?? ''
  const assembledStreetAddress = [street, houseNumber].filter((chunk) => chunk.length > 0).join(' ').trim()

  if (placeName.length > 0) {
    if (assembledStreetAddress.length > 0) {
      return appendPostcode(assembledStreetAddress)
    }

    if (properties.address_line2 && properties.address_line2.trim().length > 0) {
      return appendPostcode(properties.address_line2)
    }

    if (properties.address_line1 && properties.address_line1.trim().length > 0 && properties.address_line1.trim() !== placeName) {
      return appendPostcode(properties.address_line1)
    }

    const formatted = properties.formatted?.trim() ?? ''
    if (formatted.length > 0) {
      const formattedParts = formatted.split(',').map((part) => part.trim()).filter((part) => part.length > 0)
      if (formattedParts.length > 1 && formattedParts[0] === placeName) {
        return appendPostcode(formattedParts.slice(1).join(', '))
      }
      return appendPostcode(formatted)
    }
  }

  if (properties.address_line1 && properties.address_line1.trim().length > 0) {
    return appendPostcode(properties.address_line1)
  }

  if (assembledStreetAddress.length > 0) {
    return appendPostcode(assembledStreetAddress)
  }
  if (properties.address_line2 && properties.address_line2.trim().length > 0) {
    return appendPostcode(properties.address_line2)
  }
  return appendPostcode(properties.formatted?.trim() ?? '')
}

function toPlaceNameValueFromGeoapify(properties: GeoapifyFeature['properties']): string {
  if (!properties) {
    return ''
  }

  const explicitName = properties.name?.trim() ?? ''
  if (explicitName.length > 0) {
    return explicitName
  }

  const resultType = properties.result_type?.trim() ?? ''
  const category = properties.category?.trim() ?? ''
  const addressLine1 = properties.address_line1?.trim() ?? ''

  if ((resultType === 'amenity' || category.includes('amenity')) && addressLine1.length > 0) {
    return addressLine1
  }

  return ''
}

function toGeoapifySuggestionLabel(properties: GeoapifyFeature['properties'] | undefined, fallback: string): string {
  const placeName = toPlaceNameValueFromGeoapify(properties)
  if (placeName.length === 0) {
    return fallback
  }

  const address = toAddressValueFromGeoapify(properties)
  if (address.length === 0 || address === placeName) {
    return placeName
  }

  return `${placeName} · ${address}`
}

function toCityValueFromGeoapify(properties: GeoapifyFeature['properties']): string {
  if (!properties) {
    return ''
  }
  return (
    properties.city?.trim()
    || properties.town?.trim()
    || properties.village?.trim()
    || properties.county?.trim()
    || properties.state?.trim()
    || ''
  )
}

function toCoordinateValuesFromGeoapify(feature: GeoapifyFeature): { latitude: string; longitude: string } {
  const latFromProperties = feature.properties?.lat
  const lonFromProperties = feature.properties?.lon
  const latFromGeometry = feature.geometry?.coordinates?.[1]
  const lonFromGeometry = feature.geometry?.coordinates?.[0]

  const latitude = Number.isFinite(latFromProperties) ? latFromProperties : latFromGeometry
  const longitude = Number.isFinite(lonFromProperties) ? lonFromProperties : lonFromGeometry

  return {
    latitude: Number.isFinite(latitude) ? Number(latitude).toFixed(6) : '',
    longitude: Number.isFinite(longitude) ? Number(longitude).toFixed(6) : '',
  }
}

async function fetchGeoapifySuggestions({
  query,
  apiKey,
  signal,
}: {
  query: string
  apiKey: string
  signal: AbortSignal
}): Promise<GeoapifyFeature[]> {
  const params = new URLSearchParams({
    text: query,
    limit: '5',
    apiKey,
    type: 'street',
  })

  const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`, {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error(`Geoapify autocomplete failed with status ${response.status}`)
  }

  const payload = await response.json() as { features?: GeoapifyFeature[] }
  return Array.isArray(payload.features) ? payload.features : []
}

export function WineFormPanel({
  t,
  labels,
  mode,
  wineFormId,
  formResetKey = 0,
  wineSubmitLabel,
  wineFormSubmitting,
  showSubmitButton = true,
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
  createDraft,
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
  const geoapifyApiKey = (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined)?.trim() ?? ''
  const isGeoapifyEnabled = geoapifyApiKey.length > 0

  const formRef = useRef<HTMLFormElement | null>(null)
  const placeNameInputRef = useRef<HTMLInputElement | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)
  const cityInputRef = useRef<HTMLInputElement | null>(null)
  const [addressAutocompleteQuery, setAddressAutocompleteQuery] = useState('')
  const [placeLatitude, setPlaceLatitude] = useState('')
  const [placeLongitude, setPlaceLongitude] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<GeoapifyFeature[]>([])
  const [isAddressSuggestionsOpen, setIsAddressSuggestionsOpen] = useState(false)
  const [isAddressSuggestionsLoading, setIsAddressSuggestionsLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const skipNextAddressLookupRef = useRef(false)
  const allowAddressLookupRef = useRef(false)

  useEffect(() => {
    const draftAddress = mode === 'wineCreate' ? (createDraft?.purchase.address ?? '') : ''
    const draftLatitude = mode === 'wineCreate' ? createDraft?.purchase.map_data?.lat : null
    const draftLongitude = mode === 'wineCreate' ? createDraft?.purchase.map_data?.lng : null
    const currentAddress = primaryEditPurchase?.place.address ?? ''
    const currentLatitude = primaryEditPurchase?.place.map_data?.lat
    const currentLongitude = primaryEditPurchase?.place.map_data?.lng
    setAddressAutocompleteQuery(mode === 'wineCreate' ? draftAddress : currentAddress)
    allowAddressLookupRef.current = false
    setPlaceLatitude(Number.isFinite(mode === 'wineCreate' ? draftLatitude : currentLatitude) ? Number(mode === 'wineCreate' ? draftLatitude : currentLatitude).toFixed(6) : '')
    setPlaceLongitude(Number.isFinite(mode === 'wineCreate' ? draftLongitude : currentLongitude) ? Number(mode === 'wineCreate' ? draftLongitude : currentLongitude).toFixed(6) : '')
    setAddressSuggestions([])
    setIsAddressSuggestionsOpen(false)
  }, [createDraft?.purchase.address, createDraft?.purchase.map_data?.lat, createDraft?.purchase.map_data?.lng, primaryEditPurchase?.place.address, primaryEditPurchase?.place.map_data?.lat, primaryEditPurchase?.place.map_data?.lng, selectedWineForEdit?.id, wineEditDetails?.id, mode, wineEditStatus])

  useEffect(() => {
    if (!isGeoapifyEnabled) {
      return
    }

    if (skipNextAddressLookupRef.current) {
      skipNextAddressLookupRef.current = false
      setIsAddressSuggestionsLoading(false)
      return
    }
    if (!allowAddressLookupRef.current) {
      setIsAddressSuggestionsLoading(false)
      return
    }

    const normalizedQuery = addressAutocompleteQuery.trim()
    if (normalizedQuery.length < 3) {
      setAddressSuggestions([])
      setIsAddressSuggestionsOpen(false)
      setIsAddressSuggestionsLoading(false)
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
        searchAbortRef.current = null
      }
      return
    }

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
    }

    debounceRef.current = window.setTimeout(async () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }

      const abortController = new AbortController()
      searchAbortRef.current = abortController
      setIsAddressSuggestionsLoading(true)

      try {
        const features = await fetchGeoapifySuggestions({
          query: normalizedQuery,
          apiKey: geoapifyApiKey,
          signal: abortController.signal,
        })

        setAddressSuggestions(features)
        setIsAddressSuggestionsOpen(features.length > 0)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setAddressSuggestions([])
          setIsAddressSuggestionsOpen(false)
        }
      } finally {
        setIsAddressSuggestionsLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [addressAutocompleteQuery, geoapifyApiKey, isGeoapifyEnabled])

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort()
      }
    }
  }, [])

  function applyGeoapifySuggestion(feature: GeoapifyFeature) {
    const properties = feature.properties
    const nextAddress = toAddressValueFromGeoapify(properties)
    const nextCity = toCityValueFromGeoapify(properties)
    const nextCountry = toCountryValueFromGeoapify(properties)
    const coordinates = toCoordinateValuesFromGeoapify(feature)

    if (addressInputRef.current) {
      addressInputRef.current.value = nextAddress
    }
    if (cityInputRef.current) {
      cityInputRef.current.value = nextCity
    }
    const countrySelect = formRef.current?.querySelector('select[name="place_country"]')
    if (countrySelect instanceof HTMLSelectElement && nextCountry) {
      countrySelect.value = nextCountry
    }

    setAddressAutocompleteQuery(nextAddress)
    setPlaceLatitude(coordinates.latitude)
    setPlaceLongitude(coordinates.longitude)
    skipNextAddressLookupRef.current = true
    setAddressSuggestions([])
    setIsAddressSuggestionsOpen(false)
  }

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
            {showSubmitButton ? (
              <button type="submit" className="primary-button small" form={wineFormId} disabled={wineFormSubmitting}>
                {wineSubmitLabel}
              </button>
            ) : null}
          </div>
        </div>

        <form
          ref={formRef}
          id={wineFormId}
          key={`wine-form-${mode}-${selectedWineForEdit?.id ?? 'new'}-${wineEditDetails?.id ?? 'none'}-${wineEditStatus}-${formResetKey}`}
          className="stack-form wine-create-form"
          onSubmit={onSubmit}
        >
          <div className={`wine-edit-basic-row${mode === 'wineEdit' && selectedWineForEdit ? ' is-edit' : ''}`}>
            <fieldset className="form-block wine-edit-basic-main">
              <legend>{t('ui.data_basic')}</legend>
              <label>
                {labels.wines.add.name}
                <input name="name" type="text" placeholder="Clos de la Serra" defaultValue={wineEditDetails?.name ?? createDraft?.wine.name ?? selectedWineForEdit?.name ?? ''} required />
              </label>
              <div className="inline-grid triple">
                <label>
                  {labels.wines.add.type}
                  <select name="wine_type" defaultValue={wineEditDetails?.wine_type ?? createDraft?.wine.wine_type ?? selectedWineForEdit?.type ?? 'red'}>
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
                  <select name="aging_type" defaultValue={wineEditDetails?.aging_type ?? createDraft?.wine.aging_type ?? 'crianza'}>
                    {agingOptions.map((aging) => (
                      <option key={aging} value={aging}>{t(`common.agingType.${aging}`)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {labels.wines.add.vintage}
                  <select name="vintage_year" defaultValue={String(wineEditDetails?.vintage_year ?? createDraft?.wine.vintage_year ?? selectedWineForEdit?.vintageYear ?? new Date().getFullYear())}>
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
                    defaultValue={wineEditDetails?.alcohol_percentage ?? createDraft?.wine.alcohol_percentage ?? (selectedWineForEdit ? (selectedWineForEdit.type === 'red' ? 14 : 13) : '')}
                  />
                </label>
                <label>
                  {labels.wines.add.winery}
                  <input name="winery" type="text" placeholder="Bodega Nova" defaultValue={wineEditDetails?.winery ?? createDraft?.wine.winery ?? selectedWineForEdit?.winery ?? ''} />
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
                <select name="place_type" defaultValue={primaryEditPurchase?.place.place_type ?? createDraft?.purchase.place_type ?? 'restaurant'}>
                  {placeTypeOptions.map((placeType) => (
                    <option key={placeType} value={placeType}>{t(`common.placeType.${placeType}`)}</option>
                  ))}
                </select>
              </label>
              <label>
                {labels.wines.add.place}
                <input ref={placeNameInputRef} name="place_name" type="text" placeholder="Celler del Centre" defaultValue={primaryEditPurchase?.place.name ?? createDraft?.purchase.place_name ?? ''} required />
              </label>
              <label>
                {labels.wines.add.price}
                <input name="price_paid" type="number" min="0" step="0.01" placeholder="18.50" defaultValue={primaryEditPurchase?.price_paid ?? createDraft?.purchase.price_paid ?? selectedWineForEdit?.pricePaid ?? ''} required />
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
                  defaultValue={formatIsoDateToDdMmYyyy(primaryEditPurchase?.purchased_at?.slice(0, 10) ?? createDraft?.purchase.purchased_at ?? currentDateInput)}
                  required
                />
              </label>
              <label>
                {t('common.purchaseCountry')}
                <WorldCountrySelect name="place_country" defaultValue={primaryEditPurchase?.place.country ?? createDraft?.purchase.country ?? manufacturingCountry} />
              </label>
            </div>
            <div className="inline-grid">
              <label>
                {t('ui.address_place')}
                <input
                  ref={addressInputRef}
                  name="place_address"
                  type="text"
                  placeholder="Carrer Major 12"
                  defaultValue={primaryEditPurchase?.place.address ?? createDraft?.purchase.address ?? ''}
                  onChange={(event) => {
                    allowAddressLookupRef.current = true
                    setAddressAutocompleteQuery(event.target.value)
                    skipNextAddressLookupRef.current = false
                    setPlaceLatitude('')
                    setPlaceLongitude('')
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setIsAddressSuggestionsOpen(true)
                    }
                  }}
                />
                {isGeoapifyEnabled ? (
                  <div className="address-autocomplete-panel">
                    {isAddressSuggestionsLoading ? <p className="address-autocomplete-status">{t('ui.searching_address')}</p> : null}
                    {!isAddressSuggestionsLoading && isAddressSuggestionsOpen ? (
                      <div className="address-autocomplete-list" role="listbox" aria-label={t('ui.address_suggestions')}>
                        {addressSuggestions.map((feature, index) => {
                          const properties = feature.properties
                          const optionLabel = toGeoapifySuggestionLabel(
                            properties,
                            properties?.formatted?.trim() || toAddressValueFromGeoapify(properties) || t('ui.address_unknown'),
                          )
                          return (
                            <button
                              key={`${optionLabel}-${index}`}
                              type="button"
                              className="address-autocomplete-option"
                              role="option"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                applyGeoapifySuggestion(feature)
                              }}
                            >
                              {optionLabel}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <p className="address-coordinates">lat: {placeLatitude || '--'} | lon: {placeLongitude || '--'}</p>
                <input name="place_latitude" type="hidden" value={placeLatitude} readOnly />
                <input name="place_longitude" type="hidden" value={placeLongitude} readOnly />
              </label>
              <label>
                {t('ui.city')}
                <input ref={cityInputRef} name="place_city" type="text" placeholder="Barcelona" defaultValue={primaryEditPurchase?.place.city ?? createDraft?.purchase.city ?? ''} />
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
