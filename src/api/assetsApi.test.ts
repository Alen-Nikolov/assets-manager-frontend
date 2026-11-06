import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assetImageUrl,
  createAsset,
  fetchAssets,
  uploadAssetImage,
} from './assetsApi.ts'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const raw = {
  id: 7,
  name: 'Drill',
  description: 'Cordless drill',
  category: 'Tools' as const,
  purchaseDate: '2024-03-15',
  purchasePrice: 49.9,
  notes: 'n',
  imageUrl: '/api/assets/7/image',
}

function ok(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) }
}

describe('fetchAssets', () => {
  it('GETs /api/assets and normalises ids', async () => {
    fetchMock.mockResolvedValue(ok([raw, { ...raw, id: 8, imageUrl: null }]))
    const controller = new AbortController()

    const result = await fetchAssets(controller.signal)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/assets',
      expect.objectContaining({ signal: controller.signal }),
    )
    expect(result.map((asset: { id: string }) => asset.id)).toEqual(['7', '8'])
    expect(result[0].imageUrl).toBe('/api/assets/7/image')
    expect(result[1].imageUrl).toBeNull()
  })

  it('throws when the server answers with an error status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 })

    await expect(fetchAssets()).rejects.toThrow('HTTP 500')
  })
})

describe('createAsset', () => {
  it('POSTs the JSON payload to /api/assets and returns the created asset', async () => {
    fetchMock.mockResolvedValue(ok(raw))
    const { id: _id, imageUrl: _imageUrl, ...payload } = raw

    const created = await createAsset(payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/assets')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual(payload)
    expect(created.id).toBe('7')
  })

  it('throws when the server rejects the asset', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 })

    await expect(
      createAsset({
        name: '',
        description: '',
        category: 'Tools' as const,
        purchaseDate: '',
        purchasePrice: null,
        notes: '',
      }),
    ).rejects.toThrow('HTTP 400')
  })
})

describe('uploadAssetImage', () => {
  it('PUTs multipart form data with the file in the "file" field', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    const file = new File(['x'], 'drill.png', { type: 'image/png' })

    await uploadAssetImage('7', file)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/assets/7/image')
    expect(init.method).toBe('PUT')
    expect(init.body).toBeInstanceOf(FormData)
    expect(init.body.get('file')).toBe(file)
    expect(init.headers).toBeUndefined()
  })

  it('throws on an error status such as 413', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 413 })

    await expect(
      uploadAssetImage('7', new File(['x'], 'a.png')),
    ).rejects.toThrow('HTTP 413')
  })
})

describe('assetImageUrl', () => {
  it('points at the image endpoint of the asset', () => {
    expect(assetImageUrl('7')).toBe('/api/assets/7/image')
  })
})
