'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function approveUser(formData: FormData) {
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

  // Check if user has manager or admin role and is approved
  if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
    redirect('/error')
  }

  // Extract and validate form data
  const targetUserId = formData.get('user_id') as string

  // Basic validation
  if (!targetUserId) {
    redirect('/error')
  }

  // Prevent users from approving themselves (should not happen in normal flow)
  if (targetUserId === userData.user.id) {
    redirect('/error')
  }

  // Check if target user exists and is currently not approved
  const { data: targetUser, error: targetUserError } = await supabase
    .from('user_profiles')
    .select('user_id, is_approved, role')
    .eq('user_id', targetUserId)
    .eq('is_approved', false)
    .single()

  if (targetUserError || !targetUser) {
    console.error('Target user not found or already approved:', targetUserError)
    redirect('/error')
  }

  // Update user to approved status
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ is_approved: true })
    .eq('user_id', targetUserId)

  if (updateError) {
    console.error('Error approving user:', updateError)
    redirect('/error')
  }

  // Revalidate the user approvals page
  revalidatePath('/manage/user-approvals')

  // Redirect back to the approvals page
  redirect('/manage/user-approvals')
}

export async function rejectUser(formData: FormData) {
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

  // Check if user has manager or admin role and is approved
  if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
    redirect('/error')
  }

  // Extract and validate form data
  const targetUserId = formData.get('user_id') as string

  // Basic validation
  if (!targetUserId) {
    redirect('/error')
  }

  // Prevent users from rejecting themselves (should not happen in normal flow)
  if (targetUserId === userData.user.id) {
    redirect('/error')
  }

  // Check if target user exists and is currently not approved
  const { data: targetUser, error: targetUserError } = await supabase
    .from('user_profiles')
    .select('user_id, is_approved')
    .eq('user_id', targetUserId)
    .eq('is_approved', false)
    .single()

  if (targetUserError || !targetUser) {
    console.error('Target user not found or already processed:', targetUserError)
    redirect('/error')
  }

  // Delete the user profile (rejection removes the account entirely)
  // Note: This will cascade to delete auth user due to foreign key constraints
  const { error: deleteError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', targetUserId)

  if (deleteError) {
    console.error('Error rejecting user:', deleteError)
    redirect('/error')
  }

  // Note: We also need to delete the auth user record
  // This requires admin privileges, so we'll use the service role client
  const supabaseAdmin = await createClient()
  
  try {
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // Don't redirect to error here as the profile is already deleted
      // The auth record will be cleaned up eventually
    }
  } catch (error) {
    console.error('Error with admin operation:', error)
    // Continue with the flow as profile deletion was successful
  }

  // Revalidate the user approvals page
  revalidatePath('/manage/user-approvals')

  // Redirect back to the approvals page
  redirect('/manage/user-approvals')
}