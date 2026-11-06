import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAssets } from './api/assetsApi.ts'
import App from './App.tsx'
import { drill } from './test/sampleAssets.ts'

vi.mock('./api/assetsApi.ts')

function renderApp(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(fetchAssets).mockResolvedValue([drill])
  })

  it('renders the header', async () => {
    renderApp('/dashboard')

    expect(
      screen.getByRole('heading', { name: 'Assets Manager' }),
    ).toBeInTheDocument()
    await screen.findByRole('button', { name: 'Drill' })
  })

  it.each(['/', '/unknown-page'])(
    'redirects %s to the dashboard',
    async (route) => {
      renderApp(route)

      expect(
        screen.getByRole('heading', { name: 'Dashboard' }),
      ).toBeInTheDocument()
      await screen.findByRole('button', { name: 'Drill' })
    },
  )

  it('navigates between pages from the sidebar', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    await screen.findByRole('button', { name: 'Drill' })

    await user.click(screen.getByRole('link', { name: 'Assets' }))
    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    await screen.findByRole('button', { name: 'Drill' })
  })

  it('navigates from the icons when the sidebar is collapsed', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    await screen.findByRole('button', { name: 'Drill' })

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    await user.click(screen.getByRole('link', { name: 'Assets' }))

    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()
  })

  it('opens a loaded asset and follows its link to a sub-page', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')

    await user.click(await screen.findByRole('button', { name: 'Drill' }))
    await user.click(
      await screen.findByRole('link', { name: 'Scheduled maintenance' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Scheduled maintenance' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Drill (ID: asset-1)')).toBeInTheDocument()
  })
})

describe('App asset cache', () => {
  beforeEach(() => {
    vi.mocked(fetchAssets).mockReset()
    vi.mocked(fetchAssets).mockResolvedValue([drill])
  })

  it('loads the assets once and reuses them when revisiting pages', async () => {
    const user = userEvent.setup()
    renderApp('/dashboard')
    await screen.findByRole('button', { name: 'Drill' })

    await user.click(screen.getByRole('link', { name: 'Assets' }))
    expect(
      await screen.findByRole('heading', { name: 'Drill' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    expect(
      await screen.findByRole('button', { name: 'Drill' }),
    ).toBeInTheDocument()

    expect(fetchAssets).toHaveBeenCalledTimes(1)
  })
})
