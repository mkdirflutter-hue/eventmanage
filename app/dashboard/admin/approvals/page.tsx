'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore'

interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: any
}

interface EventRequest {
  id: string
  name: string
  club: string
  description: string
  date: string
  status: string
  requestedBy: string
  budget: number
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [pendingEvents, setPendingEvents] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingItems()
  }, [])

  const fetchPendingItems = async () => {
    try {
      // Fetch pending users
      const usersQuery = query(
        collection(db, 'users'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
      const usersSnapshot = await getDocs(usersQuery)
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingUser[]
      setPendingUsers(users)

      // Fetch pending events
      const eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventRequest[]
      setPendingEvents(events)
    } catch (error) {
      console.error('Error fetching pending items:', error)
      // Set mock data on error
      setPendingUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'organizer', status: 'pending', createdAt: new Date() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'organizer', status: 'pending', createdAt: new Date() },
      ])
      setPendingEvents([
        { id: '1', name: 'Tech Summit 2024', club: 'Tech Club', description: 'Annual tech conference', date: 'Mar 15', status: 'pending', requestedBy: 'Amit S.', budget: 5000 },
        { id: '2', name: 'Cultural Night', club: 'Drama Society', description: 'Annual cultural event', date: 'Apr 02', status: 'pending', requestedBy: 'Priya R.', budget: 3000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: action })
      fetchPendingItems()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleEventAction = async (eventId: string, action: 'approved' | 'rejected' | 'changes_requested') => {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: action })
      fetchPendingItems()
    } catch (error) {
      console.error('Error updating event status:', error)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{pendingUsers.length + pendingEvents.length} pending</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            User Signups ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'events'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Event Requests ({pendingEvents.length})
          </button>
        </div>

        {/* User Signups Tab */}
        {activeTab === 'users' && (
          <div className="bg-card rounded-xl border border-border">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending user signups</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'rejected')}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'approved')}
                        className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Requests Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {pendingEvents.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending event requests</p>
              </div>
            ) : (
              pendingEvents.map((event) => (
                <div key={event.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-lg">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">Club:</strong> {event.club}
                        </span>
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">Date:</strong> {event.date}
                        </span>
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">Budget:</strong> ${event.budget}
                        </span>
                        <span className="text-muted-foreground">
                          <strong className="text-foreground">By:</strong> {event.requestedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleEventAction(event.id, 'rejected')}
                      className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleEventAction(event.id, 'changes_requested')}
                      className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleEventAction(event.id, 'approved')}
                      className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
