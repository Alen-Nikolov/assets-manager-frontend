import { createTheme } from '@mui/material/styles'

// The font is defined once, as --font-sans in index.css.
export const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-sans)',
  },
})
