/**
 * Utility functions for consistent date handling across the application
 * These functions prevent timezone issues by treating dates as local dates
 */

/**
 * Parse a date string (YYYY-MM-DD) as a local date to prevent timezone shifts
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date()
  
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

/**
 * Format a date string for display
 * @param dateString - Date in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a date string to include the weekday
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string with weekday
 */
export function formatDateWithWeekday(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get the weekday name for a date string
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Weekday name (e.g., "Monday")
 */
export function getWeekday(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Check if a date is in the past (before today)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if the date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const eventDate = parseLocalDate(dateString)
  const today = new Date()
  
  // Compare dates without time components
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return eventDateOnly < todayDateOnly
}

/**
 * Check if a date is today
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if the date is today
 */
export function isToday(dateString: string): boolean {
  const eventDate = parseLocalDate(dateString)
  const today = new Date()
  
  // Compare dates without time components
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return eventDateOnly.getTime() === todayDateOnly.getTime()
}

/**
 * Check if a date is in the future (after today)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if the date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const eventDate = parseLocalDate(dateString)
  const today = new Date()
  
  // Compare dates without time components
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return eventDateOnly > todayDateOnly
}

/**
 * Get event status based on date
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Object with status info
 */
export function getEventStatus(dateString: string): {
  status: 'today' | 'upcoming' | 'past'
  label: string
  color: string
} {
  if (isToday(dateString)) {
    return { status: 'today', label: 'Today', color: 'bg-green-100 text-green-800' }
  } else if (isFutureDate(dateString)) {
    return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
  } else {
    return { status: 'past', label: 'Past', color: 'bg-gray-100 text-gray-800' }
  }
}

/**
 * Convert a Date object to YYYY-MM-DD format for database storage
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForStorage(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return formatDateForStorage(new Date())
}