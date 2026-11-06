import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import {
  assetImageUrl,
  createAsset,
  uploadAssetImage,
} from '../../api/assetsApi.ts'
import AssetsLoadStatus from '../../components/AssetsLoadStatus/AssetsLoadStatus.tsx'
import { useAssets } from '../../context/assetsContext.ts'
import type { NewAsset } from '../../types/asset.ts'
import AssetCard from './components/AssetCard/AssetCard.tsx'
import CreateAssetDialog from './components/CreateAssetDialog/CreateAssetDialog.tsx'

function AssetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const { assets, loadAssets, addAsset } = useAssets()

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  // Step 1: create the asset (JSON). Step 2: upload its image to the new id.
  // If step 1 fails the error propagates and the dialog stays open.
  const handleCreate = async ({ image, ...payload }: NewAsset) => {
    const created = await createAsset(payload)
    let imageUrl = created.imageUrl
    if (image) {
      try {
        await uploadAssetImage(created.id, image)
        imageUrl = assetImageUrl(created.id)
      } catch (error) {
        console.error(error)
        setNotice('The asset was created, but its image could not be uploaded.')
      }
    }
    addAsset({ ...created, imageUrl })
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">Assets</h2>
      <AssetsLoadStatus />
      {assets.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
      <Button
        variant="contained"
        size="large"
        className="mt-6 px-8 py-3 text-base normal-case"
        onClick={() => setDialogOpen(true)}
      >
        + Create
      </Button>
      <CreateAssetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />
      <Snackbar
        open={notice !== null}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
      >
        <Alert severity="warning" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AssetsPage
