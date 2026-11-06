import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAssets } from '../../api/assetsApi.ts'
import { AssetsProvider } from '../../context/AssetsProvider.tsx'
import { car, drill } from '../../test/sampleAssets.ts'
import type { Asset } from '../../types/asset.ts'
import DashboardPage from './DashboardPage.tsx'

vi.mock('../../api/assetsApi.ts')
const fetchMock = vi.mocked(fetchAssets)

function renderPage() {
  render(
    <MemoryRouter>
      <AssetsProvider>
        <DashboardPage />
      </AssetsProvider>
    </MemoryRouter>,
  )
}

async function renderLoaded(assets: Asset[] = [drill, car]) {
  fetchMock.mockResolvedValue(assets)
  renderPage()
  await waitFor(() => {
    expect(screen.queryByLabelText('Loading assets')).not.toBeInTheDocument()
  })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('renders the Dashboard heading', async () => {
    await renderLoaded([])

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('shows a spinner while the assets are loading', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(screen.getByLabelText('Loading assets')).toBeInTheDocument()
  })

  it('requests the assets from the server once on load', async () => {
    await renderLoaded()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows a message when there are no assets', async () => {
    await renderLoaded([])

    expect(screen.getByText('No assets yet.')).toBeInTheDocument()
  })

  it('shows an error with a retry that reloads the assets', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValueOnce(new Error('boom'))
    fetchMock.mockResolvedValue([drill])
    renderPage()

    expect(await screen.findByText('Could not load assets.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('button', { name: 'Drill' })).toBeInTheDocument()
    expect(screen.queryByText('Could not load assets.')).not.toBeInTheDocument()
  })

  it('lists every loaded asset as a row with name and description', async () => {
    await renderLoaded()

    expect(screen.getByRole('button', { name: 'Drill' })).toHaveTextContent(
      'Cordless drill',
    )
    expect(screen.getByRole('button', { name: 'Car' })).toHaveTextContent(
      'Family car',
    )
    expect(screen.queryByText('Keep battery charged')).not.toBeInTheDocument()
  })

  it('expands the asset details under the row when it is clicked', async () => {
    const user = userEvent.setup()
    await renderLoaded()

    await user.click(screen.getByRole('button', { name: 'Drill' }))

    expect(await screen.findByText('Keep battery charged')).toBeInTheDocument()
    expect(screen.getByText('49.90')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Maintenance records' }),
    ).toHaveAttribute('href', '/dashboard/asset-1/maintenance-records')
    expect(
      screen.getByRole('link', { name: 'Scheduled maintenance' }),
    ).toHaveAttribute('href', '/dashboard/asset-1/scheduled-maintenance')
  })

  it('collapses the details when the same row is clicked again', async () => {
    const user = userEvent.setup()
    await renderLoaded()

    await user.click(screen.getByRole('button', { name: 'Drill' }))
    await user.click(screen.getByRole('button', { name: 'Drill' }))

    await waitFor(() => {
      expect(screen.queryByText('Keep battery charged')).not.toBeInTheDocument()
    })
  })

  it('keeps only one row expanded at a time', async () => {
    const user = userEvent.setup()
    await renderLoaded()

    await user.click(screen.getByRole('button', { name: 'Drill' }))
    await user.click(screen.getByRole('button', { name: 'Car' }))

    expect(screen.getByRole('button', { name: 'Car' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Drill' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
