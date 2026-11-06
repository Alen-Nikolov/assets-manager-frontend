import { useId, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true })
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuId = useId()

  const controls = (
    <>
      <TextField
        type="search"
        size="small"
        placeholder="Search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        fullWidth={isMobile}
        className={isMobile ? undefined : 'w-72'}
        slotProps={{
          htmlInput: { 'aria-label': 'Search' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Button
        variant="contained"
        fullWidth={isMobile}
        className="shrink-0 normal-case"
      >
        + Create
      </Button>
    </>
  )

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <h1 className="text-2xl font-bold min-[360px]:text-3xl sm:text-4xl">Assets Manager</h1>
        {isMobile ? (
          <IconButton
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        ) : (
          <div className="flex items-center gap-3">{controls}</div>
        )}
      </div>
      {isMobile && (
        <div id={menuId}>
          <Collapse in={menuOpen} unmountOnExit>
            <div className="flex flex-col gap-3 px-4 pb-4 sm:px-8">
              {controls}
            </div>
          </Collapse>
        </div>
      )}
    </header>
  )
}

export default Header
