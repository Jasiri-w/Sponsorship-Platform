'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createSponsor(formData: FormData) {
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
  const name = formData.get('name') as string
  const tier_id = formData.get('tier_id') as string
  const address = formData.get('address') as string || null
  const contact_name = formData.get('contact_name') as string || null
  const contact_email = formData.get('contact_email') as string || null
  const contact_phone = formData.get('contact_phone') as string || null
  const logo_url = formData.get('logo_url') as string || null
  const sponsorship_agreement_url = formData.get('sponsorship_agreement_url') as string || null
  const receipt_url = formData.get('receipt_url') as string || null
  const fulfilled = formData.get('fulfilled') === 'true'

  // Basic validation
  if (!name || !tier_id) {
    redirect('/error')
  }

  // Validate that the tier exists and user can access it
  const { data: tier, error: tierError } = await supabase
    .from('tiers')
    .select('id')
    .eq('id', tier_id)
    .single()

  if (tierError || !tier) {
    redirect('/error')
  }

  // Create the sponsor
  const { error: createError } = await supabase
    .from('sponsors')
    .insert({
      name: name.trim(),
      tier_id,
      address: address?.trim() || null,
      contact_name: contact_name?.trim() || null,
      contact_email: contact_email?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      logo_url: logo_url?.trim() || null,
      sponsorship_agreement_url: sponsorship_agreement_url?.trim() || null,
      receipt_url: receipt_url?.trim() || null,
      fulfilled
    })

  if (createError) {
    console.error('Error creating sponsor:', createError)
    redirect('/error')
  }

  // Revalidate the sponsors pages
  revalidatePath('/sponsors')
  revalidatePath('/sponsors-tiers')
  
  // Redirect to sponsors listing page
  redirect('/sponsors')
}