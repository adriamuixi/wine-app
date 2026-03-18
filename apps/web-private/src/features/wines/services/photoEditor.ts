import type { DoLogoCropRatio, PhotoEditorAssetType } from '../types'

function getDoLogoCropAspect(photoEditorType: PhotoEditorAssetType | null, photoEditorDoLogoCropRatio: DoLogoCropRatio): number | null {
  if (photoEditorType !== 'do_logo') {
    return null
  }

  switch (photoEditorDoLogoCropRatio) {
    case '1:1':
      return 1
    case '3:4':
      return 3 / 4
    case '4:3':
      return 4 / 3
    case '16:9':
      return 16 / 9
    case '9:16':
      return 9 / 16
    case 'photo':
    default:
      return null
  }
}

export function getPhotoEditorRatioClass(photoEditorType: PhotoEditorAssetType | null, photoEditorDoLogoCropRatio: DoLogoCropRatio): string {
  if (photoEditorType === 'bottle') {
    return 'ratio-9-16'
  }
  if (photoEditorType === 'situation') {
    return 'ratio-free'
  }
  if (photoEditorType === 'do_logo') {
    if (photoEditorDoLogoCropRatio === '1:1') return 'ratio-1-1'
    if (photoEditorDoLogoCropRatio === '3:4') return 'ratio-3-4'
    if (photoEditorDoLogoCropRatio === '4:3') return 'ratio-4-3'
    if (photoEditorDoLogoCropRatio === '16:9') return 'ratio-16-9'
    if (photoEditorDoLogoCropRatio === '9:16') return 'ratio-9-16'
    return 'ratio-free'
  }

  return 'ratio-3-4'
}

async function loadImageElement(source: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image_load_error'))
    image.src = source
  })
}

type DrawPhotoEditorPreviewParams = {
  photoEditorSource: string | null
  photoEditorType: PhotoEditorAssetType | null
  photoEditorDoLogoCropRatio: DoLogoCropRatio
  photoEditorZoom: number
  photoEditorOffsetX: number
  photoEditorOffsetY: number
  canvas: HTMLCanvasElement | null
}

export async function drawPhotoEditorPreviewImage({
  photoEditorSource,
  photoEditorType,
  photoEditorDoLogoCropRatio,
  photoEditorZoom,
  photoEditorOffsetX,
  photoEditorOffsetY,
  canvas,
}: DrawPhotoEditorPreviewParams): Promise<{ canvas: HTMLCanvasElement; outputFileName: string } | null> {
  if (photoEditorSource == null || photoEditorType == null || canvas == null) {
    return null
  }

  const image = await loadImageElement(photoEditorSource)
  const isBottlePhoto = photoEditorType === 'bottle'
  const isSituationPhoto = photoEditorType === 'situation'
  const isDoLogoPhoto = photoEditorType === 'do_logo'
  const doLogoCropAspect = getDoLogoCropAspect(photoEditorType, photoEditorDoLogoCropRatio)
  const isFreeAspectPhoto = isSituationPhoto || (isDoLogoPhoto && doLogoCropAspect == null)
  const maxFreeSide = 2048
  const freeScale = isFreeAspectPhoto ? Math.min(1, maxFreeSide / Math.max(image.naturalWidth, image.naturalHeight)) : 1
  const outputWidth = isFreeAspectPhoto
    ? Math.max(1, Math.round(image.naturalWidth * freeScale))
    : (isDoLogoPhoto && doLogoCropAspect != null
      ? Math.max(1, Math.round(doLogoCropAspect >= 1 ? (1024 * doLogoCropAspect) : 1024))
      : (isBottlePhoto ? 576 : 768))
  const outputHeight = isFreeAspectPhoto
    ? Math.max(1, Math.round(image.naturalHeight * freeScale))
    : (isDoLogoPhoto && doLogoCropAspect != null
      ? Math.max(1, Math.round(doLogoCropAspect >= 1 ? 1024 : (1024 / doLogoCropAspect)))
      : 1024)
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')
  if (ctx == null) {
    return null
  }

  const baseScale = isFreeAspectPhoto
    ? Math.min(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight)
    : Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight)
  const effectiveScale = isSituationPhoto ? baseScale : (baseScale * photoEditorZoom)
  const drawWidth = image.naturalWidth * effectiveScale
  const drawHeight = image.naturalHeight * effectiveScale

  const panMaxX = isSituationPhoto ? 0 : Math.max(0, (drawWidth - outputWidth) / 2)
  const panMaxY = isSituationPhoto ? 0 : Math.max(0, (drawHeight - outputHeight) / 2)
  const offsetPxX = (photoEditorOffsetX / 100) * panMaxX
  const offsetPxY = (photoEditorOffsetY / 100) * panMaxY

  const drawX = (outputWidth - drawWidth) / 2 + offsetPxX
  const drawY = (outputHeight - drawHeight) / 2 + offsetPxY

  ctx.clearRect(0, 0, outputWidth, outputHeight)
  ctx.fillStyle = '#0f0b0c'
  ctx.fillRect(0, 0, outputWidth, outputHeight)
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

  return {
    canvas,
    outputFileName: `${photoEditorType}.jpg`,
  }
}
