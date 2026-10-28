import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api } from '../api'

const STORAGE_KEY = 'applytrack-logged-in'

function readLoggedIn() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeLoggedIn(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, 'true')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

/**
 * Sprint 1 placeholder authentication.
 *
 * Login, sign-up and logout don't check anything yet: they just flip a "logged in" flag
 * (remembered across reloads) so the screens can be demoed. Real authentication arrives
 * with the back-end, and only the api calls below will need to change.
 */
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(readLoggedIn)

  const logIn = useCallback(async (credentials) => {
    await api.logIn(credentials)
    writeLoggedIn(true)
    setIsLoggedIn(true)
  }, [])

  const signUp = useCallback(async (details) => {
    await api.signUp(details)
    writeLoggedIn(true)
    setIsLoggedIn(true)
  }, [])

  const logOut = useCallback(async () => {
    await api.logOut()
    writeLoggedIn(false)
    setIsLoggedIn(false)
  }, [])

  const value = useMemo(
    () => ({ isLoggedIn, logIn, signUp, logOut }),
    [isLoggedIn, logIn, signUp, logOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
