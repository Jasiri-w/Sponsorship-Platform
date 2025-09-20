import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateSponsorRequest } from '@/types/sponsors'
import { calculateSponsorStatus } from '@/types/database'

// GET /api/sponsors/[id] - Get a specific sponsor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Sponsor ID is required' },
        { status: 400 }
      )
    }

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .select(`
        id,
        name,
        address,
        logo_url,
        sponsorship_agreement_url,
        receipt_url,
        fulfilled,
        contact_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at,
        tier_id,
        tiers:tier_id (
          id,
          name,
          amount,
          type
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sponsor not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching sponsor:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sponsor' },
        { status: 500 }
      )
    }

    // Add calculated status and fix tier structure
    const { tiers, ...sponsorData } = sponsor
    const sponsorWithStatus = {
      ...sponsorData,
      tier: tiers, // Rename tiers to tier for frontend compatibility
      status: calculateSponsorStatus({
        sponsorship_agreement_url: sponsor.sponsorship_agreement_url,
        receipt_url: sponsor.receipt_url,
        fulfilled: sponsor.fulfilled
      })
    }

    return NextResponse.json({ sponsor: sponsorWithStatus })
  } catch (error) {
    console.error('Error in GET /api/sponsors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/sponsors/[id] - Update a specific sponsor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateSponsorRequest = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Sponsor ID is required' },
        { status: 400 }
      )
    }

    // Check if sponsor exists
    const { data: existingSponsor, error: checkError } = await supabase
      .from('sponsors')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      )
    }

    // Update sponsor
    const { data: sponsor, error: updateError } = await supabase
      .from('sponsors')
      .update(body)
      .eq('id', id)
      .select(`
        id,
        name,
        address,
        logo_url,
        sponsorship_agreement_url,
        receipt_url,
        fulfilled,
        contact_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at,
        tier_id,
        tiers:tier_id (
          id,
          name,
          amount,
          type
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating sponsor:', updateError)
      return NextResponse.json(
        { error: 'Failed to update sponsor' },
        { status: 500 }
      )
    }

    // Add calculated status and fix tier structure
    const { tiers, ...sponsorData } = sponsor
    const sponsorWithStatus = {
      ...sponsorData,
      tier: tiers, // Rename tiers to tier for frontend compatibility
      status: calculateSponsorStatus({
        sponsorship_agreement_url: sponsor.sponsorship_agreement_url,
        receipt_url: sponsor.receipt_url,
        fulfilled: sponsor.fulfilled
      })
    }

    return NextResponse.json({ sponsor: sponsorWithStatus })
  } catch (error) {
    console.error('Error in PUT /api/sponsors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/sponsors/[id] - Toggle fulfilled status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { fulfilled } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Sponsor ID is required' },
        { status: 400 }
      )
    }

    if (typeof fulfilled !== 'boolean') {
      return NextResponse.json(
        { error: 'Fulfilled must be a boolean value' },
        { status: 400 }
      )
    }

    // Update only the fulfilled status
    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .update({ fulfilled })
      .eq('id', id)
      .select(`
        id,
        name,
        address,
        logo_url,
        sponsorship_agreement_url,
        receipt_url,
        fulfilled,
        contact_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at,
        tier_id,
        tiers:tier_id (
          id,
          name,
          amount,
          type
        )
      `)
      .single()

    if (error) {
      console.error('Error updating sponsor fulfilled status:', error)
      return NextResponse.json(
        { error: 'Failed to update sponsor status' },
        { status: 500 }
      )
    }

    // Add calculated status and fix tier structure
    const { tiers, ...sponsorData } = sponsor
    const sponsorWithStatus = {
      ...sponsorData,
      tier: tiers, // Rename tiers to tier for frontend compatibility
      status: calculateSponsorStatus({
        sponsorship_agreement_url: sponsor.sponsorship_agreement_url,
        receipt_url: sponsor.receipt_url,
        fulfilled: sponsor.fulfilled
      })
    }

    return NextResponse.json({ sponsor: sponsorWithStatus })
  } catch (error) {
    console.error('Error in PATCH /api/sponsors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/sponsors/[id] - Delete a specific sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Sponsor ID is required' },
        { status: 400 }
      )
    }

    // Check if sponsor exists
    const { data: existingSponsor, error: checkError } = await supabase
      .from('sponsors')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError || !existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      )
    }

    // Delete sponsor associations first (if any)
    const { error: eventSponsorDeleteError } = await supabase
      .from('event_sponsors')
      .delete()
      .eq('sponsor_id', id)

    if (eventSponsorDeleteError) {
      console.error('Error deleting sponsor associations:', eventSponsorDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete sponsor associations' },
        { status: 500 }
      )
    }

    // Delete the sponsor
    const { error: sponsorDeleteError } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id)

    if (sponsorDeleteError) {
      console.error('Error deleting sponsor:', sponsorDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete sponsor' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Sponsor deleted successfully',
        deleted_sponsor: existingSponsor
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/sponsors/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}