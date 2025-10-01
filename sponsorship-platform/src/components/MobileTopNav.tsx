'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileTopNavProps {
  userRole?: string
  isApproved?: boolean
  isAuthenticated?: boolean
}

export default function MobileTopNav({ userRole, isApproved, isAuthenticated }: MobileTopNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Don't render on auth pages
  const authPages = ['/login', '/signup', '/auth']
  const isAuthPage = authPages.some(page => pathname.startsWith(page))

  if (!isAuthenticated || isAuthPage) {
    return null
  }

  const quickNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sponsors', href: '/sponsors', requiresApproval: true },
    { name: 'Events', href: '/events', requiresApproval: true },
    { name: 'Events & Sponsors', href: '/events-sponsors', requiresApproval: true },
  ]

  const filteredNavItems = quickNavItems.filter(item => {
    if (item.requiresApproval && !isApproved) return false
    return true
  })

  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Sponsorship Platform
            </h1>
            {!isApproved && (
              <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Pending Approval
              </span>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}

            {/* User info */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                  userRole === 'admin' ? 'bg-purple-600' :
                  userRole === 'manager' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {userRole?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-800 capitalize">
                    {userRole || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isApproved ? 'Approved' : 'Pending Approval'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}