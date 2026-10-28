import { createContext } from 'react'

// Holds the current theme ("light" or "dark") and functions to change it.
// Use the useTheme() hook to read it; don't import this directly.
export const ThemeContext = createContext(null)
