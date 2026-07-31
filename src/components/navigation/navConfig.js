import {
  Home,
  NotebookPen,
  Search,
  Settings2,
  SquarePen,
  UserRound,
  Camera,
  Users,
} from 'lucide-react'

export const desktopNavItems = [
  {
    key: 'home',
    label: 'Home',
    to: '/dashboard',
    icon: Home,
    match: (pathname) => pathname === '/dashboard' || pathname.startsWith('/books/'),
  },
  {
    key: 'community',
    label: 'Community',
    to: '/community?tab=Following',
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
]

export const mobileNavItems = [
  {
    key: 'community',
    label: 'Community',
    to: '/community?tab=Following',
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

export const sidebarFooterLinks = [
  {
    key: 'settings',
    label: 'Settings',
    to: '/edit-profile',
    icon: Settings2,
  },
]

export const sidebarAccentIcon = SquarePen
export const sidebarBrandIcon = NotebookPen
