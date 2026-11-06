import { vi } from 'vitest'

export function setScreen(size: 'desktop' | 'mobile') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: size === 'mobile',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}
