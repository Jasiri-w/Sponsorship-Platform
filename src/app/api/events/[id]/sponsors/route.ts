import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/events/[id]/sponsors - Get all sponsors for a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch sponsors for the event
    const { data: eventSponsors, error } = await supabase
      .from('event_sponsors')
      .select(`
        id,
        created_at,
        sponsors(
          id,
          name,
          address,
          contact_name,
          contact_email,
          contact_phone,
          logo_url,
          fulfilled,
          tier_id,
          tiers:tier_id(
            id,
            name,
            amount,
            type
          )
        )
      `)
      .eq('event_id', id)

    if (error) {
      console.error('Error fetching event sponsors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch event sponsors' },
        { status: 500 }
      )
    }

    // Transform the response
    const sponsors = eventSponsors.map((es: any) => ({
      ...es.sponsors,
      tier: es.sponsors.tiers || null,
      event_sponsor_id: es.id,
      event_id: id
    }))

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title
      },
      sponsors,
      sponsor_count: sponsors.length
    })
  } catch (error) {
    console.error('Error in GET /api/events/[id]/sponsors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/sponsors - Add sponsors to an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { sponsor_ids }: { sponsor_ids: string[] } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!sponsor_ids || !Array.isArray(sponsor_ids) || sponsor_ids.length === 0) {
      return NextResponse.json(
        { error: 'Sponsor IDs are required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if sponsors exist
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('id')
      .in('id', sponsor_ids)

    if (sponsorsError) {
      console.error('Error checking sponsors:', sponsorsError)
      return NextResponse.json(
        { error: 'Failed to verify sponsors' },
        { status: 500 }
      )
    }

    const foundSponsorIds = sponsors.map((s: any) => s.id)
    const missingSponsorIds = sponsor_ids.filter(id => !foundSponsorIds.includes(id))

    if (missingSponsorIds.length > 0) {
      return NextResponse.json(
        { error: `Sponsors not found: ${missingSponsorIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for existing associations to avoid duplicates
    const { data: existingAssociations, error: existingError } = await supabase
      .from('event_sponsors')
      .select('sponsor_id')
      .eq('event_id', id)
      .in('sponsor_id', sponsor_ids)

    if (existingError) {
      console.error('Error checking existing associations:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing associations' },
        { status: 500 }
      )
    }

    const existingSponsorIds = existingAssociations.map((ea: any) => ea.sponsor_id)
    const newSponsorIds = sponsor_ids.filter(id => !existingSponsorIds.includes(id))

    if (newSponsorIds.length === 0) {
      return NextResponse.json(
        { error: 'All sponsors are already associated with this event' },
        { status: 400 }
      )
    }

    // Create new associations
    const associations = newSponsorIds.map(sponsor_id => ({
      event_id: id,
      sponsor_id
    }))

    const { data: newAssociations, error: insertError } = await supabase
      .from('event_sponsors')
      .insert(associations)
      .select(`
        id,
        created_at,
        sponsors(
          id,
          name,
          address,
          contact_name,
          contact_email,
          contact_phone,
          logo_url,
          fulfilled,
          tier_id,
          tiers:tier_id(
            id,
            name,
            amount,
            type
          )
        )
      `)

    if (insertError) {
      console.error('Error creating sponsor associations:', insertError)
      return NextResponse.json(
        { error: 'Failed to add sponsors to event' },
        { status: 500 }
      )
    }

    // Transform the response
    const addedSponsors = newAssociations.map((es: any) => ({
      ...es.sponsors,
      tier: es.sponsors.tiers || null,
      event_sponsor_id: es.id,
      association_created_at: es.created_at
    }))

    return NextResponse.json({
      message: `Successfully added ${addedSponsors.length} sponsor(s) to the event`,
      added_sponsors: addedSponsors,
      skipped_sponsors: existingSponsorIds
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events/[id]/sponsors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id]/sponsors - Remove sponsors from an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { sponsor_ids }: { sponsor_ids: string[] } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!sponsor_ids || !Array.isArray(sponsor_ids) || sponsor_ids.length === 0) {
      return NextResponse.json(
        { error: 'Sponsor IDs are required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Remove associations
    const { data: deletedAssociations, error: deleteError } = await supabase
      .from('event_sponsors')
      .delete()
      .eq('event_id', id)
      .in('sponsor_id', sponsor_ids)
      .select(`
        sponsor_id,
        sponsors(name)
      `)

    if (deleteError) {
      console.error('Error removing sponsor associations:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove sponsors from event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Successfully removed ${deletedAssociations.length} sponsor(s) from the event`,
      removed_sponsors: deletedAssociations.map((da: any) => ({
        id: da.sponsor_id,
        name: da.sponsors.name
      }))
    })
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]/sponsors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}