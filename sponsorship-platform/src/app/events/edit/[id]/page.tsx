'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateEvent } from './actions'
import Breadcrumb from '@/components/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import CancelButton from '@/components/CancelButton'

interface Event {
  id: string
  title: string
  date: string
  details: string | null
  created_at: string
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    details: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single()

        // Check permissions
        if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
          setError('You do not have permission to edit events')
          setLoading(false)
          return
        }

        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()

        if (eventError || !eventData) {
          setError('Event not found')
          setLoading(false)
          return
        }

        setEvent(eventData)
        setFormData({
          title: eventData.title || '',
          date: new Date(eventData.date).toISOString().split('T')[0],
          details: eventData.details || ''
        })
      } catch (err) {
        console.error('Error fetching event data:', err)
        setError('An error occurred while loading the event data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const formDataObj = new FormData()
      formDataObj.append('id', id)
      formDataObj.append('title', formData.title)
      formDataObj.append('date', formData.date)
      formDataObj.append('details', formData.details)
      
      await updateEvent(formDataObj)
      router.push('/events')
      router.refresh()
    } catch (err) {
      console.error('Error updating event:', err)
      setError('An error occurred while updating the event')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Events', href: '/events' },
          { label: 'Loading...' }
        ]} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Events', href: '/events' },
          { label: 'Error' }
        ]} />
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mt-4">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/events')}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Events', href: '/events' },
          { label: 'Not Found' }
        ]} />
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mt-4">
          <h1 className="text-xl font-semibold text-yellow-800 mb-2">Event Not Found</h1>
          <p className="text-yellow-700">The requested event could not be found.</p>
          <button
            onClick={() => router.push('/events')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumb items={[
        { label: 'Events', href: '/events' },
        { label: 'Edit Event' }
      ]} />
      
      <PageHeader
        title="Edit Event"
        description="Update the event details below"
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-black">
          <input type="hidden" name="id" value={id} />
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                Event Details
              </label>
              <textarea
                id="details"
                name="details"
                rows={6}
                value={formData.details}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the event, including location, time, agenda, and other important information..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}