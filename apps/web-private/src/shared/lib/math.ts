export function averageScoreByType<T extends { type: string; averageScore: number | null }>(items: T[], type: string): number {
  const values = items.filter((item) => item.type === type && item.averageScore !== null).map((item) => item.averageScore as number)
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length
  return Math.sqrt(variance)
}

export function linearRegression(points: Array<{ x: number; y: number }>): { slope: number; intercept: number } {
  if (points.length === 0) {
    return { slope: 0, intercept: 0 }
  }

  const n = points.length
  const sumX = points.reduce((sum, point) => sum + point.x, 0)
  const sumY = points.reduce((sum, point) => sum + point.y, 0)
  const sumXY = points.reduce((sum, point) => sum + (point.x * point.y), 0)
  const sumXX = points.reduce((sum, point) => sum + (point.x * point.x), 0)
  const denominator = (n * sumXX) - (sumX ** 2)

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n }
  }

  const slope = ((n * sumXY) - (sumX * sumY)) / denominator
  const intercept = (sumY - (slope * sumX)) / n
  return { slope, intercept }
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = ((1664525 * state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
