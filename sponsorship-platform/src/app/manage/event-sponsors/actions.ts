'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function assignSponsorToEvent(formData: FormData) {
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
  const eventId = formData.get('event_id') as string
  const sponsorId = formData.get('sponsor_id') as string

  // Basic validation
  if (!eventId || !sponsorId) {
    redirect('/error')
  }

  // Verify that both event and sponsor exist
  const [
    { data: event, error: eventError },
    { data: sponsor, error: sponsorError }
  ] = await Promise.all([
    supabase.from('events').select('id').eq('id', eventId).single(),
    supabase.from('sponsors').select('id').eq('id', sponsorId).single()
  ])

  if (eventError || !event || sponsorError || !sponsor) {
    console.error('Event or sponsor not found:', { eventError, sponsorError })
    redirect('/error')
  }

  // Check if relationship already exists
  const { data: existingRelationship, error: relationshipCheckError } = await supabase
    .from('event_sponsors')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('sponsor_id', sponsorId)
    .single()

  // If relationship already exists, redirect without error (idempotent operation)
  if (existingRelationship) {
    revalidatePath('/manage/event-sponsors')
    revalidatePath('/events-sponsors')
    redirect('/manage/event-sponsors')
  }

  // Create the event-sponsor relationship
  const { error: insertError } = await supabase
    .from('event_sponsors')
    .insert({
      event_id: eventId,
      sponsor_id: sponsorId
    })

  if (insertError) {
    console.error('Error creating event-sponsor relationship:', insertError)
    redirect('/error')
  }

  // Revalidate relevant pages
  revalidatePath('/manage/event-sponsors')
  revalidatePath('/events-sponsors')
  revalidatePath(`/event/${eventId}`)
  revalidatePath(`/sponsor/${sponsorId}`)

  // Redirect back to the management page
  redirect('/manage/event-sponsors')
}

export async function removeSponsorFromEvent(formData: FormData) {
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
  const eventId = formData.get('event_id') as string
  const sponsorId = formData.get('sponsor_id') as string

  // Basic validation
  if (!eventId || !sponsorId) {
    redirect('/error')
  }

  // Remove the event-sponsor relationship
  const { error: deleteError } = await supabase
    .from('event_sponsors')
    .delete()
    .eq('event_id', eventId)
    .eq('sponsor_id', sponsorId)

  if (deleteError) {
    console.error('Error removing event-sponsor relationship:', deleteError)
    redirect('/error')
  }

  // Revalidate relevant pages
  revalidatePath('/manage/event-sponsors')
  revalidatePath('/events-sponsors')
  revalidatePath(`/event/${eventId}`)
  revalidatePath(`/sponsor/${sponsorId}`)

  // Redirect back to the management page
  redirect('/manage/event-sponsors')
}