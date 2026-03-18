import type { PointerEvent as ReactPointerEvent } from 'react'
import { useRef } from 'react'
import type { PhotoEditorAssetType } from '../types'
import { clamp } from '../../../shared/lib/math'

type UsePhotoEditorGesturesParams = {
  photoEditorType: PhotoEditorAssetType | null
  photoEditorZoom: number
  photoEditorOffsetX: number
  photoEditorOffsetY: number
  setPhotoEditorZoom: (nextValue: number) => void
  setPhotoEditorOffsetX: (nextValue: number | ((current: number) => number)) => void
  setPhotoEditorOffsetY: (nextValue: number | ((current: number) => number)) => void
}

export function usePhotoEditorGestures({
  photoEditorType,
  photoEditorZoom,
  photoEditorOffsetX,
  photoEditorOffsetY,
  setPhotoEditorZoom,
  setPhotoEditorOffsetX,
  setPhotoEditorOffsetY,
}: UsePhotoEditorGesturesParams) {
  const photoEditorDragRef = useRef<{ active: boolean; pointerId: number; lastX: number; lastY: number } | null>(null)
  const photoEditorPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const photoEditorPinchRef = useRef<{
    baseDistance: number
    baseZoom: number
    baseOffsetX: number
    baseOffsetY: number
    baseMidX: number
    baseMidY: number
    rect: DOMRect
  } | null>(null)

  const photoEditorDistance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.hypot(dx, dy)
  }

  const photoEditorMidpoint = (a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  })

  const beginPhotoEditorPinch = (rect: DOMRect) => {
    const points = [...photoEditorPointersRef.current.values()]
    if (points.length < 2 || photoEditorType === 'situation') {
      photoEditorPinchRef.current = null
      return
    }

    const [first, second] = points
    const distance = photoEditorDistance(first, second)
    if (distance <= 0) {
      return
    }

    const midpoint = photoEditorMidpoint(first, second)
    photoEditorPinchRef.current = {
      baseDistance: distance,
      baseZoom: photoEditorZoom,
      baseOffsetX: photoEditorOffsetX,
      baseOffsetY: photoEditorOffsetY,
      baseMidX: midpoint.x,
      baseMidY: midpoint.y,
      rect,
    }
  }

  const handlePhotoEditorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    photoEditorPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (photoEditorPointersRef.current.size >= 2) {
      photoEditorDragRef.current = null
      beginPhotoEditorPinch(event.currentTarget.getBoundingClientRect())
      return
    }

    photoEditorPinchRef.current = null
    photoEditorDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    }
  }

  const handlePhotoEditorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (photoEditorPointersRef.current.has(event.pointerId)) {
      photoEditorPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    if (photoEditorPointersRef.current.size >= 2 && photoEditorType !== 'situation') {
      const points = [...photoEditorPointersRef.current.values()]
      const [first, second] = points
      if (first && second) {
        const pinchState = photoEditorPinchRef.current
        if (pinchState != null && pinchState.baseDistance > 0) {
          const distance = photoEditorDistance(first, second)
          const midpoint = photoEditorMidpoint(first, second)
          const scale = distance / pinchState.baseDistance
          const nextZoom = clamp(pinchState.baseZoom * scale, 1, 3)
          const deltaMidX = midpoint.x - pinchState.baseMidX
          const deltaMidY = midpoint.y - pinchState.baseMidY
          const nextOffsetX = clamp(pinchState.baseOffsetX + ((deltaMidX / pinchState.rect.width) * 100), -100, 100)
          const nextOffsetY = clamp(pinchState.baseOffsetY + ((deltaMidY / pinchState.rect.height) * 100), -100, 100)
          setPhotoEditorZoom(nextZoom)
          setPhotoEditorOffsetX(nextOffsetX)
          setPhotoEditorOffsetY(nextOffsetY)
        }
      }
      return
    }

    const drag = photoEditorDragRef.current
    if (!drag || !drag.active || drag.pointerId !== event.pointerId) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const deltaX = event.clientX - drag.lastX
    const deltaY = event.clientY - drag.lastY
    drag.lastX = event.clientX
    drag.lastY = event.clientY

    if (rect.width > 0) {
      setPhotoEditorOffsetX((current) => clamp(current + ((deltaX / rect.width) * 100), -100, 100))
    }
    if (rect.height > 0) {
      setPhotoEditorOffsetY((current) => clamp(current + ((deltaY / rect.height) * 100), -100, 100))
    }
  }

  const handlePhotoEditorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    photoEditorPointersRef.current.delete(event.pointerId)

    if (photoEditorPointersRef.current.size < 2) {
      photoEditorPinchRef.current = null
    }

    if (photoEditorDragRef.current?.pointerId === event.pointerId || photoEditorPointersRef.current.size === 0) {
      photoEditorDragRef.current = null
    }

    if (photoEditorPointersRef.current.size === 1) {
      const [pointerId, point] = [...photoEditorPointersRef.current.entries()][0]
      photoEditorDragRef.current = {
        active: true,
        pointerId,
        lastX: point.x,
        lastY: point.y,
      }
    }
  }

  const resetPhotoEditorGestures = () => {
    photoEditorDragRef.current = null
    photoEditorPinchRef.current = null
    photoEditorPointersRef.current.clear()
  }

  return {
    handlePhotoEditorPointerDown,
    handlePhotoEditorPointerMove,
    handlePhotoEditorPointerUp,
    resetPhotoEditorGestures,
  }
}
