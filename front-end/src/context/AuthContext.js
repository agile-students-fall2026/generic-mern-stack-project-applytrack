import { createContext } from 'react'

// Holds the logged-in user and login/logout functions.
// Use the useAuth() hook to read it; don't import this directly.
export const AuthContext = createContext(null)
