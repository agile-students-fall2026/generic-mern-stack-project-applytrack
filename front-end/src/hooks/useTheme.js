import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

/**
 * Read and change the app theme.
 *
 * @example
 * const { theme, toggleTheme, setTheme } = useTheme()
 * // theme is "light" or "dark"
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
