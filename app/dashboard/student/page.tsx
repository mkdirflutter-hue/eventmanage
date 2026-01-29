'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import StatCard from '@/components/common/StatCard'
import { Calendar, CheckCircle, Building2, Clock, MapPin, Users } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

interface Event {
  id: string
  name: string
  date: string
  time: string
  venue: string
  club: string
  registrations: number
  capacity: number
  isRegistered?: boolean
}

interface Club {
  id: string
  name: string
  members: number
  category: string
}

export default function StudentDashboard() {
  const [stats, setStats] = useState([
    { title: 'Upcoming Events', value: 0, delta: 'This month', icon: Calendar, color: '#3b82f6' },
    { title: 'Registered Events', value: 0, delta: 'You\'re attending', icon: CheckCircle, color: '#10b981' },
    { title: 'My Clubs', value: 0, delta: 'Memberships', icon: Building2, color: '#8b5cf6' },
    { title: 'Events Attended', value: 0, delta: 'All time', icon: Clock, color: '#f59e0b' },
  ])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [myClubs, setMyClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      // Fetch upcoming events
      const eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', 'approved'),
        orderBy('date', 'asc'),
        limit(5)
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]

      // Fetch clubs
      const clubsSnapshot = await getDocs(collection(db, 'clubs'))
      const clubs = clubsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Club[]

      setStats([
        { title: 'Upcoming Events', value: events.length, delta: 'This month', icon: Calendar, color: '#3b82f6' },
        { title: 'Registered Events', value: 2, delta: 'You\'re attending', icon: CheckCircle, color: '#10b981' },
        { title: 'My Clubs', value: 3, delta: 'Memberships', icon: Building2, color: '#8b5cf6' },
        { title: 'Events Attended', value: 12, delta: 'All time', icon: Clock, color: '#f59e0b' },
      ])

      setUpcomingEvents(events)
      setMyClubs(clubs.slice(0, 3))
    } catch (error) {
      console.error('Error fetching student data:', error)
      // Set mock data on error
      setStats([
        { title: 'Upcoming Events', value: 8, delta: 'This month', icon: Calendar, color: '#3b82f6' },
        { title: 'Registered Events', value: 3, delta: 'You\'re attending', icon: CheckCircle, color: '#10b981' },
        { title: 'My Clubs', value: 4, delta: 'Memberships', icon: Building2, color: '#8b5cf6' },
        { title: 'Events Attended', value: 15, delta: 'All time', icon: Clock, color: '#f59e0b' },
      ])
      setUpcomingEvents([
        { id: '1', name: 'Tech Summit 2024', date: 'Mar 15', time: '10:00 AM', venue: 'Main Auditorium', club: 'Tech Club', registrations: 156, capacity: 200, isRegistered: true },
        { id: '2', name: 'Coding Workshop', date: 'Mar 20', time: '2:00 PM', venue: 'Lab 101', club: 'Coding Club', registrations: 45, capacity: 50, isRegistered: false },
        { id: '3', name: 'Cultural Night', date: 'Mar 25', time: '6:00 PM', venue: 'Open Air Theatre', club: 'Drama Society', registrations: 320, capacity: 500, isRegistered: true },
        { id: '4', name: 'Marathon', date: 'Apr 01', time: '6:00 AM', venue: 'Sports Ground', club: 'Health Club', registrations: 89, capacity: 150, isRegistered: false },
      ])
      setMyClubs([
        { id: '1', name: 'Tech Club', members: 156, category: 'Technical' },
        { id: '2', name: 'Drama Society', members: 89, category: 'Cultural' },
        { id: '3', name: 'Health Club', members: 234, category: 'Sports' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (eventId: string) => {
    setUpcomingEvents(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, isRegistered: true, registrations: event.registrations + 1 }
          : event
      )
    )
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <a
            href="/dashboard/student/events"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Events
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

        {/* Events and Clubs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Upcoming Events</h2>
              <a href="/dashboard/student/events" className="text-sm text-primary hover:underline">
                View All
              </a>
            </div>
            <div className="divide-y divide-border">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{event.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.date} at {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.venue}
                        </span>
                      </div>
                      <span className="text-xs text-primary mt-1 inline-block">{event.club}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Users className="w-4 h-4" />
                      <span>{event.registrations}/{event.capacity}</span>
                    </div>
                    {event.isRegistered ? (
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-medium">
                        Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Clubs */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">My Clubs</h2>
              <a href="/dashboard/student/clubs" className="text-sm text-primary hover:underline">
                View All
              </a>
            </div>
            <div className="p-4 space-y-3">
              {myClubs.map((club) => (
                <div key={club.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{club.name}</h3>
                      <p className="text-xs text-muted-foreground">{club.members} members</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {club.category}
                  </span>
                </div>
              ))}
              <a
                href="/dashboard/student/clubs"
                className="block w-full text-center py-2 text-sm text-primary hover:underline"
              >
                Explore More Clubs
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Registered for Tech Summit 2024', time: '2 hours ago' },
              { action: 'Joined Drama Society', time: '1 day ago' },
              { action: 'Attended Coding Workshop', time: '3 days ago' },
              { action: 'Registered for Cultural Night', time: '1 week ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{activity.action}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
