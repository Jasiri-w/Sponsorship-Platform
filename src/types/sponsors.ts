export type SponsorStatus = 'Pending' | 'In Progress' | 'Completed' | 'Fulfilled'

export interface Sponsor {
  id: string
  name: string
  address?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  logo_url?: string | null
  sponsorship_agreement_url?: string | null
  receipt_url?: string | null
  fulfilled: boolean
  created_at?: string
  updated_at?: string
  tier_id: string  // Changed to required
  status?: SponsorStatus
  tier?: {
    id: string
    name: string
    amount: number
    type: string   // Changed to required as it has a default in DB
  } | null
}

export interface SponsorTier {
  id: string
  name: string
  amount: number
  type?: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateSponsorRequest {
  name: string
  address?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  logo_url?: string
  tier_id: string  // Changed to required
  sponsorship_agreement_url?: string
  receipt_url?: string
}

export interface UpdateSponsorRequest {
  name?: string
  address?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  logo_url?: string
  tier_id?: string
  sponsorship_agreement_url?: string
  receipt_url?: string
  fulfilled?: boolean
}

export interface SponsorsResponse {
  sponsors: Sponsor[]
  total: number
  page?: number
  limit?: number
}

export interface EventSponsor {
  id: string
  event_id: string
  sponsor_id: string
  created_at?: string
}

export interface CreateEventSponsorRequest {
  event_id: string
  sponsor_id: string
}

export interface EventSponsorResponse {
  event_sponsors: EventSponsor[]
  total: number
  page?: number
  limit?: number
}