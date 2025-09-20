import { Sponsor } from './sponsors'

export interface Event {
  id: string
  title: string
  date: string
  details?: string | null
  created_at?: string
  updated_at?: string
}

export interface EventSponsor {
  id: string
  event_id: string
  sponsor_id: string
  created_at?: string
}

export interface EventWithSponsors {
  id: string
  title: string
  date: string
  details?: string
  sponsor_count?: number
  created_at?: string
  sponsors: {
    id: string
    name: string
    logo_url?: string | null
    tier?: {
      id: string
      name: string
      amount: number
    }
  }[]
}

export interface CreateEventRequest {
  title: string
  date: string
  details?: string
  sponsor_ids?: string[]
}

export interface UpdateEventRequest {
  title?: string
  date?: string
  details?: string
  sponsor_ids?: string[]
}

export interface EventFilters {
  search?: string
  date_from?: string
  date_to?: string
  sponsor_ids?: string[]
}

export interface EventsResponse {
  events: EventWithSponsors[]
  total: number
  page?: number
  limit?: number
}

export interface AvailableSponsorsResponse {
  sponsors: Sponsor[]
  total: number
}