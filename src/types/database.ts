export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tiers: {
        Row: {
          id: string
          name: string
          type: 'Standard' | 'Custom'
          amount: number    // Removed null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'Standard' | 'Custom'
          amount: number    // Removed optional and null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'Standard' | 'Custom'
          amount?: number   // Removed null, kept optional for partial updates
          created_at?: string
          updated_at?: string
        }
      }
      sponsors: {
        Row: {
          id: string
          name: string
          tier_id: string
          fulfilled: boolean
          address: string | null
          logo_url: string | null
          sponsorship_agreement_url: string | null
          receipt_url: string | null
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier_id: string
          fulfilled?: boolean
          address?: string | null
          logo_url?: string | null
          sponsorship_agreement_url?: string | null
          receipt_url?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier_id?: string
          fulfilled?: boolean
          address?: string | null
          logo_url?: string | null
          sponsorship_agreement_url?: string | null
          receipt_url?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          details?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_sponsors: {
        Row: {
          id: string
          event_id: string
          sponsor_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          sponsor_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          sponsor_id?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          is_approved: boolean
          role: 'user' | 'sponsorship_chair'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          is_approved?: boolean
          role?: 'user' | 'sponsorship_chair'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          is_approved?: boolean
          role?: 'user' | 'sponsorship_chair'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for basic tables
export type Tier = Database['public']['Tables']['tiers']['Row']
export type Sponsor = Database['public']['Tables']['sponsors']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventSponsor = Database['public']['Tables']['event_sponsors']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type NewTier = Database['public']['Tables']['tiers']['Insert']
export type NewSponsor = Database['public']['Tables']['sponsors']['Insert']
export type NewEvent = Database['public']['Tables']['events']['Insert']
export type NewEventSponsor = Database['public']['Tables']['event_sponsors']['Insert']
export type NewUserProfile = Database['public']['Tables']['user_profiles']['Insert']

export type UpdateTier = Database['public']['Tables']['tiers']['Update']
export type UpdateSponsor = Database['public']['Tables']['sponsors']['Update']
export type UpdateEvent = Database['public']['Tables']['events']['Update']
export type UpdateEventSponsor = Database['public']['Tables']['event_sponsors']['Update']
export type UpdateUserProfile = Database['public']['Tables']['user_profiles']['Update']

// Sponsor status enum based on document count and fulfilled state
export type SponsorStatus = 'Pending' | 'In Progress' | 'Completed' | 'Fulfilled'

// User role types
export type UserRole = 'user' | 'sponsorship_chair'

// Permission levels for access control
export type PermissionLevel = 'public' | 'authenticated' | 'approved' | 'sponsorship_chair'

// User status for UI display
export type UserStatus = 'pending_verification' | 'pending_approval' | 'approved' | 'rejected'

// Extended types with relationships
export interface SponsorWithTier extends Sponsor {
  tier: Tier
  status?: SponsorStatus
}

export interface EventWithSponsors extends Event {
  sponsors: SponsorWithTier[]
  event_sponsors: EventSponsor[]
}

export interface SponsorWithEvents extends SponsorWithTier {
  events: Event[]
  event_sponsors: EventSponsor[]
}

// Form types for components
export interface SponsorFormData {
  name: string
  tier_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  fulfilled: boolean
  address?: string
  sponsorship_agreement_url?: string
  receipt_url?: string
}

export interface EventFormData {
  title: string
  date: string
  details: string
  sponsor_ids: string[] // Array of sponsor IDs
}

export interface TierFormData {
  name: string
  type: 'Standard' | 'Custom'
  amount: number
}

// Helper function to calculate sponsor status based on documents and fulfilled state
export function calculateSponsorStatus(sponsor: {
  sponsorship_agreement_url?: string | null
  receipt_url?: string | null
  fulfilled: boolean
}): SponsorStatus {
  if (sponsor.fulfilled) {
    return 'Fulfilled'
  }
  
  const documentCount = [
    sponsor.sponsorship_agreement_url,
    sponsor.receipt_url
  ].filter(url => url && url.trim() !== '').length
  
  switch (documentCount) {
    case 0:
      return 'Pending'
    case 1:
      return 'In Progress'
    case 2:
    default:
      return 'Completed'
  }
}
