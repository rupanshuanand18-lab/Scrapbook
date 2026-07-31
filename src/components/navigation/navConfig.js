import {
  Home,
  NotebookPen,
  Camera,
  Users,
  UserRound,
  SquarePen,
} from 'lucide-react'

// Primary navigation items (shown in bottom nav on mobile)
export const primaryNavItems = [
  {
    key: 'community',
    label: 'Community',
    to: '/community',
    icon: Users,
    match: (pathname) => pathname === '/community',
  },
  {
    key: 'capture',
    label: 'Capture',
    to: '/capture',
    icon: Camera,
    match: (pathname) => pathname === '/capture',
    highlight: true,
  },
  {
    key: 'home',
    label: 'Home',
    to: '/dashboard',
    icon: Home,
    match: (pathname) => pathname === '/dashboard' || pathname.startsWith('/books/'),
  },
]

// Profile navigation item
export const profileNavItem = {
  key: 'profile',
  label: 'Profile',
  to: '/edit-profile',
  icon: UserRound,
  match: (pathname) => pathname === '/edit-profile',
}

// All navigation items for drawer/sidebar
export const allNavItems = [...primaryNavItems, profileNavItem]

// Desktop sidebar items (primary + profile + logout)
export const desktopNavItems = [...primaryNavItems, profileNavItem]

// Mobile bottom nav items (primary only)
export const mobileNavItems = primaryNavItems

export const sidebarAccentIcon = SquarePen
export const sidebarBrandIcon = NotebookPen