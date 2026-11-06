import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAssets } from '../api/assetsApi.ts'
import { car, drill } from '../test/sampleAssets.ts'
import { AssetsProvider } from './AssetsProvider.tsx'
import { useAssets } from './assetsContext.ts'

vi.mock('../api/assetsApi.ts')
const fetchMock = vi.mocked(fetchAssets)

let api: ReturnType<typeof useAssets>
function Probe() {
  api = useAssets()
  return (
    <p>
      {api.status}:{api.assets.map((asset) => asset.name).join(',')}
    </p>
  )
}

function renderProvider(initialAssets?: typeof drill[]) {
  render(
    <AssetsProvider initialAssets={initialAssets}>
      <Probe />
    </AssetsProvider>,
  )
}

describe('AssetsProvider', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('does not fetch until a page asks for the assets', () => {
    renderProvider()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('idle:')).toBeInTheDocument()
  })

  it('fetches once even when asked several times', async () => {
    fetchMock.mockResolvedValue([drill])
    renderProvider()

    await act(async () => {
      api.loadAssets()
      api.loadAssets()
    })
    await act(async () => api.loadAssets())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('loaded:Drill')).toBeInTheDocument()
  })

  it('does not fetch when assets are preloaded', async () => {
    renderProvider([drill])

    await act(async () => api.loadAssets())

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('adds a created asset without refetching', async () => {
    fetchMock.mockResolvedValue([drill])
    renderProvider()
    await act(async () => api.loadAssets())

    act(() => api.addAsset(car))
    await act(async () => api.loadAssets())

    expect(screen.getByText('loaded:Drill,Car')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps an asset created while the request was still running', async () => {
    let resolve!: (assets: (typeof drill)[]) => void
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)))
    renderProvider()
    act(() => api.loadAssets())

    act(() => api.addAsset(car))
    await act(async () => resolve([drill]))

    expect(screen.getByText('loaded:Drill,Car')).toBeInTheDocument()
  })

  it('does not duplicate an asset the server already returned', async () => {
    let resolve!: (assets: (typeof drill)[]) => void
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)))
    renderProvider()
    act(() => api.loadAssets())

    act(() => api.addAsset(car))
    await act(async () => resolve([drill, car]))

    expect(screen.getByText('loaded:Drill,Car')).toBeInTheDocument()
  })

  it('reports an error and lets a later call retry', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'))
    fetchMock.mockResolvedValue([drill])
    renderProvider()

    await act(async () => api.loadAssets())
    expect(screen.getByText('error:')).toBeInTheDocument()

    await act(async () => api.loadAssets())
    expect(screen.getByText('loaded:Drill')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
