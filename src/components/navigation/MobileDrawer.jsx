import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavItem from './NavItem'
import { allNavItems } from './navConfig'

export default function MobileDrawer({
    open,
    onClose,
    onLogout,
    user,
    location,
    onNavigate,
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-[80] bg-ink/18 backdrop-blur-[2px] md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                        className="fixed right-0 top-0 z-[90] h-full w-[18rem] max-w-[82vw] border-l border-beige/50 bg-paper/96 shadow-[-18px_0_54px_rgba(44,40,37,0.18)] backdrop-blur-xl md:hidden"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    >
                        <div className="flex h-full flex-col px-5 py-5">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4">
                                <span className="text-sm font-semibold text-ink">Menu</span>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-beige/60 bg-paper text-ink-muted transition-colors hover:border-pink-accent/35 hover:text-ink"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-4 h-px bg-beige/55" />

                            {/* User Profile */}
                            {user && (
                                <Link
                                    to="/edit-profile"
                                    onClick={onClose}
                                    className="mb-4 flex items-center gap-3 rounded-2xl border border-beige/50 bg-cream-dark/30 p-3 transition-colors hover:bg-cream-dark/50"
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-12 w-12 rounded-full border border-beige/60 object-cover shadow-sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-ink">{user.name}</p>
                                        <p className="truncate text-xs text-ink-muted">@{user.username}</p>
                                    </div>
                                </Link>
                            )}

                            <div className="mb-4 h-px bg-beige/55" />

                            {/* Navigation Items */}
                            <nav className="flex-1 space-y-1 overflow-y-auto py-2">
                                {allNavItems.map((item) => {
                                    const active = item.match(location.pathname, location.search)
                                    return (
                                        <NavItem
                                            key={item.key}
                                            icon={item.icon}
                                            label={item.label}
                                            to={item.to}
                                            active={active}
                                            onClick={onNavigate}
                                            className={item.highlight ? 'border border-pink-accent/15 bg-pink-accent/4' : ''}
                                        />
                                    )
                                })}
                            </nav>

                            {/* Logout */}
                            <div className="mt-auto pt-4">
                                <div className="h-px bg-beige/55 mb-4" />
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-pink-accent/8 hover:text-pink-accent"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}