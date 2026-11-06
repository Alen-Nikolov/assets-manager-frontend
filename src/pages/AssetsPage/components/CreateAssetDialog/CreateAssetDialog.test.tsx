import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CreateAssetDialog from './CreateAssetDialog.tsx'

function setup() {
  const onClose = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const user = userEvent.setup()
  render(<CreateAssetDialog open onClose={onClose} onSubmit={onSubmit} />)
  return { user, onClose, onSubmit }
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Name/), '  Drill ')
  await user.type(screen.getByLabelText(/^Description/), 'Cordless')
  await user.click(screen.getByRole('combobox', { name: /Category/ }))
  await user.click(screen.getByRole('option', { name: 'Tools' }))
  await user.type(screen.getByLabelText(/^Purchase date/), '2024-03-15')
}

describe('CreateAssetDialog', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('offers all fields', () => {
    setup()

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Category/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Purchase date/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Purchase price/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Notes/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add image (optional)' }),
    ).toBeInTheDocument()
  })

  it('does not submit while required fields are empty', async () => {
    const { user, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed values, with null price and image when left empty', async () => {
    const { user, onSubmit, onClose } = setup()
    await fillRequired(user)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Drill',
      description: 'Cordless',
      category: 'Tools',
      purchaseDate: '2024-03-15',
      purchasePrice: null,
      notes: '',
      image: null,
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('submits the price as a number and the chosen image file', async () => {
    const { user, onSubmit } = setup()
    await fillRequired(user)
    await user.type(screen.getByLabelText(/^Purchase price/), '49.90')
    const file = new File(['x'], 'drill.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Asset image'), file)

    expect(screen.getByText('drill.png')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Change image' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ purchasePrice: 49.9, image: file }),
    )
  })

  it('accepts only digits and a decimal point in the purchase price', async () => {
    const { user } = setup()
    const price = screen.getByLabelText(/^Purchase price/)

    await user.type(price, 'ab1e-2+x.5.y z')

    expect(price).toHaveValue('12.5')
  })

  it('limits the purchase price to two decimals', async () => {
    const { user } = setup()
    const price = screen.getByLabelText(/^Purchase price/)

    await user.type(price, '10.999')

    expect(price).toHaveValue('10.99')
  })

  it('rejects images over 5 MB without selecting them', async () => {
    const { user } = setup()
    const big = new File(['x'], 'big.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: 5 * 1024 * 1024 + 1 })

    await user.upload(screen.getByLabelText('Asset image'), big)

    expect(screen.getByText(/too large/)).toBeInTheDocument()
    expect(screen.queryByText('big.png')).not.toBeInTheDocument()
  })

  it('stays open and shows the error when saving fails', async () => {
    const { user, onClose, onSubmit } = setup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    onSubmit.mockRejectedValueOnce(
      new Error('Failed to create the asset (HTTP 500)'),
    )
    await fillRequired(user)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
  })

  it('disables the buttons while saving', async () => {
    const { user, onSubmit } = setup()
    onSubmit.mockReturnValue(new Promise(() => {}))
    await fillRequired(user)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('closes with the X button', async () => {
    const { user, onClose, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not close when clicking outside the popup', async () => {
    const { user, onClose } = setup()

    await user.click(document.querySelector('.MuiBackdrop-root')!)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('still closes with the Escape key', async () => {
    const { user, onClose } = setup()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('closes without submitting on cancel', async () => {
    const { user, onClose, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
