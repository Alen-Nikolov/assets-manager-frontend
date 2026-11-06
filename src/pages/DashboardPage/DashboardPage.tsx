import { useEffect, useState } from 'react'
import List from '@mui/material/List'
import AssetsLoadStatus from '../../components/AssetsLoadStatus/AssetsLoadStatus.tsx'
import { useAssets } from '../../context/assetsContext.ts'
import AssetRow from './components/AssetRow/AssetRow.tsx'

function DashboardPage() {
  const { assets, status, loadAssets } = useAssets()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  return (
    <>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <AssetsLoadStatus />
      {status === 'loaded' &&
        (assets.length === 0 ? (
          <p className="mt-4 text-gray-500">No assets yet.</p>
        ) : (
          <List className="mt-4 rounded border border-gray-200 !py-0">
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                expanded={expandedId === asset.id}
                onToggle={(toggled) =>
                  setExpandedId((current) =>
                    current === toggled.id ? null : toggled.id,
                  )
                }
              />
            ))}
          </List>
        ))}
    </>
  )
}

export default DashboardPage
