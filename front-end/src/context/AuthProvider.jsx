import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api } from '../api'

/**
 * Keeps track of whether someone is logged in and provides log in / sign up / log out.
 *
 * The api remembers the session on this device, so a reload keeps you logged in.
 * Each function throws an Error with a user-friendly message if it fails
 * (e.g. "Incorrect password"), so pages can show it.
 *
 * After logOut() or deleteAccount() you don't need to navigate anywhere yourself: the route
 * guard in App.jsx sees `justLoggedOut` and takes the user to the Welcome screen.
 */
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => api.hasSession())
  const [justLoggedOut, setJustLoggedOut] = useState(false)

  const logIn = useCallback(async (credentials) => {
    const user = await api.logIn(credentials)
    setJustLoggedOut(false)
    setIsLoggedIn(true)
    return user
  }, [])

  const signUp = useCallback(async (details) => {
    const user = await api.signUp(details)
    setJustLoggedOut(false)
    setIsLoggedIn(true)
    return user
  }, [])

  const logOut = useCallback(async () => {
    await api.logOut()
    setJustLoggedOut(true)
    setIsLoggedIn(false)
  }, [])

  const deleteAccount = useCallback(async () => {
    await api.deleteAccount()
    setJustLoggedOut(true)
    setIsLoggedIn(false)
  }, [])

  const value = useMemo(
    () => ({ isLoggedIn, justLoggedOut, logIn, signUp, logOut, deleteAccount }),
    [isLoggedIn, justLoggedOut, logIn, signUp, logOut, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
