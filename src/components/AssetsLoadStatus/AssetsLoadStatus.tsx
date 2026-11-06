import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useAssets } from '../../context/assetsContext.ts'

/** Spinner while the assets load, an error with Retry if loading failed. */
function AssetsLoadStatus() {
  const { status, loadAssets } = useAssets()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="mt-6 flex justify-center">
        <CircularProgress aria-label="Loading assets" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert
        severity="error"
        className="mt-4"
        action={
          <Button color="inherit" size="small" onClick={loadAssets}>
            Retry
          </Button>
        }
      >
        Could not load assets.
      </Alert>
    )
  }

  return null
}

export default AssetsLoadStatus
