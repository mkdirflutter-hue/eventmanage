'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { useRouter, usePathname } from 'next/navigation'

// SHA-256 hash function for password comparison
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export interface UserData {
  uid: string
  name: string
  email: string
  role: 'admin' | 'organizer' | 'student'
  status: 'pending' | 'approved' | 'rejected'
  clubId?: string
  createdAt?: number
}

interface AuthContextType {
  userData: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const PUBLIC_PATHS = ['/', '/login', '/register']
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/dashboard/admin',
  organizer: '/dashboard/organizer',
  student: '/dashboard/student',
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('eventapp_user')
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserData
          // Verify user still exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', parsedUser.uid))
          
          if (userDoc.exists()) {
            const freshData = userDoc.data()
            const updatedUser: UserData = {
              uid: freshData.uid || userDoc.id,
              name: freshData.name || '',
              email: freshData.email || '',
              role: freshData.role || 'student',
              status: freshData.status || 'pending',
              clubId: freshData.clubId,
              createdAt: freshData.createdAt,
            }
            setUserData(updatedUser)
            localStorage.setItem('eventapp_user', JSON.stringify(updatedUser))
          } else {
            // User no longer exists, clear session
            localStorage.removeItem('eventapp_user')
            setUserData(null)
          }
        } catch (error) {
          console.error('Error checking session:', error)
          localStorage.removeItem('eventapp_user')
          setUserData(null)
        }
      }
      
      setLoading(false)
    }

    checkSession()
  }, [])

  // Handle route protection
  useEffect(() => {
    if (loading) return

    const isPublicPath = PUBLIC_PATHS.includes(pathname)
    
    if (!userData && !isPublicPath) {
      router.push('/login')
    } else if (userData && isPublicPath && pathname !== '/') {
      router.push(ROLE_DASHBOARDS[userData.role] || '/dashboard/student')
    }
  }, [userData, loading, pathname, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Query Firestore users collection by email
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email.toLowerCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return { success: false, error: 'No account found with this email.' }
      }

      const userDoc = querySnapshot.docs[0]
      const data = userDoc.data()

      // Hash the input password and compare with stored passwordHash
      const hashedPassword = await hashPassword(password)
      if (data.passwordHash !== hashedPassword) {
        return { success: false, error: 'Incorrect password.' }
      }

      // Check status
      if (data.status === 'pending') {
        return { success: false, error: 'Your account is pending approval. Please wait for admin approval.' }
      }

      if (data.status === 'rejected') {
        return { success: false, error: 'Your account has been rejected. Please contact support.' }
      }

      // Create user data
      const loggedInUser: UserData = {
        uid: data.uid || userDoc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'student',
        status: data.status || 'approved',
        clubId: data.clubId,
        createdAt: data.createdAt,
      }

      // Store in localStorage and state
      localStorage.setItem('eventapp_user', JSON.stringify(loggedInUser))
      setUserData(loggedInUser)

      // Redirect to appropriate dashboard
      router.push(ROLE_DASHBOARDS[loggedInUser.role] || '/dashboard/student')

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('eventapp_user')
    setUserData(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    if (!userData) return

    try {
      // Query by uid field since document ID might differ
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('uid', '==', userData.uid))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        const freshData = userDoc.data()
        const updatedUser: UserData = {
          uid: freshData.uid || userDoc.id,
          name: freshData.name || '',
          email: freshData.email || '',
          role: freshData.role || 'student',
          status: freshData.status || 'pending',
          clubId: freshData.clubId,
          createdAt: freshData.createdAt,
        }
        setUserData(updatedUser)
        localStorage.setItem('eventapp_user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ userData, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
