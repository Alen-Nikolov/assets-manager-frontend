import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AssetsProvider } from '../../context/AssetsProvider.tsx'
import { drill } from '../../test/sampleAssets.ts'
import ScheduledMaintenancePage from './ScheduledMaintenancePage.tsx'

function renderAt(assetId: string) {
  render(
    <MemoryRouter initialEntries={[`/dashboard/${assetId}/scheduled-maintenance`]}>
      <AssetsProvider initialAssets={[drill]}>
        <Routes>
          <Route
            path="/dashboard/:assetId/scheduled-maintenance"
            element={<ScheduledMaintenancePage />}
          />
        </Routes>
      </AssetsProvider>
    </MemoryRouter>,
  )
}

describe('ScheduledMaintenancePage', () => {
  it('shows the heading and the asset for the id in the URL', () => {
    renderAt('asset-1')

    expect(
      screen.getByRole('heading', { name: 'Scheduled maintenance' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Drill (ID: asset-1)')).toBeInTheDocument()
  })

  it('says so when the asset does not exist', () => {
    renderAt('missing')

    expect(screen.getByText('Asset not found (ID: missing)')).toBeInTheDocument()
  })
})
