import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { setScreen } from '../../test/setScreen.ts'
import Sidebar from './Sidebar.tsx'

function renderSidebar(route = '/dashboard') {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('starts open on desktop with a link to each page', () => {
    setScreen('desktop')
    renderSidebar()

    expect(
      screen.getByRole('button', { name: 'Collapse sidebar' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    expect(screen.getByRole('link', { name: 'Assets' })).toHaveAttribute(
      'href',
      '/assets',
    )
  })

  it('starts collapsed on mobile', () => {
    setScreen('mobile')
    renderSidebar()

    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('collapses and expands, keeping the links available', async () => {
    setScreen('desktop')
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))

    expect(screen.getByRole('complementary')).toHaveClass('w-16')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Assets' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))

    expect(screen.getByRole('complementary')).toHaveClass('w-60')
  })

  it('closes after choosing a link on mobile', async () => {
    setScreen('mobile')
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    await user.click(screen.getByRole('link', { name: 'Assets' }))

    expect(screen.getByRole('complementary')).toHaveClass('w-16')
  })

  it('stays open after choosing a link on desktop', async () => {
    setScreen('desktop')
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('link', { name: 'Assets' }))

    expect(screen.getByRole('complementary')).toHaveClass('w-60')
  })

  it('marks the link for the current page', () => {
    setScreen('desktop')
    renderSidebar('/assets')

    expect(screen.getByRole('link', { name: 'Assets' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
