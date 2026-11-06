import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAsset, fetchAssets, uploadAssetImage } from '../../api/assetsApi.ts'
import { AssetsProvider } from '../../context/AssetsProvider.tsx'
import { car, drill } from '../../test/sampleAssets.ts'
import type { Asset } from '../../types/asset.ts'
import AssetsPage from './AssetsPage.tsx'

vi.mock('../../api/assetsApi.ts', () => ({
  fetchAssets: vi.fn(),
  createAsset: vi.fn(),
  uploadAssetImage: vi.fn(),
  assetImageUrl: (id: string) => `/api/assets/${id}/image`,
}))
const fetchMock = vi.mocked(fetchAssets)
const createMock = vi.mocked(createAsset)
const uploadMock = vi.mocked(uploadAssetImage)

let nextId = 0
function serverAsset(payload: Omit<Asset, 'id' | 'imageUrl'>): Asset {
  return { ...payload, id: `srv-${++nextId}`, imageUrl: null }
}

function renderPage() {
  render(
    <AssetsProvider>
      <AssetsPage />
    </AssetsProvider>,
  )
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  image?: File,
) {
  await user.click(screen.getByRole('button', { name: '+ Create' }))
  await user.type(screen.getByLabelText(/^Name/), name)
  await user.type(screen.getByLabelText(/^Description/), 'Some description')
  await user.click(screen.getByRole('combobox', { name: /Category/ }))
  await user.click(screen.getByRole('option', { name: 'Vehicle' }))
  await user.type(screen.getByLabelText(/^Purchase date/), '2024-01-02')
  if (image) await user.upload(screen.getByLabelText('Asset image'), image)
  await user.click(screen.getByRole('button', { name: 'Create' }))
}

async function createAsset_(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  image?: File,
) {
  await fillAndSubmit(user, name, image)
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
}

describe('AssetsPage', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue([])
    createMock.mockReset()
    uploadMock.mockReset()
    createMock.mockImplementation((payload) => Promise.resolve(serverAsset(payload)))
    uploadMock.mockResolvedValue(undefined)
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('shows the heading and the create button with no assets', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Create' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('loads the saved assets when the page opens', async () => {
    fetchMock.mockResolvedValue([drill, car])
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Drill' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Car' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows an error with a retry when loading fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValueOnce(new Error('boom'))
    fetchMock.mockResolvedValue([drill])
    renderPage()

    expect(await screen.findByText('Could not load assets.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('heading', { name: 'Drill' })).toBeInTheDocument()
  })

  it('opens the create dialog from the button', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '+ Create' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sends the asset JSON without the image to the backend', async () => {
    const user = userEvent.setup()
    renderPage()

    await createAsset_(user, 'Car')

    expect(createMock).toHaveBeenCalledWith({
      name: 'Car',
      description: 'Some description',
      category: 'Vehicle',
      purchaseDate: '2024-01-02',
      purchasePrice: null,
      notes: '',
    })
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('adds a card for each created asset', async () => {
    const user = userEvent.setup()
    renderPage()

    await createAsset_(user, 'Car')
    await createAsset_(user, 'Bike')

    expect(screen.getByRole('heading', { name: 'Car' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bike' })).toBeInTheDocument()
  })

  it('uploads the image to the new asset id and shows it on the card', async () => {
    const user = userEvent.setup()
    renderPage()
    const file = new File(['x'], 'car.png', { type: 'image/png' })

    await createAsset_(user, 'Car', file)

    expect(uploadMock).toHaveBeenCalledWith('srv-' + nextId, file)
    expect(screen.getByRole('img', { name: 'Car' })).toHaveAttribute(
      'src',
      `/api/assets/srv-${nextId}/image`,
    )
  })

  it('keeps the dialog open with an error when creating fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    createMock.mockRejectedValueOnce(new Error('Failed to create the asset (HTTP 500)'))
    renderPage()

    await fillAndSubmit(user, 'Car')

    expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Car' })).not.toBeInTheDocument()
  })

  it('still adds the asset and warns when only the image upload fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    uploadMock.mockRejectedValueOnce(new Error('Failed to upload the image (HTTP 413)'))
    renderPage()

    await createAsset_(
      user,
      'Car',
      new File(['x'], 'car.png', { type: 'image/png' }),
    )

    expect(screen.getByRole('heading', { name: 'Car' })).toBeInTheDocument()
    expect(await screen.findByText(/image could not be uploaded/)).toBeInTheDocument()
  })

  it('starts with an empty form each time the dialog opens', async () => {
    const user = userEvent.setup()
    renderPage()

    await createAsset_(user, 'Car')
    await user.click(screen.getByRole('button', { name: '+ Create' }))

    expect(screen.getByLabelText(/^Name/)).toHaveValue('')
  })
})
