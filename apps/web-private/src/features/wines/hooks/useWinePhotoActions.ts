import { useCallback } from 'react'
import { uploadDoLogoAsset } from '../../do/services/doApi'
import type { DoApiItem, DoCreateDraft, DoEditDraft } from '../../do/types'
import type { PhotoEditorAssetType, WineItem, WinePhotoSlotType } from '../types'
import { applyWinePhotoToGallery, fetchDefaultWinePhotoFile, uploadWinePhoto } from '../services/photoApi'

type DrawPhotoEditorPreviewResult = {
  canvas: HTMLCanvasElement
  outputFileName: string
}

type UseWinePhotoActionsParams = {
  apiBaseUrl: string
  photoEditorType: PhotoEditorAssetType | null
  photoPickerContext: 'wine' | 'doCreate' | 'doEdit' | null
  photoEditorWineId: number | null
  doCreateLogoPreviewSrc: string | null
  drawPhotoEditorPreview: () => Promise<DrawPhotoEditorPreviewResult | null>
  closePhotoEditor: () => void
  getDefaultNoPhotoSrc: () => string
  resolveApiAssetUrl: (url: string) => string
  t: (key: string) => string
  setPhotoEditorSaving: (nextValue: boolean) => void
  setPhotoEditorError: (nextValue: string | null) => void
  setPhotoDeleteBusyType: (nextValue: WinePhotoSlotType | null) => void
  setDoCreateLogoFile: (nextValue: File | null) => void
  setDoCreateLogoPreviewSrc: (nextValue: string | null) => void
  setDoCreateDraft: (updater: (current: DoCreateDraft) => DoCreateDraft) => void
  setDoAssetUploadingType: (nextValue: 'do_logo' | null) => void
  setDoEditError: (nextValue: string | null) => void
  setDoEditDraft: (updater: (current: DoEditDraft | null) => DoEditDraft | null) => void
  setDoOptions: (updater: (current: DoApiItem[]) => DoApiItem[]) => void
  setDoListReloadToken: (updater: (current: number) => number) => void
  setWineProfileReloadToken: (updater: (current: number) => number) => void
  setWineEditReloadToken: (updater: (current: number) => number) => void
  setWineListReloadToken: (updater: (current: number) => number) => void
  setSelectedWineGallery: (updater: (current: WineItem | null) => WineItem | null) => void
}

export function useWinePhotoActions({
  apiBaseUrl,
  photoEditorType,
  photoPickerContext,
  photoEditorWineId,
  doCreateLogoPreviewSrc,
  drawPhotoEditorPreview,
  closePhotoEditor,
  getDefaultNoPhotoSrc,
  resolveApiAssetUrl,
  t,
  setPhotoEditorSaving,
  setPhotoEditorError,
  setPhotoDeleteBusyType,
  setDoCreateLogoFile,
  setDoCreateLogoPreviewSrc,
  setDoCreateDraft,
  setDoAssetUploadingType,
  setDoEditError,
  setDoEditDraft,
  setDoOptions,
  setDoListReloadToken,
  setWineProfileReloadToken,
  setWineEditReloadToken,
  setWineListReloadToken,
  setSelectedWineGallery,
}: UseWinePhotoActionsParams) {
  const bumpWineReloadTokens = useCallback(() => {
    setWineProfileReloadToken((current) => current + 1)
    setWineEditReloadToken((current) => current + 1)
    setWineListReloadToken((current) => current + 1)
  }, [setWineEditReloadToken, setWineListReloadToken, setWineProfileReloadToken])

  const savePhotoEditor = useCallback(async () => {
    if (photoEditorType == null) {
      return
    }

    setPhotoEditorSaving(true)
    setPhotoEditorError(null)

    try {
      const rendered = await drawPhotoEditorPreview()
      if (rendered == null) {
        throw new Error('Unable to render image.')
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        rendered.canvas.toBlob(
          (result) => {
            if (result == null) {
              reject(new Error('Unable to generate output image.'))
              return
            }
            resolve(result)
          },
          'image/jpeg',
          0.92,
        )
      })

      const file = new File([blob], rendered.outputFileName, { type: 'image/jpeg' })

      if (photoPickerContext === 'doCreate' && photoEditorType === 'do_logo') {
        if (doCreateLogoPreviewSrc != null) {
          URL.revokeObjectURL(doCreateLogoPreviewSrc)
        }
        const nextPreview = URL.createObjectURL(file)
        setDoCreateLogoFile(file)
        setDoCreateLogoPreviewSrc(nextPreview)
        setDoCreateDraft((current) => ({ ...current, do_logo: file.name }))
        closePhotoEditor()
      } else if (photoPickerContext === 'doEdit' && photoEditorType === 'do_logo') {
        if (photoEditorWineId == null) {
          throw new Error(t('ui.not_could_identify_do'))
        }

        setDoAssetUploadingType('do_logo')
        setDoEditError(null)

        const uploadedFilename = await uploadDoLogoAsset({
          apiBaseUrl,
          doId: photoEditorWineId,
          file,
        })

        setDoEditDraft((current) => (current == null ? current : { ...current, do_logo: uploadedFilename }))
        setDoOptions((current) => current.map((item) => (
          item.id === photoEditorWineId ? { ...item, do_logo: uploadedFilename } : item
        )))
        setDoListReloadToken((current) => current + 1)
        closePhotoEditor()
        setDoAssetUploadingType(null)
      } else {
        if (
          photoEditorWineId == null
          || (photoEditorType !== 'bottle'
            && photoEditorType !== 'front_label'
            && photoEditorType !== 'back_label'
            && photoEditorType !== 'situation')
        ) {
          throw new Error(t('ui.not_could_identify_photo_wine'))
        }

        const uploadedUrl = await uploadWinePhoto({
          apiBaseUrl,
          wineId: photoEditorWineId,
          type: photoEditorType,
          file,
        })

        closePhotoEditor()
        bumpWineReloadTokens()

        if (uploadedUrl != null) {
          const resolvedUploadedUrl = resolveApiAssetUrl(uploadedUrl)
          setSelectedWineGallery((current) => {
            if (current == null || current.id !== photoEditorWineId) {
              return current
            }
            return applyWinePhotoToGallery(current, photoEditorType, resolvedUploadedUrl)
          })
        }
      }
    } catch (error: unknown) {
      setDoAssetUploadingType(null)
      setPhotoEditorError(error instanceof Error ? error.message : t('ui.not_could_upload_photo'))
    } finally {
      setPhotoEditorSaving(false)
    }
  }, [
    apiBaseUrl,
    bumpWineReloadTokens,
    closePhotoEditor,
    doCreateLogoPreviewSrc,
    drawPhotoEditorPreview,
    photoEditorType,
    photoEditorWineId,
    photoPickerContext,
    resolveApiAssetUrl,
    setDoAssetUploadingType,
    setDoCreateDraft,
    setDoCreateLogoFile,
    setDoCreateLogoPreviewSrc,
    setDoEditDraft,
    setDoEditError,
    setDoListReloadToken,
    setDoOptions,
    setPhotoEditorError,
    setPhotoEditorSaving,
    setSelectedWineGallery,
    t,
  ])

  const resetWinePhotoToDefault = useCallback(async (wineId: number, type: WinePhotoSlotType) => {
    setPhotoDeleteBusyType(type)
    try {
      const file = await fetchDefaultWinePhotoFile(getDefaultNoPhotoSrc(), type)
      const uploadedUrl = await uploadWinePhoto({
        apiBaseUrl,
        wineId,
        type,
        file,
      })

      bumpWineReloadTokens()

      if (uploadedUrl != null) {
        const resolvedUploadedUrl = resolveApiAssetUrl(uploadedUrl)
        setSelectedWineGallery((current) => {
          if (current == null || current.id !== wineId) {
            return current
          }
          return applyWinePhotoToGallery(current, type, resolvedUploadedUrl)
        })
      }
    } catch {
      setPhotoEditorError(t('ui.not_could_delete_photo'))
    } finally {
      setPhotoDeleteBusyType(null)
    }
  }, [
    apiBaseUrl,
    bumpWineReloadTokens,
    getDefaultNoPhotoSrc,
    resolveApiAssetUrl,
    setPhotoDeleteBusyType,
    setPhotoEditorError,
    setSelectedWineGallery,
    t,
  ])

  return {
    savePhotoEditor,
    resetWinePhotoToDefault,
  }
}
