import type { Asset } from '../types/asset.ts'

export const drill: Asset = {
  id: 'asset-1',
  name: 'Drill',
  description: 'Cordless drill',
  category: 'Tools',
  purchaseDate: '2024-03-15',
  purchasePrice: 49.9,
  notes: 'Keep battery charged',
  imageUrl: null,
}

export const car: Asset = {
  id: 'asset-2',
  name: 'Car',
  description: 'Family car',
  category: 'Vehicle',
  purchaseDate: '2022-06-01',
  purchasePrice: null,
  notes: '',
  imageUrl: '/api/assets/asset-2/image',
}
