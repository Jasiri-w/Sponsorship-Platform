import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { UserProfile } from '@/types/database.types'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect('/login')
  }

  console.log("authData")
  console.log(authData.user)
  // Fetch user profile with proper typing
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', authData.user.id)
    .single<{ data: UserProfile }>()

  console.log("profileData")
  console.log(profileData)
  if (profileError || !profileData) {
    console.error('Error fetching user profile:', profileError)
    return <div>Error loading profile</div>
  }

  const userProfile = profileData as unknown as UserProfile
  
  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl p-6 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
        
        <div className="space-y-2 text-black">
          <p><span className="font-semibold">Name:</span> <span className="text-cyan-500">
            {userProfile.full_name || 'Not provided'}
          </span></p>
          
          <p><span className="font-semibold">Email:</span> <span className="text-cyan-500">
            {userProfile.email}
          </span></p>
          
          <p><span className="font-semibold">User ID:</span> <span className="text-cyan-500 font-mono text-sm">
            {authData.user.id}
          </span></p>
          
          <p><span className="font-semibold">Role:</span> <span className="px-2 py-1 text-sm font-semibold text-white bg-cyan-500 rounded">
            {userProfile.role.toUpperCase()}
          </span></p>
          
          <p><span className="font-semibold">Account Status:</span> <span className={`px-2 py-1 text-sm font-semibold rounded ${
            userProfile.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {userProfile.is_approved ? 'Approved' : 'Pending Approval'}
          </span></p>
        </div>
      </div>
    </div>
  )
}
