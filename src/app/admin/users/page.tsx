'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getAllUsers, 
  updateUserPermissions, 
  getUsersByRole 
} from '@/lib/auth'
import type { UserProfile, UserRole } from '@/types/database'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Mail, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function UserManagementContent() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'chairs'>('all')
  const [error, setError] = useState<string | null>(null)
  const { refreshUserProfile } = useAuth()

  const filterUsers = useCallback(() => {
    let filtered = [...users]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    switch (statusFilter) {
      case 'pending':
        filtered = filtered.filter(user => !user.is_approved)
        break
      case 'approved':
        filtered = filtered.filter(user => user.is_approved && user.role === 'user')
        break
      case 'chairs':
        filtered = filtered.filter(user => user.role === 'sponsorship_chair')
        break
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  const handleUpdateUser = async (userId: string, isApproved: boolean, role: UserRole) => {
    try {
      setUpdating(userId)
      setError(null)

      const { error } = await updateUserPermissions(userId, isApproved, role)
      if (error) {
        throw error
      }

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, is_approved: isApproved, role }
            : user
        )
      )

      // Refresh current user's profile in case they updated their own permissions
      await refreshUserProfile()
    } catch (error) {
      console.error('Error updating user:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setUpdating(null)
    }
  }

  const getUserStatusBadge = (user: UserProfile) => {
    if (user.role === 'sponsorship_chair') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="h-3 w-3 mr-1" />
          Sponsorship Chair
        </span>
      )
    }
    
    if (user.is_approved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pending
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-lg text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            User Management
          </h1>
          <p className="subheading mt-1">Manage user approvals and role assignments</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'chairs')}
              className="input-field w-auto"
            >
              <option value="all">All Users</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved Users</option>
              <option value="chairs">Sponsorship Chairs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter(u => !u.is_approved).length}
          </p>
          <p className="text-sm text-gray-500">Pending Approval</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.is_approved && u.role === 'user').length}
          </p>
          <p className="text-sm text-gray-500">Approved Users</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'sponsorship_chair').length}
          </p>
          <p className="text-sm text-gray-500">Sponsorship Chairs</p>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-24 w-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Users will appear here once they register'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user.full_name || 'No name provided'}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getUserStatusBadge(user)}
                  
                  {updating === user.user_id ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-salmon-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-500">Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {!user.is_approved && (
                        <button
                          onClick={() => handleUpdateUser(user.user_id, true, 'user')}
                          className="btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                          title="Approve User"
                        >
                          <UserCheck className="h-3 w-3" />
                          Approve
                        </button>
                      )}

                      {user.is_approved && user.role === 'user' && (
                        <>
                          <button
                            onClick={() => handleUpdateUser(user.user_id, true, 'sponsorship_chair')}
                            className="btn-sm bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
                            title="Promote to Sponsorship Chair"
                          >
                            <Crown className="h-3 w-3" />
                            Promote
                          </button>
                          <button
                            onClick={() => handleUpdateUser(user.user_id, false, 'user')}
                            className="btn-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            title="Revoke Approval"
                          >
                            <UserX className="h-3 w-3" />
                            Revoke
                          </button>
                        </>
                      )}

                      {user.role === 'sponsorship_chair' && (
                        <button
                          onClick={() => handleUpdateUser(user.user_id, true, 'user')}
                          className="btn-sm bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-1"
                          title="Demote to Regular User"
                        >
                          <UserX className="h-3 w-3" />
                          Demote
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <UserManagementContent />
    </ProtectedRoute>
  )
}