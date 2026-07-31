import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavItem from './NavItem'
import { desktopNavItems, sidebarAccentIcon, sidebarBrandIcon, sidebarFooterLinks } from './navConfig'

export default function DesktopSidebar({
  open,
  onToggle,
  onClose,
  onLogout,
  user,
  location,
}) {
  const BrandIcon = sidebarBrandIcon
  const AccentIcon = sidebarAccentIcon

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        className="fixed left-4 top-4 z-[70] hidden h-12 w-12 items-center justify-center rounded-2xl border border-beige/60 bg-paper/90 text-ink shadow-[0_10px_30px_rgba(44,40,37,0.12)] backdrop-blur-md transition-all hover:border-pink-accent/35 hover:text-pink-accent md:flex"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-50 hidden cursor-default bg-ink/18 backdrop-blur-[2px] md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Primary navigation"
              className="fixed left-0 top-0 z-[60] hidden h-full w-[18rem] max-w-[82vw] border-r border-beige/50 bg-paper/96 shadow-[18px_0_54px_rgba(44,40,37,0.18)] backdrop-blur-xl md:flex lg:w-[20rem]"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex h-full w-full flex-col px-5 py-5">
                <div className="flex items-start justify-between gap-4 pb-5">
                  <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-beige/70 bg-cream-dark/50 text-pink-accent shadow-sm">
                      <BrandIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">ScrapBook</p>
                      <h2 className="font-display text-2xl leading-none text-ink">Navigation</h2>
                    </div>
                  </Link>

                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-soft-pink/20 text-pink-accent">
                    <AccentIcon className="h-4 w-4" />
                  </span>
                </div>

                <div className="mb-5 h-px bg-beige/55" />

                <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                  {desktopNavItems.map((item) => {
                    const active = item.match(location.pathname, location.search)
                    return (
                      <NavItem
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        active={active}
                        onClick={onClose}
                        className={item.highlight ? 'mt-1 border border-pink-accent/15 bg-pink-accent/4' : ''}
                      />
                    )
                  })}
                </nav>

                <div className="mt-5 rounded-[28px] border border-beige/50 bg-paper-warm/70 p-4 shadow-[0_10px_28px_rgba(44,40,37,0.06)]">
                  {user ? (
                    <div className="space-y-4">
                      <Link
                        to="/edit-profile"
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-cream-dark/50"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-11 w-11 rounded-full border border-beige/60 object-cover shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink-muted">@{user.username}</p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2">
                        {sidebarFooterLinks.map((item) => {
                          const FooterIcon = item.icon
                          return (
                            <Link
                              key={item.key}
                              to={item.to}
                              onClick={onClose}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-beige/60 bg-paper px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-pink-accent/35 hover:text-ink"
                            >
                              <FooterIcon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          )
                        })}
                        <button
                          type="button"
                          onClick={onLogout}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-beige/60 bg-paper text-ink-muted transition-colors hover:border-pink-accent/35 hover:text-pink-accent"
                          aria-label="Sign out"
                          title="Sign out"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
