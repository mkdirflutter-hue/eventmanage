'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface UserData {
  name: string
  email: string
  role: string
  status: string
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', authUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        if (userData.role !== 'student') {
          router.push(`/dashboard/${userData.role}`)
          return
        }
        setUser(userData)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Events</h3>
            <p className="text-gray-600 mb-4">View and register for upcoming campus events</p>
            <div className="text-3xl font-bold text-indigo-600">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Registered Events</h3>
            <p className="text-gray-600 mb-4">Events you've signed up for</p>
            <div className="text-3xl font-bold text-green-600">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Clubs</h3>
            <p className="text-gray-600 mb-4">Clubs you're a member of</p>
            <div className="text-3xl font-bold text-purple-600">0</div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
      </main>
    </div>
  )
}
