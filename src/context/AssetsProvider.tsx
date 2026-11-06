import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { fetchAssets } from '../api/assetsApi.ts'
import type { Asset } from '../types/asset.ts'
import { AssetsContext, type AssetsStatus } from './assetsContext.ts'

/**
 * Holds the assets for the whole app. They are fetched once and reused by every
 * page; creating an asset adds it to this list instead of refetching.
 */
export function AssetsProvider({
  children,
  initialAssets,
}: {
  children: ReactNode
  /** Preloaded assets (tests); the backend is not called when given. */
  initialAssets?: Asset[]
}) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets ?? [])
  const [status, setStatus] = useState<AssetsStatus>(
    initialAssets ? 'loaded' : 'idle',
  )
  // Refs so concurrent callers (StrictMode, two pages) share one request.
  const loaded = useRef(initialAssets !== undefined)
  const inFlight = useRef(false)

  const loadAssets = useCallback(() => {
    if (loaded.current || inFlight.current) return
    inFlight.current = true
    setStatus('loading')
    fetchAssets()
      .then((fetched) => {
        // Keep anything created while the request was running.
        setAssets((current) => {
          const ids = new Set(fetched.map((asset) => asset.id))
          return [...fetched, ...current.filter((asset) => !ids.has(asset.id))]
        })
        loaded.current = true
        setStatus('loaded')
      })
      .catch((error: unknown) => {
        console.error(error)
        setStatus('error')
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [])

  const value = useMemo(
    () => ({
      assets,
      status,
      loadAssets,
      addAsset: (asset: Asset) => setAssets((current) => [...current, asset]),
      getAsset: (id: string) => assets.find((asset) => asset.id === id),
    }),
    [assets, status, loadAssets],
  )

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
}
