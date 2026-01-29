'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Search, Users, Calendar, Building2, CheckCircle } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'

interface Club {
  id: string
  name: string
  description: string
  category: string
  members: number
  events: number
  organizer: string
  isJoined?: boolean
}

export default function StudentClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Social', 'Academic']

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'))
      const clubsData = clubsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isJoined: false,
      })) as Club[]
      setClubs(clubsData)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      // Set mock data on error
      setClubs([
        { id: '1', name: 'Tech Club', description: 'Technology and innovation enthusiasts. Learn about the latest tech trends, attend workshops, and build amazing projects.', category: 'Technical', members: 156, events: 12, organizer: 'Amit Sharma', isJoined: true },
        { id: '2', name: 'Drama Society', description: 'Theatre and performing arts. Express yourself through drama, participate in plays, and develop your acting skills.', category: 'Cultural', members: 89, events: 8, organizer: 'Priya Rajan', isJoined: true },
        { id: '3', name: 'Health Club', description: 'Health and wellness activities. Stay fit with yoga, marathon, gym sessions, and nutrition workshops.', category: 'Sports', members: 234, events: 15, organizer: 'Sara Mehta', isJoined: false },
        { id: '4', name: 'Music Club', description: 'Music and band performances. Join jam sessions, learn instruments, and perform at campus events.', category: 'Cultural', members: 67, events: 6, organizer: 'Rahul Verma', isJoined: false },
        { id: '5', name: 'Coding Club', description: 'Programming and hackathons. Solve coding challenges, participate in hackathons, and improve your programming skills.', category: 'Technical', members: 198, events: 20, organizer: 'Neha Gupta', isJoined: true },
        { id: '6', name: 'Photography Club', description: 'Capture beautiful moments. Learn photography techniques, go on photo walks, and showcase your work.', category: 'Cultural', members: 78, events: 10, organizer: 'Vikram Singh', isJoined: false },
        { id: '7', name: 'Debate Club', description: 'Sharpen your argumentation skills. Participate in debates, Model UN, and public speaking events.', category: 'Academic', members: 56, events: 8, organizer: 'Ananya Patel', isJoined: false },
        { id: '8', name: 'Cricket Club', description: 'For cricket enthusiasts. Practice sessions, inter-college tournaments, and friendly matches.', category: 'Sports', members: 145, events: 18, organizer: 'Rohan Kumar', isJoined: false },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClub = async (clubId: string) => {
    try {
      const userId = auth.currentUser?.uid
      // Update club membership in Firebase
      // await updateDoc(doc(db, 'clubs', clubId), {
      //   members: arrayUnion(userId)
      // })
      
      setClubs(clubs =>
        clubs.map(club =>
          club.id === clubId
            ? { ...club, isJoined: true, members: club.members + 1 }
            : club
        )
      )
    } catch (error) {
      console.error('Error joining club:', error)
    }
  }

  const handleLeaveClub = async (clubId: string) => {
    setClubs(clubs =>
      clubs.map(club =>
        club.id === clubId
          ? { ...club, isJoined: false, members: club.members - 1 }
          : club
      )
    )
  }

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || club.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const myClubs = clubs.filter((club) => club.isJoined)

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Explore Clubs</h1>

        {/* My Clubs Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">My Clubs ({myClubs.length})</h2>
          {myClubs.length === 0 ? (
            <p className="text-muted-foreground text-sm">You haven't joined any clubs yet. Browse below to find clubs that interest you!</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {myClubs.map((club) => (
                <div key={club.id} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{club.name}</span>
                  <CheckCircle className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clubs..."
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
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club) => (
            <div key={club.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{club.name}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {club.category}
                  </span>
                </div>
                {club.isJoined && (
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-medium">
                    Joined
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{club.members} members</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{club.events} events</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  By <span className="text-foreground">{club.organizer}</span>
                </p>
                {club.isJoined ? (
                  <button
                    onClick={() => handleLeaveClub(club.id)}
                    className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-medium hover:text-red-500 hover:border-red-500 transition-colors"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinClub(club.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No clubs found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
