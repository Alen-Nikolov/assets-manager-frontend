import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { car, drill } from '../../../../test/sampleAssets.ts'
import type { Asset } from '../../../../types/asset.ts'
import AssetRow from './AssetRow.tsx'

function renderRow(asset: Asset, expanded = false, onToggle = vi.fn()) {
  render(
    <MemoryRouter>
      <ul>
        <AssetRow asset={asset} expanded={expanded} onToggle={onToggle} />
      </ul>
    </MemoryRouter>,
  )
  return onToggle
}

describe('AssetRow', () => {
  it('shows name, description and an initial when there is no image', () => {
    renderRow(drill)

    expect(screen.getByText('Drill')).toBeInTheDocument()
    expect(screen.getByText('Cordless drill')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('hides the details while collapsed', () => {
    renderRow(drill, false)

    expect(screen.getByRole('button', { name: 'Drill' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByText('Keep battery charged')).not.toBeInTheDocument()
  })

  it('shows the details under the row while expanded', () => {
    renderRow(drill, true)

    expect(screen.getByRole('button', { name: 'Drill' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Keep battery charged')).toBeInTheDocument()
  })

  it('calls onToggle with the asset when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = renderRow(car)

    await user.click(screen.getByRole('button', { name: 'Car' }))

    expect(onToggle).toHaveBeenCalledWith(car)
  })
})
