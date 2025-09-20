'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import SponsorForm from '@/components/SponsorForm'
import type { Sponsor } from '@/types/database'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function EditSponsorContent() {
  const params = useParams()
  const router = useRouter()
  const sponsorId = params?.id as string
  const [sponsor, setSponsor] = useState<Sponsor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sponsorId) {
      fetchSponsor()
    }
  }, [sponsorId])

  const fetchSponsor = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single()

      if (error) throw error
      setSponsor(data)
    } catch (error) {
      console.error('Error fetching sponsor:', error)
      setError('Failed to load sponsor information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="card">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sponsor) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2 inline" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sponsor</h1>
        </div>
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Sponsor</h3>
          <p className="text-gray-500 mb-6">
            {error || 'The sponsor you\'re trying to edit doesn\'t exist or has been removed.'}
          </p>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <SponsorForm sponsor={sponsor} isEditing={true} />
}

export default function EditSponsorPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <EditSponsorContent />
    </ProtectedRoute>
  )
}
