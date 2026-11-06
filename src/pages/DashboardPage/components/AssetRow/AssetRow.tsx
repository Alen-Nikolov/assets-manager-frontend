import { useId } from 'react'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Avatar from '@mui/material/Avatar'
import Collapse from '@mui/material/Collapse'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Asset } from '../../../../types/asset.ts'
import AssetDetails from '../AssetDetails/AssetDetails.tsx'

interface AssetRowProps {
  asset: Asset
  expanded: boolean
  onToggle: (asset: Asset) => void
}

function AssetRow({ asset, expanded, onToggle }: AssetRowProps) {
  const detailsId = useId()

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      <ListItemButton
        onClick={() => onToggle(asset)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        aria-label={asset.name}
      >
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            src={asset.imageUrl ?? undefined}
            alt={asset.imageUrl ? asset.name : undefined}
          >
            {asset.name.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={asset.name}
          secondary={asset.description}
          slotProps={{ secondary: { noWrap: true } }}
        />
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>
      <div id={detailsId}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <AssetDetails asset={asset} />
        </Collapse>
      </div>
    </li>
  )
}

export default AssetRow
