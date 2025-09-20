import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateSponsorRequest, SponsorsResponse } from '@/types/sponsors'
import { calculateSponsorStatus } from '@/types/database'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    
    // Fetch all sponsors with their tier information
    let query = supabase
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
      .order('created_at', { ascending: false })
    
    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%,contact_name.ilike.%${search}%`)
    }
    
    const { data: sponsors, error } = await query

    if (error) {
      console.error('Error fetching sponsors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sponsors', details: error.message },
        { status: 500 }
      )
    }

    // Add calculated status to each sponsor and fix tier structure
    const sponsorsWithStatus = sponsors?.map((sponsor: any) => {
      const { tiers, ...sponsorData } = sponsor
      return {
        ...sponsorData,
        tier: tiers, // Rename tiers to tier for frontend compatibility
        status: calculateSponsorStatus({
          sponsorship_agreement_url: sponsor.sponsorship_agreement_url,
          receipt_url: sponsor.receipt_url,
          fulfilled: sponsor.fulfilled
        })
      }
    }) || []
    
    // Apply status filter if provided
    let filteredSponsors = sponsorsWithStatus
    if (status && status !== 'all') {
      filteredSponsors = sponsorsWithStatus.filter(sponsor => sponsor.status === status)
    }

    return NextResponse.json({
      sponsors: filteredSponsors,
      count: filteredSponsors.length
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/sponsors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}