'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'

interface UserData {
  name: string
  email: string
  role: string
  status: string
}

interface PendingUser {
  uid: string
  name: string
  email: string
  role: string
  status: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
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
        if (userData.role !== 'admin') {
          router.push(`/dashboard/${userData.role}`)
          return
        }
        setUser(userData)
        
        // Fetch pending users
        const pendingQuery = query(collection(db, 'users'), where('status', '==', 'pending'))
        const pendingSnapshot = await getDocs(pendingQuery)
        const pending = pendingSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as PendingUser[]
        setPendingUsers(pending)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleApprove = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { status: 'approved' })
    setPendingUsers(prev => prev.filter(u => u.uid !== uid))
  }

  const handleReject = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { status: 'rejected' })
    setPendingUsers(prev => prev.filter(u => u.uid !== uid))
  }

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
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">Admin</span>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <div className="text-3xl font-bold text-indigo-600">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Events</h3>
            <div className="text-3xl font-bold text-green-600">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Clubs</h3>
            <div className="text-3xl font-bold text-purple-600">0</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
            <div className="text-3xl font-bold text-orange-600">{pendingUsers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending User Approvals</h2>
          
          {pendingUsers.length === 0 ? (
            <p className="text-gray-500">No pending approvals.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((pendingUser) => (
                    <tr key={pendingUser.uid} className="border-b">
                      <td className="py-3 px-4">{pendingUser.name}</td>
                      <td className="py-3 px-4">{pendingUser.email}</td>
                      <td className="py-3 px-4 capitalize">{pendingUser.role}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(pendingUser.uid)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(pendingUser.uid)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
