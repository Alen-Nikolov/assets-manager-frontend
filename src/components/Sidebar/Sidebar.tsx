import { useState } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NavLink } from 'react-router'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/assets', label: 'Assets', icon: <Inventory2Icon /> },
]

const widthTransition =
  'transition-[width] duration-300 ease-in-out motion-reduce:transition-none'

function Sidebar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true })
  const [open, setOpen] = useState(!isMobile)

  // The outer element reserves space in the layout. On mobile it stays at strip
  // width, so the open sidebar slides over the page instead of squeezing it.
  return (
    <div
      className={`relative shrink-0 ${widthTransition} ${
        open && !isMobile ? 'w-60' : 'w-16'
      }`}
    >
      <aside
        className={`absolute inset-y-0 left-0 z-10 overflow-hidden border-r border-gray-200 bg-white ${widthTransition} ${
          open ? 'w-60' : 'w-16'
        }`}
      >
        <div className="flex justify-end px-3 py-2">
          <IconButton
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={open}
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1 px-2">
            {links.map(({ to, label, icon }) => (
              <Tooltip
                key={to}
                title={open ? '' : label}
                placement="right"
                describeChild
              >
                <li>
                  <NavLink
                    to={to}
                    onClick={() => {
                      if (isMobile) setOpen(false)
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-4 rounded-md px-3 py-2.5 whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-blue-50 font-medium text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <span className="flex shrink-0">{icon}</span>
                    <span
                      className={`transition-opacity duration-300 motion-reduce:transition-none ${
                        open ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {label}
                    </span>
                  </NavLink>
                </li>
              </Tooltip>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  )
}

export default Sidebar
