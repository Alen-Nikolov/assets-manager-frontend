import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import {
  ASSET_CATEGORIES,
  type AssetCategory,
  type NewAsset,
} from '../../../../types/asset.ts'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp'
const PRICE_PATTERN = /^\d*\.?\d{0,2}$/

interface FormState {
  name: string
  description: string
  category: AssetCategory | ''
  purchaseDate: string
  purchasePrice: string
  notes: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  category: '',
  purchaseDate: '',
  purchasePrice: '',
  notes: '',
}

interface CreateAssetDialogProps {
  open: boolean
  onClose: () => void
  /** Resolve to close the dialog; reject to keep it open and show an error. */
  onSubmit: (asset: NewAsset) => Promise<void>
}

function CreateAssetDialog({ open, onClose, onSubmit }: CreateAssetDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm)

  // `url` is only a local preview; the file itself is what gets uploaded.
  const [image, setImage] = useState<{ file: File; url: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const reset = () => {
    if (image) URL.revokeObjectURL(image.url)
    setImage(null)
    setForm(emptyForm)
    setError(null)
  }

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('The image is too large (max 5 MB).')
      return
    }
    setError(null)
    if (image) URL.revokeObjectURL(image.url)
    setImage({ file, url: URL.createObjectURL(file) })
  }

  const handleClose = () => {
    if (!saving) onClose()
  }

  const set =
    (field: keyof FormState) =>
    (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.category === '' || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        purchaseDate: form.purchaseDate,
        purchasePrice:
          form.purchasePrice === '' ? null : Number(form.purchasePrice),
        notes: form.notes.trim(),
        image: image?.file ?? null,
      })
      onClose()
    } catch (submitError) {
      console.error(submitError)
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not create the asset.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      // Clicking the backdrop must not close the form; Escape, X and Cancel still do.
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') handleClose()
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: { onExited: reset },
        paper: { component: 'form', onSubmit: handleSubmit },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        Create asset
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          disabled={saving}
          edge="end"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4 !pt-2">
        <TextField
          label="Name"
          value={form.name}
          onChange={set('name')}
          required
          autoFocus
          fullWidth
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={set('description')}
          required
          fullWidth
        />
        <TextField
          select
          label="Category"
          value={form.category}
          onChange={set('category')}
          required
          fullWidth
        >
          {ASSET_CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          label="Purchase date"
          value={form.purchaseDate}
          onChange={set('purchaseDate')}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Purchase price (optional)"
          value={form.purchasePrice}
          onChange={(event) => {
            // Digits with an optional decimal point and up to 2 decimals.
            if (PRICE_PATTERN.test(event.target.value)) set('purchasePrice')(event)
          }}
          fullWidth
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        />
        <TextField
          label="Notes"
          value={form.notes}
          onChange={set('notes')}
          multiline
          minRows={3}
          fullWidth
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            className="normal-case"
            onClick={() => fileInput.current?.click()}
          >
            {image ? 'Change image' : 'Add image (optional)'}
          </Button>
          {image && (
            <>
              <img
                src={image.url}
                alt="Selected asset preview"
                className="h-12 w-12 rounded object-cover"
              />
              <span className="truncate text-sm text-gray-600">{image.file.name}</span>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_TYPES}
            hidden
            aria-label="Asset image"
            onChange={handleImage}
          />
        </div>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} disabled={saving} className="normal-case">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          className="normal-case"
        >
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateAssetDialog
