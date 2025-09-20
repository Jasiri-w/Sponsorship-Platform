'use client'

import { useState, useEffect } from 'react'
import { Event, CreateEventRequest, UpdateEventRequest } from '@/types/events'
import { Sponsor } from '@/types/sponsors'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Update the sponsor interface to match the data structure
interface SponsorWithTier extends Sponsor {
  tier?: {
    id: string
    name: string
    amount: number
    type: string
  }
}

interface EventFormProps {
  event?: Event & { sponsors?: { id: string; name: string }[] }
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  availableSponsors?: SponsorWithTier[]
  loadingSponsors?: boolean
}

export function EventForm({ 
  event, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'create',
  availableSponsors = [],
  loadingSponsors = false
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date ? event.date.split('T')[0] : '', // Format for date input (YYYY-MM-DD)
    details: event?.details || '',
  })
  
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>(
    event?.sponsors?.map(s => s.id) || []
  )
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required'
    } else {
      const selectedDate = new Date(formData.date)
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Please enter a valid date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (submitting || isLoading) {
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      const submitData = {
        ...formData,
        sponsor_ids: selectedSponsors
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSponsorToggle = (sponsorId: string) => {
    setSelectedSponsors(prev => 
      prev.includes(sponsorId) 
        ? prev.filter(id => id !== sponsorId)
        : [...prev, sponsorId]
    )
  }

  const handleSelectAllSponsors = () => {
    setSelectedSponsors(availableSponsors.map(s => s.id))
  }

  const handleClearAllSponsors = () => {
    setSelectedSponsors([])
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`input w-full ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter event title"
          disabled={isLoading || submitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Event Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Event Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className={`input w-full ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          disabled={isLoading || submitting}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      {/* Event Details */}
      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
          Event Details
        </label>
        <textarea
          id="details"
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          rows={4}
          className="input w-full resize-none"
          placeholder="Enter event description and details..."
          disabled={isLoading || submitting}
        />
      </div>

      {/* Sponsor Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Event Sponsors ({selectedSponsors.length} selected)
          </label>
          {availableSponsors.length > 0 && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAllSponsors}
                className="text-sm text-salmon-600 hover:text-salmon-700"
                disabled={isLoading || submitting}
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAllSponsors}
                className="text-sm text-gray-500 hover:text-gray-700"
                disabled={isLoading || submitting}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {loadingSponsors ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-salmon-500"></div>
            <span className="ml-2 text-sm text-gray-500">Loading sponsors...</span>
          </div>
        ) : availableSponsors.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No sponsors available</p>
            <Link 
              href="/sponsors/add" 
              className="inline-flex items-center mt-2 text-sm text-salmon-600 hover:text-salmon-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add a new sponsor
            </Link>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 max-h-[400px] overflow-y-auto">
              {availableSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`flex items-start space-x-4 p-4 bg-white transition-colors ${
                    selectedSponsors.includes(sponsor.id)
                      ? 'bg-salmon-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      id={`sponsor-${sponsor.id}`}
                      checked={selectedSponsors.includes(sponsor.id)}
                      onChange={() => handleSponsorToggle(sponsor.id)}
                      className="w-4 h-4 rounded border-gray-300 text-salmon-600 
                        focus:ring-salmon-500 focus:ring-offset-0"
                      disabled={isLoading || submitting}
                    />
                  </div>
                  <label
                    htmlFor={`sponsor-${sponsor.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {/* Sponsor Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {sponsor.name}
                        </span>
                        {sponsor.contact_name && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Contact: {sponsor.contact_name}
                          </p>
                        )}
                      </div>
                      {sponsor.tier && (
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full 
                          text-xs font-medium shrink-0 ml-2
                          ${getTierStyles(sponsor.tier.name)}
                        `}>
                          {sponsor.tier.name}
                        </span>
                      )}
                    </div>

                    {/* Sponsor Details */}
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {sponsor.tier?.amount && (
                        <div className="col-span-2">
                          <span className="text-sm font-medium text-salmon-600">
                            ${sponsor.tier.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading || submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || submitting}
        >
          {(isLoading || submitting) ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            mode === 'create' ? 'Create Event' : 'Update Event'
          )}
        </button>
      </div>
    </form>
  )
}

function getTierStyles(tierName: string) {
  const styles = {
    'Diamond': 'bg-gray-900 text-white',
    'Emerald': 'bg-emerald-100 text-emerald-800',
    'Gold': 'bg-yellow-100 text-yellow-800',
    'Silver': 'bg-cyan-100 text-cyan-800',
    'Bronze': 'bg-orange-100 text-orange-800',
    'Quartz': 'bg-white text-black border border-gray-200',
  }
  return styles[tierName as keyof typeof styles] || 'bg-gray-100 text-gray-800'
}