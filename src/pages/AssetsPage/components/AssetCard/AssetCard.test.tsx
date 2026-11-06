import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AssetCard from './AssetCard.tsx'
import type { Asset } from '../../../../types/asset.ts'

const asset: Asset = {
  id: 'a1',
  name: 'Lawn mower',
  description: 'Petrol mower',
  category: 'Garden',
  purchaseDate: '2024-05-01',
  purchasePrice: null,
  notes: '',
  imageUrl: null,
}

describe('AssetCard', () => {
  it('shows only the name when there is no image', () => {
    render(<AssetCard asset={asset} />)

    expect(
      screen.getByRole('heading', { name: 'Lawn mower' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the image and the name when there is an image', () => {
    render(<AssetCard asset={{ ...asset, imageUrl: '/api/assets/a1/image' }} />)

    expect(screen.getByRole('img', { name: 'Lawn mower' })).toHaveAttribute(
      'src',
      '/api/assets/a1/image',
    )
    expect(
      screen.getByRole('heading', { name: 'Lawn mower' }),
    ).toBeInTheDocument()
  })
})
