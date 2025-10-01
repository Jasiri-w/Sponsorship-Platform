'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createEvent(formData: FormData) {
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
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const details = formData.get('details') as string || null

  // Basic validation
  if (!title || !date) {
    redirect('/error')
  }

  // Validate date format (basic check)
  const eventDate = new Date(date)
  if (isNaN(eventDate.getTime())) {
    redirect('/error')
  }

  // Create the event
  const { error: createError } = await supabase
    .from('events')
    .insert({
      title: title.trim(),
      date,
      details: details?.trim() || null
    })

  if (createError) {
    console.error('Error creating event:', createError)
    redirect('/error')
  }

  // Revalidate the events pages
  revalidatePath('/events')
  revalidatePath('/events-sponsors')
  
  // Redirect to events listing page
  redirect('/events')
}