import type { Asset, AssetPayload } from '../types/asset.ts'

// Origin of the backend. Empty = same origin, which the Vite dev server proxies
// to the backend (see vite.config.ts). Set VITE_API_URL for other deployments.
const API_ORIGIN: string = import.meta.env.VITE_API_URL ?? ''

/** The backend's asset JSON; ids may be numeric and imageUrl is origin-relative. */
type RawAsset = Omit<Asset, 'id'> & { id: string | number }

function toAsset(raw: RawAsset): Asset {
  return {
    ...raw,
    id: String(raw.id),
    imageUrl: raw.imageUrl ? `${API_ORIGIN}${raw.imageUrl}` : null,
  }
}

async function ensureOk(response: Response, action: string): Promise<Response> {
  if (!response.ok) {
    throw new Error(`Failed to ${action} (HTTP ${response.status})`)
  }
  return response
}

/** GET /api/assets — every saved asset. */
export async function fetchAssets(
  signal?: AbortSignal,
): Promise<Asset[]> {
  const response = await ensureOk(
    await fetch(`${API_ORIGIN}/api/assets`, {
      signal,
      headers: { Accept: 'application/json' },
    }),
    'load assets',
  )
  const raw = (await response.json()) as RawAsset[]
  return raw.map(toAsset)
}

/** POST /api/assets — step 1 of creating an asset. */
export async function createAsset(payload: AssetPayload): Promise<Asset> {
  const response = await ensureOk(
    await fetch(`${API_ORIGIN}/api/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    'create the asset',
  )
  return toAsset((await response.json()) as RawAsset)
}

/** PUT /api/assets/{id}/image — step 2: upload (or replace) the image. */
export async function uploadAssetImage(id: string, file: File): Promise<void> {
  const body = new FormData()
  body.append('file', file)
  await ensureOk(
    await fetch(`${API_ORIGIN}/api/assets/${encodeURIComponent(id)}/image`, {
      method: 'PUT',
      body,
    }),
    'upload the image',
  )
}

/** The URL the backend serves an asset's image from. */
export function assetImageUrl(id: string): string {
  return `${API_ORIGIN}/api/assets/${encodeURIComponent(id)}/image`
}
