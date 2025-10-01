'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createTier(formData: FormData) {
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

  // Check if user has admin role and is approved (only admins can manage tiers)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Extract and validate form data
  const name = formData.get('name') as string
  const level = parseInt(formData.get('level') as string)
  const description = formData.get('description') as string || null

  // Basic validation
  if (!name || isNaN(level) || level < 1) {
    redirect('/error')
  }

  // Check if tier with same name or level already exists
  const { data: existingTier, error: existingTierError } = await supabase
    .from('tiers')
    .select('id')
    .or(`name.eq.${name},level.eq.${level}`)
    .single()

  // If tier exists, redirect without error (could be improved with error message)
  if (existingTier) {
    redirect('/manage/tiers')
  }

  // Create the tier
  const { error: insertError } = await supabase
    .from('tiers')
    .insert({
      name: name.trim(),
      level,
      description: description?.trim() || null
    })

  if (insertError) {
    console.error('Error creating tier:', insertError)
    redirect('/error')
  }

  // Revalidate relevant pages
  revalidatePath('/manage/tiers')
  revalidatePath('/sponsors')
  revalidatePath('/sponsors-tiers')

  // Redirect back to the tiers management page
  redirect('/manage/tiers')
}

export async function updateTier(formData: FormData) {
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

  // Check if user has admin role and is approved (only admins can manage tiers)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Extract and validate form data
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const level = parseInt(formData.get('level') as string)
  const description = formData.get('description') as string || null

  // Basic validation
  if (!id || !name || isNaN(level) || level < 1) {
    redirect('/error')
  }

  // Check if tier exists
  const { data: existingTier, error: existingTierError } = await supabase
    .from('tiers')
    .select('id')
    .eq('id', id)
    .single()

  if (existingTierError || !existingTier) {
    console.error('Tier not found:', existingTierError)
    redirect('/error')
  }

  // Check if another tier with same name or level already exists (excluding current tier)
  const { data: conflictingTier, error: conflictingTierError } = await supabase
    .from('tiers')
    .select('id')
    .neq('id', id)
    .or(`name.eq.${name},level.eq.${level}`)
    .single()

  // If conflicting tier exists, redirect without updating
  if (conflictingTier) {
    redirect('/manage/tiers')
  }

  // Update the tier
  const { error: updateError } = await supabase
    .from('tiers')
    .update({
      name: name.trim(),
      level,
      description: description?.trim() || null
    })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating tier:', updateError)
    redirect('/error')
  }

  // Revalidate relevant pages
  revalidatePath('/manage/tiers')
  revalidatePath('/sponsors')
  revalidatePath('/sponsors-tiers')

  // Redirect back to the tiers management page
  redirect('/manage/tiers')
}

export async function deleteTier(formData: FormData) {
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

  // Check if user has admin role and is approved (only admins can manage tiers)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Extract and validate form data
  const id = formData.get('id') as string

  // Basic validation
  if (!id) {
    redirect('/error')
  }

  // Check if tier exists
  const { data: existingTier, error: existingTierError } = await supabase
    .from('tiers')
    .select('id')
    .eq('id', id)
    .single()

  if (existingTierError || !existingTier) {
    console.error('Tier not found:', existingTierError)
    redirect('/error')
  }

  // Check if tier is being used by any sponsors
  const { data: sponsorsUsingTier, error: sponsorsError } = await supabase
    .from('sponsors')
    .select('id')
    .eq('tier_id', id)
    .limit(1)

  if (sponsorsError) {
    console.error('Error checking tier usage:', sponsorsError)
    redirect('/error')
  }

  // If tier is being used, don't allow deletion
  if (sponsorsUsingTier && sponsorsUsingTier.length > 0) {
    redirect('/manage/tiers')
  }

  // Delete the tier
  const { error: deleteError } = await supabase
    .from('tiers')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Error deleting tier:', deleteError)
    redirect('/error')
  }

  // Revalidate relevant pages
  revalidatePath('/manage/tiers')
  revalidatePath('/sponsors')
  revalidatePath('/sponsors-tiers')

  // Redirect back to the tiers management page
  redirect('/manage/tiers')
}