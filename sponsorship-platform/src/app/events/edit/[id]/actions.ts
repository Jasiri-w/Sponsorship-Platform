'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updateEvent(formData: FormData) {
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
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const details = formData.get('details') as string || null

  // Basic validation
  if (!id || !title || !date) {
    redirect('/error')
  }

  // Validate date format (basic check)
  const eventDate = new Date(date)
  if (isNaN(eventDate.getTime())) {
    redirect('/error')
  }

  // Check if event exists and user can access it
  const { data: existingEvent, error: eventCheckError } = await supabase
    .from('events')
    .select('id')
    .eq('id', id)
    .single()

  if (eventCheckError || !existingEvent) {
    redirect('/error')
  }

  // Update the event
  const { error: updateError } = await supabase
    .from('events')
    .update({
      title: title.trim(),
      date,
      details: details?.trim() || null
    })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating event:', updateError)
    redirect('/error')
  }

  // Revalidate the events pages
  revalidatePath('/events')
  revalidatePath('/events-sponsors')
  revalidatePath(`/event/${id}`)
  
  // Redirect to the individual event page
  redirect(`/event/${id}`)
}