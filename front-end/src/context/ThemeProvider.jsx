import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

const STORAGE_KEY = 'applytrack-theme'

// The theme is already applied to <html> by a small script in index.html before React loads,
// so we start from whatever it set.
function getInitialTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * Provides the light/dark theme to the whole app and remembers the user's choice.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // storage can be unavailable (e.g. private browsing); the theme still works for this visit
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
