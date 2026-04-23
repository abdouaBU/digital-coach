'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from './supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface SessionUser {
  email: string
  name?: string
  id?: string
  onboardingComplete: boolean
}

interface AuthContextType {
  isLoggedIn: boolean
  user: SessionUser | null
  onboardingComplete: boolean
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  completeOnboarding: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          id: session.user.id,
          onboardingComplete: localStorage.getItem('onboardingComplete') === 'true'
        })
        setIsLoggedIn(true)
      }
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!,
            id: session.user.id,
            onboardingComplete: localStorage.getItem('onboardingComplete') === 'true'
          })
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('onboardingComplete')
  }, [])

  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboardingComplete: true } : null)
    localStorage.setItem('onboardingComplete', 'true')
  }, [])

  const value: AuthContextType = {
    isLoggedIn,
    user,
    onboardingComplete: user?.onboardingComplete || false,
    loginWithGoogle,
    logout,
    completeOnboarding,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
