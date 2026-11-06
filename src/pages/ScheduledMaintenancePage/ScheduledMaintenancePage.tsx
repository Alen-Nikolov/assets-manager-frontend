import { Link, useParams } from 'react-router'
import { useAssets } from '../../context/assetsContext.ts'

function ScheduledMaintenancePage() {
  const { assetId = '' } = useParams()
  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  return (
    <>
      <Link to="/dashboard" className="text-blue-700 underline">
        ← Back to dashboard
      </Link>
      <h2 className="mt-2 text-2xl font-semibold">Scheduled maintenance</h2>
      {asset ? (
        <p className="mt-1 text-gray-600">
          {asset.name} (ID: {asset.id})
        </p>
      ) : (
        <p className="mt-1 text-gray-600">Asset not found (ID: {assetId})</p>
      )}
    </>
  )
}

export default ScheduledMaintenancePage
