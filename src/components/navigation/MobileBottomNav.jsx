import NavItem from './NavItem'
import CaptureButton from './CaptureButton'
import { mobileNavItems } from './navConfig'

export default function MobileBottomNav({ location, onNavigate }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] md:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-paper via-paper/95 to-transparent" />

      <nav
        aria-label="Primary navigation"
        className="relative mx-auto flex max-w-2xl items-end justify-between gap-1 border-t border-beige/55 bg-paper/92 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(44,40,37,0.08)] backdrop-blur-xl"
      >
        {/* First nav item (Community) */}
        {mobileNavItems.slice(0, 1).map((item) => {
          const active = item.match(location.pathname, location.search)
          return (
            <div key={item.key} className="flex flex-1 justify-center">
              <NavItem
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={active}
                compact
                onClick={onNavigate}
                className="min-h-14 flex-1 justify-center px-2 py-2 text-[11px]"
              />
            </div>
          )
        })}

        {/* Capture button (center) */}
        <div className="flex w-20 flex-none items-start justify-center">
          <CaptureButton
            active={location.pathname === '/capture'}
            onClick={onNavigate}
          />
        </div>

        {/* Last nav item (Home) */}
        {mobileNavItems.slice(2).map((item) => {
          const active = item.match(location.pathname, location.search)
          return (
            <div key={item.key} className="flex flex-1 justify-center">
              <NavItem
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={active}
                compact
                onClick={onNavigate}
                className="min-h-14 flex-1 justify-center px-2 py-2 text-[11px]"
              />
            </div>
          )
        })}
      </nav>
    </div>
  )
}