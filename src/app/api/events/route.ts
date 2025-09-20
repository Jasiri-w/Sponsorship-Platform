import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { EventFilters, EventsResponse, CreateEventRequest } from '@/types/events'

// GET /api/events - Get all events with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const sponsorIds = searchParams.get('sponsor_ids')?.split(',').filter(Boolean)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build base query
    let query = supabase
      .from('events')
      .select(`
        *,
        event_sponsors(
          sponsor_id,
          sponsors(
            id,
            name,
            logo_url,
            tier_id,
            tiers:tier_id(
              id,
              name,
              amount
            )
          )
        )
      `)

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,details.ilike.%${search}%`)
    }

    // Apply date filters
    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error getting events count:', countError)
      return NextResponse.json(
        { error: 'Failed to get events count' },
        { status: 500 }
      )
    }

    // Execute main query with pagination
    const { data: events, error } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Transform data to include sponsors and sponsor count
    const eventsWithSponsors = events?.map((event: any) => ({
      ...event,
      sponsors: event.event_sponsors?.map((es: any) => ({
        id: es.sponsors.id,
        name: es.sponsors.name,
        tier: es.sponsors.tiers || null,
        logo_url: es.sponsors.logo_url
      })) || [],
      sponsor_count: event.event_sponsors?.length || 0
    })) || []

    // Remove the event_sponsors from each event to clean up the response
    const cleanEvents = eventsWithSponsors.map((event: any) => {
      const { event_sponsors, ...cleanEvent } = event
      return cleanEvent
    })

    const response: EventsResponse = {
      events: cleanEvents,
      total: totalCount || 0,
      page,
      limit
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Store recent request IDs to prevent duplicates (in production, use Redis or similar)
const recentRequests = new Map<string, number>()

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check for duplicate requests using request ID header
    const requestId = request.headers.get('X-Request-ID')
    if (requestId) {
      const now = Date.now()
      const lastRequestTime = recentRequests.get(requestId)
      
      // If same request was made within last 10 seconds, ignore it
      if (lastRequestTime && (now - lastRequestTime) < 10000) {
        console.log(`Ignoring duplicate request: ${requestId}`)
        return NextResponse.json(
          { error: 'Duplicate request ignored' },
          { status: 409 }
        )
      }
      
      // Store this request
      recentRequests.set(requestId, now)
      
      // Clean up old requests (older than 1 minute)
      for (const [id, time] of recentRequests.entries()) {
        if (now - time > 60000) {
          recentRequests.delete(id)
        }
      }
    }

    const body: CreateEventRequest = await request.json()
    const { title, date, details, sponsor_ids } = body

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const eventDate = new Date(date)
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        date,
        details
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error creating event:', eventError)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Add sponsor associations if provided
    if (sponsor_ids && sponsor_ids.length > 0) {
      const sponsorAssociations = sponsor_ids.map(sponsor_id => ({
        event_id: event.id,
        sponsor_id
      }))

      const { error: sponsorError } = await supabase
        .from('event_sponsors')
        .insert(sponsorAssociations)

      if (sponsorError) {
        console.error('Error creating sponsor associations:', sponsorError)
        // Note: Event is already created, but sponsor associations failed
        // You might want to implement rollback logic here
      }
    }

    // Fetch the complete event with sponsors
    const { data: completeEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_sponsors(
          sponsor_id,
          sponsors(
            id,
            name,
            logo_url,
            tier_id,
            tiers:tier_id(
              id,
              name,
              amount
            )
          )
        )
      `)
      .eq('id', event.id)
      .single()

    if (fetchError) {
      console.error('Error fetching created event:', fetchError)
      return NextResponse.json(event, { status: 201 })
    }

    // Transform the response
    const eventWithSponsors = {
      ...completeEvent,
      sponsors: completeEvent.event_sponsors?.map((es: any) => ({
        id: es.sponsors.id,
        name: es.sponsors.name,
        logo_url: es.sponsors.logo_url,
        tier: es.sponsors.tiers || null
      })) || [],
      sponsor_count: completeEvent.event_sponsors?.length || 0
    }

    // Remove the event_sponsors from the response
    delete eventWithSponsors.event_sponsors

    return NextResponse.json(eventWithSponsors, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}