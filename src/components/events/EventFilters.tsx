'use client'

import { useState, useEffect } from 'react'
import { EventFilters } from '@/types/events'
import { Sponsor } from '@/types/sponsors'
import { Search, Calendar, Users, X } from 'lucide-react'

interface EventFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  onClearFilters: () => void
}

export function EventFiltersComponent({ filters, onFiltersChange, onClearFilters }: EventFiltersProps) {
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>([])
  const [loadingSponsors, setLoadingSponsors] = useState(false)
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch available sponsors for filtering
  useEffect(() => {
    const fetchSponsors = async () => {
      if (!mounted) return
      
      setLoadingSponsors(true)
      try {
        const response = await fetch('/api/sponsors')
        if (response.ok) {
          const data = await response.json()
          setAvailableSponsors(data.sponsors || [])
        }
      } catch (error) {
        console.error('Error fetching sponsors:', error)
      } finally {
        setLoadingSponsors(false)
      }
    }

    fetchSponsors()
  }, [mounted])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined })
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, date_from: e.target.value || undefined })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, date_to: e.target.value || undefined })
  }

  const handleSponsorToggle = (sponsorId: string) => {
    const currentSponsorIds = filters.sponsor_ids || []
    const newSponsorIds = currentSponsorIds.includes(sponsorId)
      ? currentSponsorIds.filter(id => id !== sponsorId)
      : [...currentSponsorIds, sponsorId]
    
    onFiltersChange({ 
      ...filters, 
      sponsor_ids: newSponsorIds.length > 0 ? newSponsorIds : undefined 
    })
  }

  const getSelectedSponsors = () => {
    if (!filters.sponsor_ids) return []
    return availableSponsors.filter(sponsor => filters.sponsor_ids!.includes(sponsor.id))
  }

  const removeSponsorFilter = (sponsorId: string) => {
    const newSponsorIds = (filters.sponsor_ids || []).filter(id => id !== sponsorId)
    onFiltersChange({ 
      ...filters, 
      sponsor_ids: newSponsorIds.length > 0 ? newSponsorIds : undefined 
    })
  }

  const hasActiveFilters = !!(
    filters.search || 
    filters.date_from || 
    filters.date_to || 
    (filters.sponsor_ids && filters.sponsor_ids.length > 0)
  )

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events by title or details..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="input w-full pl-10"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn-secondary whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            From Date
          </label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={handleDateFromChange}
            className="input w-full"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            To Date
          </label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={handleDateToChange}
            className="input w-full"
          />
        </div>

        {/* Sponsor Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="inline w-4 h-4 mr-1" />
            Filter by Sponsors
          </label>
          <button
            type="button"
            onClick={() => setShowSponsorDropdown(!showSponsorDropdown)}
            className="input w-full text-left flex items-center justify-between"
          >
            <span className="text-gray-500">
              {filters.sponsor_ids && filters.sponsor_ids.length > 0
                ? `${filters.sponsor_ids.length} sponsor${filters.sponsor_ids.length > 1 ? 's' : ''} selected`
                : 'Select sponsors...'
              }
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showSponsorDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Sponsor Dropdown */}
          {showSponsorDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loadingSponsors ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
              ) : availableSponsors.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No sponsors available
                </div>
              ) : (
                <div className="py-1">
                  {availableSponsors.map((sponsor) => (
                    <label
                      key={sponsor.id}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.sponsor_ids?.includes(sponsor.id) || false}
                        onChange={() => handleSponsorToggle(sponsor.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {sponsor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sponsor.tier?.name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
              Search: &ldquo;{filters.search}&rdquo;
              <button
                onClick={() => onFiltersChange({ ...filters, search: undefined })}
                className="ml-2 hover:text-primary-dark"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.date_from && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              From: {new Date(filters.date_from).toLocaleDateString()}
              <button
                onClick={() => onFiltersChange({ ...filters, date_from: undefined })}
                className="ml-2 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.date_to && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              To: {new Date(filters.date_to).toLocaleDateString()}
              <button
                onClick={() => onFiltersChange({ ...filters, date_to: undefined })}
                className="ml-2 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {getSelectedSponsors().map((sponsor) => (
            <span
              key={sponsor.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
            >
              {sponsor.name}
              <button
                onClick={() => removeSponsorFilter(sponsor.id)}
                className="ml-2 hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Close dropdown when clicking outside
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, handler])
}