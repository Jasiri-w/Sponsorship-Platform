'use client'

import SponsorForm from '@/components/SponsorForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function AddSponsorPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <SponsorForm />
    </ProtectedRoute>
  )
}
