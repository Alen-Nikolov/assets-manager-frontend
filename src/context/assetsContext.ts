import { createContext, useContext } from 'react'
import type { Asset } from '../types/asset.ts'

export type AssetsStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AssetsContextValue {
  assets: Asset[]
  status: AssetsStatus
  /**
   * Fetches the assets from the backend. Does nothing if they are already
   * loaded or being loaded, so pages can call it whenever they mount.
   */
  loadAssets: () => void
  /** Adds an asset the backend just created, without refetching. */
  addAsset: (asset: Asset) => void
  getAsset: (id: string) => Asset | undefined
}

export const AssetsContext = createContext<AssetsContextValue | null>(null)

export function useAssets(): AssetsContextValue {
  const value = useContext(AssetsContext)
  if (!value) throw new Error('useAssets must be used inside <AssetsProvider>')
  return value
}
