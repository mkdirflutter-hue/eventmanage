'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'organizer' | 'student'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect if not authenticated or wrong role
  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to continue</p>
          <a href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Check role access
  if (userData.role !== role) {
    router.push(`/dashboard/${userData.role}`)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if user is approved (except for admin who might not need approval)
  if (userData.status !== 'approved' && userData.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-4">
            Your account is awaiting admin approval. You'll be notified once it's approved.
          </p>
          <a href="/login" className="px-4 py-2 bg-muted text-foreground rounded-lg inline-block">
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setCollapsed((s) => !s)} userName={userData.name} />
      <div className="flex">
        <Sidebar collapsed={collapsed} role={role} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
