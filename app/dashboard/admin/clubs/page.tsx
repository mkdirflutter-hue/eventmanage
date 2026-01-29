'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Plus, Search, Users, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

interface Club {
  id: string
  name: string
  description: string
  category: string
  members: number
  events: number
  organizer: string
  status: string
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: 'technical',
  })

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'))
      const clubsData = clubsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Club[]
      setClubs(clubsData)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      // Set mock data on error
      setClubs([
        { id: '1', name: 'Tech Club', description: 'Technology and innovation', category: 'Technical', members: 156, events: 12, organizer: 'Amit Sharma', status: 'active' },
        { id: '2', name: 'Drama Society', description: 'Theatre and performing arts', category: 'Cultural', members: 89, events: 8, organizer: 'Priya Rajan', status: 'active' },
        { id: '3', name: 'Health Club', description: 'Health and wellness activities', category: 'Sports', members: 234, events: 15, organizer: 'Sara Mehta', status: 'active' },
        { id: '4', name: 'Music Club', description: 'Music and band performances', category: 'Cultural', members: 67, events: 6, organizer: 'Rahul Verma', status: 'active' },
        { id: '5', name: 'Coding Club', description: 'Programming and hackathons', category: 'Technical', members: 198, events: 20, organizer: 'Neha Gupta', status: 'active' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'clubs'), {
        ...newClub,
        members: 0,
        events: 0,
        status: 'active',
        createdAt: serverTimestamp(),
      })
      setShowModal(false)
      setNewClub({ name: '', description: '', category: 'technical' })
      fetchClubs()
    } catch (error) {
      console.error('Error creating club:', error)
    }
  }

  const handleDeleteClub = async (clubId: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
      try {
        await deleteDoc(doc(db, 'clubs', clubId))
        fetchClubs()
      } catch (error) {
        console.error('Error deleting club:', error)
      }
    }
  }

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = ['Technical', 'Cultural', 'Sports', 'Social', 'Academic']

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Clubs Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Club
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                <div className="relative group">
                  <button className="p-1 rounded hover:bg-muted">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-muted w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{club.members} members</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{club.events} events</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Organizer: <span className="text-foreground">{club.organizer}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Create Club Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">Create New Club</h2>
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Club Name</label>
                  <input
                    type="text"
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    value={newClub.category}
                    onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Club
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
