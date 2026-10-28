import { NavLink } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import './BottomNav.css'

const TABS = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/applications', label: 'Dashboard', icon: 'briefcase' },
  { to: '/upcoming', label: 'Upcoming', icon: 'calendar' },
  { to: '/stats', label: 'Stats', icon: 'chart' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

/**
 * The 5-tab navigation bar at the bottom of the main screens.
 * It's added automatically by <TabLayout> in App.jsx; pages don't need to include it.
 */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <Icon name={tab.icon} size={22} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
