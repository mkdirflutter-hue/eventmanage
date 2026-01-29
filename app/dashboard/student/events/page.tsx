'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Search, Calendar, Clock, MapPin, Users, Filter } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

interface Event {
  id: string
  name: string
  description: string
  date: string
  time: string
  venue: string
  club: string
  category: string
  registrations: number
  capacity: number
  isRegistered?: boolean
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showRegistered, setShowRegistered] = useState(false)
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Social', 'Academic']

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', 'approved'),
        orderBy('date', 'asc')
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isRegistered: false,
      })) as Event[]
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      // Set mock data on error
      setEvents([
        { id: '1', name: 'Tech Summit 2024', description: 'Annual technology conference featuring industry speakers and workshops', date: 'Mar 15, 2024', time: '10:00 AM', venue: 'Main Auditorium', club: 'Tech Club', category: 'Technical', registrations: 156, capacity: 200, isRegistered: true },
        { id: '2', name: 'Coding Workshop', description: 'Learn Python basics in this hands-on workshop', date: 'Mar 20, 2024', time: '2:00 PM', venue: 'Lab 101', club: 'Coding Club', category: 'Technical', registrations: 45, capacity: 50, isRegistered: false },
        { id: '3', name: 'Cultural Night', description: 'Annual cultural fest with music, dance, and drama performances', date: 'Mar 25, 2024', time: '6:00 PM', venue: 'Open Air Theatre', club: 'Drama Society', category: 'Cultural', registrations: 320, capacity: 500, isRegistered: true },
        { id: '4', name: 'Marathon', description: '5K run for fitness and fun', date: 'Apr 01, 2024', time: '6:00 AM', venue: 'Sports Ground', club: 'Health Club', category: 'Sports', registrations: 89, capacity: 150, isRegistered: false },
        { id: '5', name: 'Hackathon 2024', description: '24-hour coding competition with amazing prizes', date: 'Apr 05, 2024', time: '9:00 AM', venue: 'Innovation Center', club: 'Coding Club', category: 'Technical', registrations: 120, capacity: 150, isRegistered: false },
        { id: '6', name: 'Photography Walk', description: 'Explore campus and capture beautiful moments', date: 'Apr 10, 2024', time: '4:00 PM', venue: 'Campus Garden', club: 'Photography Club', category: 'Cultural', registrations: 30, capacity: 40, isRegistered: false },
        { id: '7', name: 'Debate Competition', description: 'Inter-college debate on current affairs', date: 'Apr 15, 2024', time: '10:00 AM', venue: 'Seminar Hall', club: 'Debate Club', category: 'Academic', registrations: 24, capacity: 50, isRegistered: true },
        { id: '8', name: 'Cricket Tournament', description: 'Inter-department cricket tournament', date: 'Apr 20, 2024', time: '8:00 AM', venue: 'Cricket Ground', club: 'Cricket Club', category: 'Sports', registrations: 80, capacity: 100, isRegistered: false },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (eventId: string) => {
    setEvents(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, isRegistered: true, registrations: event.registrations + 1 }
          : event
      )
    )
  }

  const handleUnregister = (eventId: string) => {
    setEvents(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, isRegistered: false, registrations: event.registrations - 1 }
          : event
      )
    )
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.club.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesRegistered = !showRegistered || event.isRegistered
    return matchesSearch && matchesCategory && matchesRegistered
  })

  const registeredCount = events.filter((e) => e.isRegistered).length

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Registered:</span>
            <span className="font-semibold text-primary">{registeredCount}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selectedCategory === cat.toLowerCase()
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowRegistered(!showRegistered)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
              showRegistered
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            My Events
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{event.name}</h3>
                  <span className="text-xs text-primary">{event.club}</span>
                </div>
                {event.isRegistered && (
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-medium">
                    Registered
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{event.registrations}</span>
                    <span className="text-muted-foreground">/ {event.capacity}</span>
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        event.registrations / event.capacity > 0.9
                          ? 'bg-red-500'
                          : event.registrations / event.capacity > 0.7
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                
                {event.isRegistered ? (
                  <button
                    onClick={() => handleUnregister(event.id)}
                    className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-medium hover:text-red-500 hover:border-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                ) : event.registrations >= event.capacity ? (
                  <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium">
                    Full
                  </span>
                ) : (
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No events found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
