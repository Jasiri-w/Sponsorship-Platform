'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { approveUser, rejectUser, promoteToManager, demoteFromManager } from './actions'
import type { UserRole, UserProfile } from '@/types/user'

export default function UserManagementPage() {
    const [loading, setLoading] = useState<{[key: string]: boolean}>({})
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<UserProfile[]>([])
    const [profile, setProfile] = useState<{role: UserRole, is_approved: boolean} | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Refresh users after action
    const refreshUsers = async () => {
        try {
        const supabase = createClient()
        const { data: usersData, error: usersError } = await supabase
            .from('user_profiles')
            .select(`
            user_id,
            full_name,
            email,
            role,
            is_approved,
            created_at,
            updated_at
            `)
            .order('created_at', { ascending: false })

        if (usersError) throw usersError
        setUsers(usersData || [])
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh users')
        }
    }

    // Handle server actions with loading states
    const handleAction = async (action: Function, userId: string, actionName: string) => {
        try {
        setLoading(prev => ({...prev, [actionName + userId]: true}))
        setError(null)
        
        const formData = new FormData()
        formData.append('userId', userId)
        await action(formData)
        
        // Refresh users after action
        await refreshUsers()
        } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
        setLoading(prev => ({...prev, [actionName + userId]: false}))
        }
    }

    // Fetch users and profile data
    const fetchUsers = async () => {
        try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            window.location.href = '/login'
            return
        }
        
        // Get user profile to check role and approval status
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('role, is_approved')
            .eq('user_id', user.id)
            .single()

        console.log("Profile Data 5")
        console.log(profileData)

        // Only update profile if we have valid data
        if (profileData) {
            setProfile(profileData)
            
            if (!profileData.is_approved || !['admin', 'manager'].includes(profileData.role)) {
                console.log("Profile Data 6 - Unauthorized")
                console.log(profileData)
                window.location.href = '/unauthorized'
                return
            }
        } else {
            console.log("No profile data found")
            window.location.href = '/unauthorized'
            return
        }

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
            .from('user_profiles')
            .select(`
            user_id,
            full_name,
            email,
            role,
            is_approved,
            created_at,
            updated_at
            `)
            .order('created_at', { ascending: false })

        if (usersError) throw usersError
        setUsers(usersData || [])
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
        }
    }

    // Initial data fetch
    useEffect(() => {
        const initialize = async () => {
            try {
                const supabase = createClient()
                
                // Check if user is authenticated
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                if (userError || !user) {
                    window.location.href = '/login'
                    return
                }
                
                await fetchUsers()
            } catch (error) {
                console.error('Initialization error:', error)
                setError('Failed to initialize page')
            } finally {
                setIsLoading(false)
            }
        }
        initialize()
    }, [])

    // Only allow admin or manager to access this page
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If we're done loading but have no valid profile, show loading state
    // The useEffect will handle the redirection
    if (!profile) {
        return <div>Loading user information...</div>
    }

    // Separate users into pending and approved
    const pendingUsers = users.filter(user => !user.is_approved)
    const approvedUsers = users.filter(user => user.is_approved)
    

    return (
        <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
            {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
                </div>
            </div>
            )}
            <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
                Manage user accounts and permissions
            </p>
            </div>

            {/* Pending Approvals Section */}
        {(profile.role === 'admin' || profile.role === 'manager') && pendingUsers.length > 0 && (
            <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                        <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.full_name || 'No name provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <form action={approveUser} className="inline">
                            <input type="hidden" name="userId" value={user.user_id} />
                                <button
                                type="button"
                                onClick={() => handleAction(approveUser, user.user_id, 'approve')}
                                disabled={loading[`approve${user.user_id}`]}
                                className={`text-green-600 hover:text-green-900 ${loading[`approve${user.user_id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                {loading[`approve${user.user_id}`] ? (
                                    <div className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v1h2a1 1 0 110 1V3a1 1 0 01-1-1H4zm5 0a1 1 0 011 1v1h2a1 1 0 110 1V3a1 1 0 01-1-1H9zm5 0a1 1 0 011 1v1h1a1 1 0 110 1V3a1 1 0 01-1-1H14z" clipRule="evenodd" />
                                    </svg>
                                    Approving...
                                    </div>
                                ) : 'Approve'}
                                </button>
                            </form>
                            <form action={rejectUser} className="inline">
                            <input type="hidden" name="userId" value={user.user_id} />
                                <button
                                type="button"
                                onClick={() => handleAction(rejectUser, user.user_id, 'reject')}
                                disabled={loading[`reject${user.user_id}`]}
                                className={`ml-4 text-red-600 hover:text-red-900 ${loading[`reject${user.user_id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                {loading[`reject${user.user_id}`] ? (
                                    <div className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v1h2a1 1 0 110 1V3a1 1 0 01-1-1H4zm5 0a1 1 0 011 1v1h2a1 1 0 110 1V3a1 1 0 01-1-1H9zm5 0a1 1 0 011 1v1h1a1 1 0 110 1V3a1 1 0 01-1-1H14z" clipRule="evenodd" />
                                    </svg>
                                    Rejecting...
                                    </div>
                                ) : 'Reject'}
                                </button>
                            </form>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        )}

        {/* Approved Users Section */}
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
            {profile.role === 'admin' ? 'All Users' : 'Team Members'}
            </h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {profile.role === 'admin' && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {approvedUsers.map((user) => (
                    <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name || 'No name provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                        </td>
                        {profile.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {user.role === 'manager' ? (
                            <form action={demoteFromManager} className="inline">
                                <input type="hidden" name="userId" value={user.user_id} />
                                <button
                                type="button"
                                onClick={() => handleAction(demoteFromManager, user.user_id, 'demote')}
                                disabled={loading[`demote${user.user_id}`]}
                                className={`text-yellow-600 hover:text-yellow-900 ${loading[`demote${user.user_id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                {loading[`demote${user.user_id}`] ? 'Demoting...' : 'Demote to User'}
                                </button>
                            </form>
                            ) : user.role === 'user' ? (
                            <form action={promoteToManager} className="inline">
                                <input type="hidden" name="userId" value={user.user_id} />
                                <button
                                type="button"
                                onClick={() => handleAction(promoteToManager, user.user_id, 'promote')}
                                disabled={loading[`promote${user.user_id}`]}
                                className={`text-blue-600 hover:text-blue-900 ${loading[`promote${user.user_id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                {loading[`promote${user.user_id}`] ? 'Promoting...' : 'Promote to Manager'}
                                </button>
                            </form>
                            ) : null}
                        </td>
                        )}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </div>
        </div>
    )
}
