'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Users, Calendar, Settings, TrendingUp, MessageSquare } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

interface Club {
  id: string
  name: string
  description: string
  category: string
  members: number
  events: number
  pendingMembers: number
}

interface Member {
  id: string
  name: string
  email: string
  role: string
  joinedAt: string
}

export default function OrganizerClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const userId = auth.currentUser?.uid
      const clubsQuery = query(
        collection(db, 'clubs'),
        where('organizerId', '==', userId)
      )
      const clubsSnapshot = await getDocs(clubsQuery)
      const clubsData = clubsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Club[]
      setClubs(clubsData)
      if (clubsData.length > 0) {
        setSelectedClub(clubsData[0])
        fetchMembers(clubsData[0].id)
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
      // Set mock data on error
      const mockClubs = [
        { id: '1', name: 'Tech Club', description: 'Technology and innovation enthusiasts', category: 'Technical', members: 156, events: 12, pendingMembers: 5 },
        { id: '2', name: 'Coding Club', description: 'Programming and hackathons', category: 'Technical', members: 198, events: 20, pendingMembers: 8 },
      ]
      setClubs(mockClubs)
      setSelectedClub(mockClubs[0])
      setMembers([
        { id: '1', name: 'Amit Sharma', email: 'amit@example.com', role: 'Member', joinedAt: 'Jan 15, 2024' },
        { id: '2', name: 'Priya Rajan', email: 'priya@example.com', role: 'Core Member', joinedAt: 'Dec 10, 2023' },
        { id: '3', name: 'Sara Mehta', email: 'sara@example.com', role: 'Member', joinedAt: 'Feb 01, 2024' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (clubId: string) => {
    try {
      const membersQuery = query(
        collection(db, 'clubMembers'),
        where('clubId', '==', clubId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      const membersData = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Member[]
      setMembers(membersData)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club)
    fetchMembers(club.id)
  }

  return (
    <DashboardLayout role="organizer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Clubs</h1>

        {clubs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">You don't manage any clubs yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clubs List */}
            <div className="space-y-4">
              {clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => handleClubSelect(club)}
                  className={`w-full text-left bg-card rounded-xl border p-4 transition-all ${
                    selectedClub?.id === club.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className="font-semibold text-foreground mb-1">{club.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{club.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {club.members}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {club.events}
                    </span>
                    {club.pendingMembers > 0 && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-xs">
                        {club.pendingMembers} pending
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Club Details */}
            {selectedClub && (
              <div className="lg:col-span-2 space-y-6">
                {/* Club Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Members</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedClub.members}</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Events</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedClub.events}</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Growth</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">+12%</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Messages</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">28</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/dashboard/organizer/events"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Create Event
                    </a>
                    <a
                      href="/dashboard/organizer/chat"
                      className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Send Announcement
                    </a>
                    <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Members</h3>
                    <span className="text-sm text-muted-foreground">{members.length} total</span>
                  </div>
                  <div className="divide-y divide-border">
                    {members.map((member) => (
                      <div key={member.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                            {member.role}
                          </span>
                          <span className="text-xs text-muted-foreground">{member.joinedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
