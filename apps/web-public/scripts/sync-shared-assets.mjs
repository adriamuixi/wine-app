import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const appRoot = path.resolve(__dirname, '..')

const candidateSources = [
  path.resolve(appRoot, '../../shared/public'),
  '/shared/public',
]

const sharedSource = candidateSources.find((candidate) => existsSync(candidate))

if (!sharedSource) {
  console.error('[sync-shared-assets] shared asset source not found. Expected one of:')
  candidateSources.forEach((candidate) => console.error(` - ${candidate}`))
  process.exit(1)
}

const directoriesToSync = ['images']

for (const relPath of directoriesToSync) {
  const src = path.join(sharedSource, relPath)
  if (!existsSync(src)) {
    console.error(`[sync-shared-assets] Missing shared directory: ${src}`)
    process.exit(1)
  }

  const dest = path.join(appRoot, 'public', relPath)
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(path.dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log(`[sync-shared-assets] synced ${relPath}`)
}
