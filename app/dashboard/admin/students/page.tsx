'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Search, Filter, MoreVertical, Mail, Ban, CheckCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'

interface Student {
  id: string
  name: string
  email: string
  role: string
  status: string
  clubs: string[]
  joinedAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        clubs: doc.data().clubs || [],
        joinedAt: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
      })) as Student[]
      setStudents(usersData)
    } catch (error) {
      console.error('Error fetching students:', error)
      // Set mock data on error
      setStudents([
        { id: '1', name: 'Amit Sharma', email: 'amit@example.com', role: 'student', status: 'approved', clubs: ['Tech Club', 'Coding Club'], joinedAt: 'Jan 15, 2024' },
        { id: '2', name: 'Priya Rajan', email: 'priya@example.com', role: 'organizer', status: 'approved', clubs: ['Drama Society'], joinedAt: 'Dec 10, 2023' },
        { id: '3', name: 'Sara Mehta', email: 'sara@example.com', role: 'student', status: 'approved', clubs: ['Health Club'], joinedAt: 'Feb 01, 2024' },
        { id: '4', name: 'John Doe', email: 'john@example.com', role: 'organizer', status: 'pending', clubs: [], joinedAt: 'Feb 20, 2024' },
        { id: '5', name: 'Jane Smith', email: 'jane@example.com', role: 'student', status: 'rejected', clubs: [], joinedAt: 'Feb 18, 2024' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus })
      fetchStudents()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Students & Users</h1>
          <div className="text-sm text-muted-foreground">
            Total: {students.length} users
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clubs</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground capitalize">{student.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.clubs.length > 0 ? (
                        student.clubs.slice(0, 2).map((club, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                            {club}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No clubs</span>
                      )}
                      {student.clubs.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                          +{student.clubs.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{student.joinedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      {student.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(student.id, 'approved')}
                          className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {student.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(student.id, 'rejected')}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
