'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import StatCard from '@/components/common/StatCard'
import SmallChart from '@/components/common/SmallChart'
import { Building2, Users, Calendar, DollarSign, CheckCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore'

interface EventRequest {
  id: string
  name: string
  club: string
  date: string
  status: string
  requestedBy: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: 'Total Clubs', value: 0, delta: '+0 this month', icon: Building2, color: '#3b82f6' },
    { title: 'Pending Signups', value: 0, delta: 'Awaiting approval', icon: Users, color: '#ef4444' },
    { title: 'Event Requests', value: 0, delta: 'Pending review', icon: Calendar, color: '#f59e0b' },
    { title: 'Budget Left', value: '$0', delta: 'This semester', icon: DollarSign, color: '#10b981' },
  ])
  const [recentEvents, setRecentEvents] = useState<EventRequest[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch clubs count
      const clubsSnapshot = await getDocs(collection(db, 'clubs'))
      const clubsCount = clubsSnapshot.size

      // Fetch pending user signups
      const pendingUsersQuery = query(collection(db, 'users'), where('status', '==', 'pending'))
      const pendingUsersSnapshot = await getDocs(pendingUsersQuery)
      const pendingCount = pendingUsersSnapshot.size

      // Fetch event requests
      const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(10))
      const eventsSnapshot = await getDocs(eventsQuery)
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventRequest[]

      const pendingEvents = events.filter((e) => e.status === 'pending')

      setStats([
        { title: 'Total Clubs', value: clubsCount, delta: '+3 this month', icon: Building2, color: '#3b82f6' },
        { title: 'Pending Signups', value: pendingCount, delta: 'Awaiting approval', icon: Users, color: '#ef4444' },
        { title: 'Event Requests', value: pendingEvents.length, delta: 'Pending review', icon: Calendar, color: '#f59e0b' },
        { title: 'Budget Left', value: '$8,400', delta: 'This semester', icon: DollarSign, color: '#10b981' },
      ])

      setRecentEvents(events.slice(0, 5))
      setPendingApprovals(pendingEvents)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data on error
      setStats([
        { title: 'Total Clubs', value: 24, delta: '+3 this month', icon: Building2, color: '#3b82f6' },
        { title: 'Pending Signups', value: 7, delta: 'Awaiting approval', icon: Users, color: '#ef4444' },
        { title: 'Event Requests', value: 12, delta: 'Pending review', icon: Calendar, color: '#f59e0b' },
        { title: 'Budget Left', value: '$8,400', delta: 'This semester', icon: DollarSign, color: '#10b981' },
      ])
      setRecentEvents([
        { id: '1', name: 'Inter-College Fest', club: 'Drama Society', date: 'Feb 14', status: 'pending', requestedBy: 'Priya R.' },
        { id: '2', name: 'Guest Lecture', club: 'Tech Club', date: 'Mar 02', status: 'approved', requestedBy: 'Amit S.' },
        { id: '3', name: 'Blood Donation', club: 'Health Club', date: 'Mar 22', status: 'changes_requested', requestedBy: 'Sara M.' },
      ])
      setPendingApprovals([
        { id: '1', name: 'Inter-College Fest', club: 'Drama Society', date: 'Feb 14', status: 'pending', requestedBy: 'Priya R.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: 'approved' })
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving event:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-500'
      case 'pending':
        return 'text-amber-500'
      case 'rejected':
      case 'changes_requested':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'pending':
        return 'Pending'
      case 'rejected':
        return 'Rejected'
      case 'changes_requested':
        return 'Changes Requested'
      default:
        return status
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-3">
            <a
              href="/dashboard/admin/clubs"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              New Club
            </a>
            <a
              href="/dashboard/admin/approvals"
              className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Approve Signups
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Charts and Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Activity Overview</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  7d
                </button>
                <button className="px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground">
                  30d
                </button>
              </div>
            </div>
            <SmallChart data={[5, 8, 6, 10, 9, 12, 8, 14, 11, 16, 13, 18]} />
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Recent Events</h2>
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent events</p>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.club} - {event.date}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Approvals Table */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Pending Approvals</h2>
          {pendingApprovals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending approvals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Request</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Club</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested By</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((event) => (
                    <tr key={event.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm text-foreground">{event.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{event.club}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{event.date}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{event.requestedBy}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            Suggest Changes
                          </button>
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
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
      </div>
    </DashboardLayout>
  )
}
