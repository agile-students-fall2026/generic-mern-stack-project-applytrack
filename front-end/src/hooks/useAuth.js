import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Read the login state and log in / sign up / log out.
 *
 * @example
 * const { isLoggedIn, logIn, signUp, logOut, deleteAccount } = useAuth()
 * await logIn({ email, password }) // throws an Error like "Incorrect password" if it fails
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
