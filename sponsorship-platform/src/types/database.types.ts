// Database types
export type Tier = {
  id: string;
  name: string;
  amount: number | null;
  type: 'Standard' | 'Custom';
  created_at: string;
};

export type Sponsor = {
  id: string;
  name: string;
  address: string | null;
  tier_id: string;
  logo_url: string | null;
  sponsorship_agreement_url: string | null;
  receipt_url: string | null;
  fulfilled: boolean;
  created_at: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  updated_at: string;
  tier?: Tier; // For backward compatibility
  tiers?: Tier; // This is used in the join query
};

export type Event = {
  id: string;
  title: string;
  date: string; // ISO date string
  details: string | null;
  created_at: string;
};

export type EventSponsor = {
  id: string;
  event_id: string;
  sponsor_id: string;
  created_at: string;
  event?: Event; // Populated via joins
  sponsors?: Sponsor & {
    tiers?: Tier;
  };
  // For backward compatibility
  sponsor?: Sponsor;
};

export type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  role: 'user' | 'manager' | 'admin';
};

// Database response types
export type Database = {
  public: {
    Tables: {
      tiers: {
        Row: Tier;
      };
      sponsors: {
        Row: Sponsor;
      };
      events: {
        Row: Event;
      };
      event_sponsors: {
        Row: EventSponsor;
      };
      user_profiles: {
        Row: UserProfile;
      };
    };
  };
};
