import BuildIcon from '@mui/icons-material/Build'
import EventIcon from '@mui/icons-material/Event'
import Button from '@mui/material/Button'
import { Link } from 'react-router'
import type { Asset } from '../../../../types/asset.ts'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="whitespace-pre-wrap break-words">{value}</dd>
    </div>
  )
}

function AssetDetails({ asset }: { asset: Asset }) {
  return (
    <div className="flex flex-col gap-4 bg-gray-50 px-4 py-4 sm:px-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Detail label="Description" value={asset.description} />
        <Detail label="Category" value={asset.category} />
        <Detail label="Purchase date" value={asset.purchaseDate} />
        <Detail
          label="Purchase price"
          value={
            asset.purchasePrice === null ? '—' : asset.purchasePrice.toFixed(2)
          }
        />
        <div className="sm:col-span-2">
          <Detail label="Notes" value={asset.notes || '—'} />
        </div>
      </dl>
      <nav className="flex flex-wrap gap-3">
        <Button
          component={Link}
          to={`/dashboard/${asset.id}/maintenance-records`}
          variant="contained"
          startIcon={<BuildIcon />}
          className="normal-case"
        >
          Maintenance records
        </Button>
        <Button
          component={Link}
          to={`/dashboard/${asset.id}/scheduled-maintenance`}
          variant="outlined"
          startIcon={<EventIcon />}
          className="normal-case"
        >
          Scheduled maintenance
        </Button>
      </nav>
    </div>
  )
}

export default AssetDetails
