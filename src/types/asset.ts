export const ASSET_CATEGORIES = [
  'Vehicle',
  'Appliance',
  'Garden',
  'Electronics',
  'Furniture',
  'Tools',
  'Other',
] as const

export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

/** What the create form produces. The image file is uploaded separately. */
export interface NewAsset {
  name: string
  description: string
  category: AssetCategory
  purchaseDate: string
  purchasePrice: number | null
  notes: string
  image: File | null
}

/** The JSON body of POST /api/assets (no image: it has its own endpoint). */
export type AssetPayload = Omit<NewAsset, 'image'>

/** A stored asset as returned by the backend. */
export interface Asset extends AssetPayload {
  id: string
  /** URL usable directly in <img src>, or null when the asset has no image. */
  imageUrl: string | null
}
