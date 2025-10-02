export type UserRole = 'user' | 'manager' | 'admin'

export interface UserProfile {
  user_id: string
  full_name: string | null
  email: string
  role: UserRole
  is_approved: boolean
  created_at: string
  updated_at: string
}
