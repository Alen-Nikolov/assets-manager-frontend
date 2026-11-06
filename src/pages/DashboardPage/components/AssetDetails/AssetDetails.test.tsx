import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { car, drill } from '../../../../test/sampleAssets.ts'
import type { Asset } from '../../../../types/asset.ts'
import AssetDetails from './AssetDetails.tsx'

function renderDetails(asset: Asset) {
  render(
    <MemoryRouter>
      <AssetDetails asset={asset} />
    </MemoryRouter>,
  )
}

describe('AssetDetails', () => {
  it('shows the details of the asset', () => {
    renderDetails(drill)

    expect(screen.getByText('Cordless drill')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('2024-03-15')).toBeInTheDocument()
    expect(screen.getByText('49.90')).toBeInTheDocument()
    expect(screen.getByText('Keep battery charged')).toBeInTheDocument()
  })

  it('shows dashes for a missing price and notes', () => {
    renderDetails(car)

    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('links to the maintenance sub-pages with the asset id', () => {
    renderDetails(drill)

    expect(
      screen.getByRole('link', { name: 'Maintenance records' }),
    ).toHaveAttribute('href', '/dashboard/asset-1/maintenance-records')
    expect(
      screen.getByRole('link', { name: 'Scheduled maintenance' }),
    ).toHaveAttribute('href', '/dashboard/asset-1/scheduled-maintenance')
  })
})
