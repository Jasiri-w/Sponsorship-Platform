import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { promoteToManager, demoteFromManager } from './actions'

export default async function UserRolesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile to check role and approval status
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', userData.user.id)
    .single()

  // Check if user has admin role and is approved (only admins can manage roles)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Fetch all approved users (exclude the current admin)
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select(`
      user_id,
      full_name,
      email,
      role,
      created_at,
      is_approved
    `)
    .eq('is_approved', true)
    .neq('user_id', userData.user.id)
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    redirect('/error')
  }

  // Separate users by role for better organization
  const regularUsers = users?.filter(user => user.role === 'user') || []
  const managers = users?.filter(user => user.role === 'manager') || []
  const admins = users?.filter(user => user.role === 'admin') || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Role Management
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions. Only administrators can access this page.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Regular Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {regularUsers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-3a1 1 0 011-1h2a1 1 0 011 1v3H8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Managers
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {managers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-800">
                  Administrators
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {admins.length + 1} {/* +1 for current admin */}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Regular Users - Can be promoted to Manager */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Regular Users ({regularUsers.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Users with basic access. Can be promoted to Manager role.
              </p>
            </div>

            {regularUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {regularUsers.map((user) => (
                  <div key={user.user_id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.full_name || 'No name provided'}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className="text-xs text-gray-500">
                            Member since {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <form action={promoteToManager}>
                        <input type="hidden" name="user_id" value={user.user_id} />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                          Promote to Manager
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No regular users found.
              </div>
            )}
          </div>

          {/* Managers - Can be demoted to User */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-3a1 1 0 011-1h2a1 1 0 011 1v3H8z" clipRule="evenodd" />
                </svg>
                Managers ({managers.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Users with management privileges. Can create/edit sponsors and events.
              </p>
            </div>

            {managers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {managers.map((user) => (
                  <div key={user.user_id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.full_name || 'No name provided'}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Manager
                            </span>
                            <span className="text-xs text-gray-500">
                              Since {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <form action={demoteFromManager}>
                        <input type="hidden" name="user_id" value={user.user_id} />
                        <button
                          type="submit"
                          className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                        >
                          Demote to User
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No managers found.
              </div>
            )}
          </div>

          {/* Administrators - Information only */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                Administrators ({admins.length + 1})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Users with full administrative privileges. Admin roles cannot be changed from this interface.
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Current admin (you) */}
              <div className="p-6 bg-purple-25">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || userData.user.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      You (Current Admin)
                    </h3>
                    <p className="text-sm text-gray-600">{userData.user.email}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mt-1">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* Other admins */}
              {admins.map((user) => (
                <div key={user.user_id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-700">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.full_name || 'No name provided'}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Administrator
                        </span>
                        <span className="text-xs text-gray-500">
                          Since {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Role Management Guidelines
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Users:</strong> Can view sponsors and events (if approved)</li>
                  <li><strong>Managers:</strong> Can create/edit sponsors, events, and manage relationships</li>
                  <li><strong>Administrators:</strong> Have all permissions plus user and role management</li>
                  <li>Only promote trusted users to Manager or Administrator roles</li>
                  <li>Administrator roles cannot be changed through this interface for security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="/manage/user-approvals"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← User Approvals
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/manage/tiers"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Tiers →
          </a>
        </div>
      </div>
    </div>
  )
}