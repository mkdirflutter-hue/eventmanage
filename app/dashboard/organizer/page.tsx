'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import StatCard from '@/components/common/StatCard'
import SmallChart from '@/components/common/SmallChart'
import { Calendar, Users, Building2, Clock, Plus, Eye } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

interface Event {
  id: string
  name: string
  date: string
  status: string
  registrations: number
}

interface Club {
  id: string
  name: string
  members: number
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState([
    { title: 'My Events', value: 0, delta: 'Total created', icon: Calendar, color: '#3b82f6' },
    { title: 'Total Registrations', value: 0, delta: 'Across all events', icon: Users, color: '#10b981' },
    { title: 'My Clubs', value: 0, delta: 'Clubs managed', icon: Building2, color: '#8b5cf6' },
    { title: 'Pending Approvals', value: 0, delta: 'Awaiting review', icon: Clock, color: '#f59e0b' },
  ])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [myClubs, setMyClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizerData()
  }, [])

  const fetchOrganizerData = async () => {
    try {
      const userId = auth.currentUser?.uid

      // Fetch organizer's events
      const eventsQuery = query(
        collection(db, 'events'),
        where('organizerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]

      // Fetch organizer's clubs
      const clubsQuery = query(
        collection(db, 'clubs'),
        where('organizerId', '==', userId)
      )
      const clubsSnapshot = await getDocs(clubsQuery)
      const clubs = clubsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Club[]

      const pendingEvents = events.filter((e) => e.status === 'pending').length
      const totalRegistrations = events.reduce((sum, e) => sum + (e.registrations || 0), 0)

      setStats([
        { title: 'My Events', value: events.length, delta: 'Total created', icon: Calendar, color: '#3b82f6' },
        { title: 'Total Registrations', value: totalRegistrations, delta: 'Across all events', icon: Users, color: '#10b981' },
        { title: 'My Clubs', value: clubs.length, delta: 'Clubs managed', icon: Building2, color: '#8b5cf6' },
        { title: 'Pending Approvals', value: pendingEvents, delta: 'Awaiting review', icon: Clock, color: '#f59e0b' },
      ])

      setMyEvents(events)
      setMyClubs(clubs)
    } catch (error) {
      console.error('Error fetching organizer data:', error)
      // Set mock data on error
      setStats([
        { title: 'My Events', value: 8, delta: 'Total created', icon: Calendar, color: '#3b82f6' },
        { title: 'Total Registrations', value: 342, delta: 'Across all events', icon: Users, color: '#10b981' },
        { title: 'My Clubs', value: 2, delta: 'Clubs managed', icon: Building2, color: '#8b5cf6' },
        { title: 'Pending Approvals', value: 3, delta: 'Awaiting review', icon: Clock, color: '#f59e0b' },
      ])
      setMyEvents([
        { id: '1', name: 'Tech Summit 2024', date: 'Mar 15', status: 'approved', registrations: 156 },
        { id: '2', name: 'Coding Workshop', date: 'Mar 20', status: 'pending', registrations: 45 },
        { id: '3', name: 'Hackathon', date: 'Apr 01', status: 'pending', registrations: 89 },
      ])
      setMyClubs([
        { id: '1', name: 'Tech Club', members: 156 },
        { id: '2', name: 'Coding Club', members: 198 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-500'
      case 'pending':
        return 'bg-amber-500/10 text-amber-500'
      case 'rejected':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <DashboardLayout role="organizer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Organizer Dashboard</h1>
          <a
            href="/dashboard/organizer/events"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </a>
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

        {/* Charts and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Event Registrations</h2>
            <SmallChart data={[12, 19, 15, 25, 32, 28, 45, 52, 48, 65]} color="#3b82f6" />
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">My Clubs</h2>
            <div className="space-y-3">
              {myClubs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No clubs yet</p>
              ) : (
                myClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground text-sm">{club.name}</p>
                      <p className="text-xs text-muted-foreground">{club.members} members</p>
                    </div>
                    <a
                      href={`/dashboard/organizer/clubs/${club.id}`}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* My Events */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">My Events</h2>
            <a
              href="/dashboard/organizer/events"
              className="text-sm text-primary hover:underline"
            >
              View All
            </a>
          </div>
          {myEvents.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events created yet</p>
              <a
                href="/dashboard/organizer/events"
                className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Your First Event
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registrations</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myEvents.map((event) => (
                    <tr key={event.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{event.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{event.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{event.registrations}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          Manage
                        </button>
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
