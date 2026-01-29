'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter, usePathname } from 'next/navigation'

export interface UserData {
  uid: string
  name: string
  email: string
  role: 'admin' | 'organizer' | 'student'
  status: 'pending' | 'approved' | 'rejected'
  clubId?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
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

const PUBLIC_PATHS = ['/', '/login', '/signup']
const ROLE_DASHBOARDS = {
  admin: '/dashboard/admin',
  organizer: '/dashboard/organizer',
  student: '/dashboard/student',
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)

      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data() as Omit<UserData, 'uid'>
            setUserData({
              uid: authUser.uid,
              ...data,
            })

            // Handle role-based routing
            if (PUBLIC_PATHS.includes(pathname)) {
              router.push(ROLE_DASHBOARDS[data.role] || '/dashboard/student')
            } else if (pathname.startsWith('/dashboard/')) {
              // Check if user is accessing correct dashboard
              const pathRole = pathname.split('/')[2]
              if (pathRole && pathRole !== data.role) {
                router.push(ROLE_DASHBOARDS[data.role] || '/dashboard/student')
              }
            }
          } else {
            // User doc doesn't exist, sign out
            await signOut(auth)
            setUserData(null)
            router.push('/login')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUserData(null)
        // Redirect to login if trying to access protected routes
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login')
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
