import { useTheme } from '../../hooks/useTheme'
import { IconButton } from '../IconButton/IconButton'
import { Switch } from '../Switch/Switch'

/**
 * Switches between light and dark themes. The choice is remembered on this device.
 *
 * @param variant  "icon" (sun/moon button, default) | "switch" (a labeled on/off row, e.g. for Profile)
 *
 * @example
 * <ThemeToggle />                  // icon button, e.g. in a page header `action`
 * <ThemeToggle variant="switch" /> // "Dark mode" on/off switch
 */
export function ThemeToggle({ variant = 'icon' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'switch') {
    return <Switch label="Dark mode" checked={isDark} onChange={toggleTheme} />
  }

  return (
    <IconButton
      icon={isDark ? 'sun' : 'moon'}
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  )
}
