import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { setScreen } from '../../test/setScreen.ts'
import Header from './Header.tsx'

describe('Header', () => {
  it('shows the app name, search and create button on desktop', () => {
    setScreen('desktop')
    render(<Header />)

    expect(
      screen.getByRole('heading', { name: 'Assets Manager' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Create' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open menu' }),
    ).not.toBeInTheDocument()
  })

  it('hides search and create behind the hamburger on mobile', () => {
    setScreen('mobile')
    render(<Header />)

    expect(
      screen.getByRole('heading', { name: 'Assets Manager' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '+ Create' }),
    ).not.toBeInTheDocument()
  })

  it('opens and closes the mobile menu', async () => {
    setScreen('mobile')
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Create' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Close menu' }))

    await waitFor(() => {
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })
  })

  it('keeps the search text when the mobile menu is reopened', async () => {
    setScreen('mobile')
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.type(screen.getByRole('searchbox'), 'laptop')
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    await waitFor(() => {
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('searchbox')).toHaveValue('laptop')
  })
})
