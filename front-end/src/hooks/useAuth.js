import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Read the login state and log in / sign up / log out.
 *
 * @example
 * const { isLoggedIn, logIn, signUp, logOut } = useAuth()
 * await logIn({ email, password })
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
