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
    key: 'explore',
    label: 'Explore',
    to: '/community?tab=Discover',
    icon: Search,
    match: (pathname, search) => pathname === '/community' && new URLSearchParams(search).get('tab') === 'Discover',
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
    key: 'profile',
    label: 'Profile',
    to: '/edit-profile',
    icon: UserRound,
    match: (pathname) => pathname === '/edit-profile',
  },
]

export const mobileNavItems = [
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
  {
    key: 'profile',
    label: 'Profile',
    to: '/edit-profile',
    icon: UserRound,
    match: (pathname) => pathname === '/edit-profile',
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
