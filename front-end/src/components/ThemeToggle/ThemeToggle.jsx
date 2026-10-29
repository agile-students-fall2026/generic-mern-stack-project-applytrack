import { useTheme } from '../../hooks/useTheme'
import { IconButton } from '../IconButton/IconButton'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { Switch } from '../Switch/Switch'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/**
 * Switches between light and dark themes. The choice is remembered on this device.
 *
 * @param variant  "icon" (bordered sun/moon button, default) | "segmented" (Light | Dark choice) |
 *                 "switch" (a labeled "Dark mode" on/off row)
 *
 * @example
 * <ThemeToggle />                     // icon button, e.g. in a page header `action`
 * <ThemeToggle variant="segmented" /> // Light | Dark, e.g. in Profile > Appearance
 */
export function ThemeToggle({ variant = 'icon' }) {
  const { theme, setTheme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'segmented') {
    return <SegmentedControl label="Theme" options={THEME_OPTIONS} value={theme} onChange={setTheme} />
  }

  if (variant === 'switch') {
    return <Switch label="Dark mode" checked={isDark} onChange={toggleTheme} />
  }

  // Shows what you'll switch TO: a moon in light mode, a sun in dark mode.
  return (
    <IconButton
      icon={isDark ? 'sun' : 'moon'}
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      variant="outline"
      onClick={toggleTheme}
    />
  )
}
