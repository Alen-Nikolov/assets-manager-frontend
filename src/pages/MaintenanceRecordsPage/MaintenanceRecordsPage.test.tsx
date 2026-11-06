import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AssetsProvider } from '../../context/AssetsProvider.tsx'
import { drill } from '../../test/sampleAssets.ts'
import MaintenanceRecordsPage from './MaintenanceRecordsPage.tsx'

function renderAt(assetId: string) {
  render(
    <MemoryRouter initialEntries={[`/dashboard/${assetId}/maintenance-records`]}>
      <AssetsProvider initialAssets={[drill]}>
        <Routes>
          <Route
            path="/dashboard/:assetId/maintenance-records"
            element={<MaintenanceRecordsPage />}
          />
        </Routes>
      </AssetsProvider>
    </MemoryRouter>,
  )
}

describe('MaintenanceRecordsPage', () => {
  it('shows the heading and the asset for the id in the URL', () => {
    renderAt('asset-1')

    expect(
      screen.getByRole('heading', { name: 'Maintenance records' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Drill (ID: asset-1)')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Back to dashboard/ }),
    ).toHaveAttribute('href', '/dashboard')
  })

  it('says so when the asset does not exist', () => {
    renderAt('missing')

    expect(screen.getByText('Asset not found (ID: missing)')).toBeInTheDocument()
  })
})
