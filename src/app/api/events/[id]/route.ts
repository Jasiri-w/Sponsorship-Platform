import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateEventRequest } from '@/types/events'

// GET /api/events/[id] - Get a specific event
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

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        event_sponsors(
          id,
          sponsor_id,
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
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching event:', error)
      return NextResponse.json(
        { error: 'Failed to fetch event' },
        { status: 500 }
      )
    }

    // Transform the response
    const eventWithSponsors = {
      ...event,
      sponsors: event.event_sponsors?.map((es: any) => ({
        id: es.sponsors.id,
        name: es.sponsors.name,
        address: es.sponsors.address,
        contact_name: es.sponsors.contact_name,
        contact_email: es.sponsors.contact_email,
        contact_phone: es.sponsors.contact_phone,
        logo_url: es.sponsors.logo_url,
        fulfilled: es.sponsors.fulfilled,
        tier: es.sponsors.tiers || null,
        event_sponsor_id: es.id
      })) || [],
      sponsor_count: event.event_sponsors?.length || 0
    }

    // Remove the nested event_sponsors from the response
    delete eventWithSponsors.event_sponsors

    return NextResponse.json({ event: eventWithSponsors })
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update a specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateEventRequest = await request.json()
    const { title, date, details, sponsor_ids } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Check if event exists
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Validate date if provided
    if (date) {
      const eventDate = new Date(date)
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
    }

    // Update event details
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (date !== undefined) updateData.date = date
    if (details !== undefined) updateData.details = details

    let updatedEvent = existingEvent
    if (Object.keys(updateData).length > 0) {
      const { data: event, error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating event:', updateError)
        return NextResponse.json(
          { error: 'Failed to update event' },
          { status: 500 }
        )
      }
      updatedEvent = event
    }

    // Handle sponsor associations if provided
    if (sponsor_ids !== undefined) {
      // Remove existing sponsor associations
      const { error: deleteError } = await supabase
        .from('event_sponsors')
        .delete()
        .eq('event_id', id)

      if (deleteError) {
        console.error('Error removing sponsor associations:', deleteError)
        return NextResponse.json(
          { error: 'Failed to update sponsor associations' },
          { status: 500 }
        )
      }

      // Add new sponsor associations
      if (sponsor_ids.length > 0) {
        const sponsorAssociations = sponsor_ids.map(sponsor_id => ({
          event_id: id,
          sponsor_id
        }))

        const { error: insertError } = await supabase
          .from('event_sponsors')
          .insert(sponsorAssociations)

        if (insertError) {
          console.error('Error adding sponsor associations:', insertError)
          return NextResponse.json(
            { error: 'Failed to update sponsor associations' },
            { status: 500 }
          )
        }
      }
    }

    // Fetch the complete updated event with sponsors
    const { data: completeEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_sponsors(
          id,
          sponsor_id,
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
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated event:', fetchError)
      return NextResponse.json({ event: updatedEvent })
    }

    // Transform the response
    const eventWithSponsors = {
      ...completeEvent,
      sponsors: completeEvent.event_sponsors?.map((es: any) => ({
        id: es.sponsors.id,
        name: es.sponsors.name,
        address: es.sponsors.address,
        contact_name: es.sponsors.contact_name,
        contact_email: es.sponsors.contact_email,
        contact_phone: es.sponsors.contact_phone,
        logo_url: es.sponsors.logo_url,
        fulfilled: es.sponsors.fulfilled,
        tier: es.sponsors.tiers || null,
        event_sponsor_id: es.id
      })) || [],
      sponsor_count: completeEvent.event_sponsors?.length || 0
    }

    // Remove the nested event_sponsors from the response
    delete eventWithSponsors.event_sponsors

    return NextResponse.json({ event: eventWithSponsors })
  } catch (error) {
    console.error('Error in PUT /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete a specific event
export async function DELETE(
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
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', id)
      .single()

    if (checkError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Delete sponsor associations first (due to foreign key constraints)
    const { error: sponsorDeleteError } = await supabase
      .from('event_sponsors')
      .delete()
      .eq('event_id', id)

    if (sponsorDeleteError) {
      console.error('Error deleting sponsor associations:', sponsorDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete event associations' },
        { status: 500 }
      )
    }

    // Delete the event
    const { error: eventDeleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (eventDeleteError) {
      console.error('Error deleting event:', eventDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Event deleted successfully',
        deleted_event: existingEvent
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}