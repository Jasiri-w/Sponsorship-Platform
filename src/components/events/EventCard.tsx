'use client'

import { useState, useEffect } from 'react'
import { EventWithSponsors } from '@/types/events'
import { Calendar, Users, MapPin, Edit, Trash2 } from 'lucide-react'
import { formatDate, getWeekday, isPastDate, isFutureDate, getEventStatus } from '@/lib/dateUtils'
import Link from 'next/link'

interface EventCardProps {
  event: EventWithSponsors
  onEdit?: (event: EventWithSponsors) => void
  onDelete?: (event: EventWithSponsors) => void
  showActions?: boolean
}

export function EventCard({ event, onEdit, onDelete, showActions = true }: EventCardProps) {
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])


  // Date functions now handled by utility functions imported above

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="card overflow-hidden">
        <div className="p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        {/* Event Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventStatus(event.date).color}`}
            >
              {getEventStatus(event.date).label}
            </span>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit?.(event)}
                className="p-2 text-salmon-600 hover:text-primary transition-colors"
                title="Edit event"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(event)}
                className="p-2 text-salmon-600 hover:text-red-500 transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            href={`/events/${event.id}`}
            className="hover:text-primary transition-colors"
          >
            {event.title}
          </Link>
        </h3>

        {/* Event Date */}
        <div className="flex items-center text-gray-600 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <span className="font-medium">{formatDate(event.date)}</span>
            <span className="text-sm ml-2 text-gray-500">({getWeekday(event.date)})</span>
          </div>
        </div>

        {/* Event Details */}
        {event.details && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.details}
          </p>
        )}

        {/* Sponsors */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {event.sponsor_count || 0} sponsor{(event.sponsor_count || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Sponsor Avatars */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="flex -space-x-2">
              {event.sponsors.slice(0, 3).map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                  title={sponsor.name}
                >
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={`${sponsor.name} logo`}
                      className="h-10 w-10 rounded-lg object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m-5 0v-5a2 2 0 012-2h6a2 2 0 012 2v5M7 7h.01M7 3h.01"></path></svg></div>'
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {sponsor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {event.sponsors.length > 3 && (
                <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{event.sponsors.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/events/${event.id}`}
            className="text-salmon-600 hover:text-primary-dark text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}