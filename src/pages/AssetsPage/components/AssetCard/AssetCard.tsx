import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import type { Asset } from '../../../../types/asset.ts'

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card>
      {asset.imageUrl ? (
        <>
          <CardMedia
            component="img"
            image={asset.imageUrl}
            alt={asset.name}
            className="h-40 object-cover"
          />
          <CardContent>
            <h3 className="truncate font-medium">{asset.name}</h3>
          </CardContent>
        </>
      ) : (
        <CardContent className="flex h-40 items-center justify-center bg-gray-100">
          <h3 className="break-words text-center text-lg font-medium">
            {asset.name}
          </h3>
        </CardContent>
      )}
    </Card>
  )
}

export default AssetCard
