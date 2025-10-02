'use client'

import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  userRole?: string
  isApproved?: boolean
  isAuthenticated?: boolean
}

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  roles?: string[] // If undefined, available to all authenticated users
  requiresApproval?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

export default function Sidebar({ userRole, isApproved, isAuthenticated }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Define all navigation items organized by sections
  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
          ),
        },
      ]
    },
    {
      title: "Browse",
      items: [
        {
          name: "Sponsors",
          href: "/sponsors",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          ),
          requiresApproval: true
        },
        {
          name: "Events",
          href: "/events",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
            </svg>
          ),
          requiresApproval: true
        },
        {
          name: "Events & Sponsors",
          href: "/events-sponsors",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ),
          requiresApproval: true
        },
        {
          name: "Sponsor Tiers",
          href: "/sponsors-tiers",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2-2V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
            </svg>
          ),
          requiresApproval: true
        },
      ]
    },
    {
      title: "Manage Content",
      items: [
        {
          name: "Add Sponsor",
          href: "/sponsors/add",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
          roles: ['manager', 'admin'],
          requiresApproval: true
        },
        {
          name: "Add Event",
          href: "/events/add",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
          roles: ['manager', 'admin'],
          requiresApproval: true
        },
        {
          name: "Manage Event-Sponsors",
          href: "/manage/event-sponsors",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          roles: ['manager', 'admin'],
          requiresApproval: true
        },
      ]
    },
    {
      title: "Administration",
      items: [
        {
          name: "User Approvals",
          href: "/manage/user-approvals",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          roles: ['manager', 'admin'],
          requiresApproval: true
        },
        {
          name: "User Roles",
          href: "/manage/user-roles",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          roles: ['admin'],
          requiresApproval: true
        },
        {
          name: "Manage Tiers",
          href: "/manage/tiers",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          roles: ['admin'],
          requiresApproval: true
        },
      ]
    },
    {
      title: "Account",
      items: [
        {
          name: "Profile",
          href: "/profile",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          name: "Settings",
          href: "/settings",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ]
    }
  ]

  // Filter navigation items based on user permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    if (!isAuthenticated) return []
    
    return items.filter(item => {
      // Check if approval is required and user is approved
      if (item.requiresApproval && !isApproved) {
        return false
      }
      
      // Check role-based access
      if (item.roles && userRole) {
        return item.roles.includes(userRole)
      }
      
      // If no roles specified, item is available to all authenticated users
      return true
    })
  }

  // Helper function to check if current path is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-800">
              Sponsorship Platform
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => {
            const visibleItems = filterNavItems(section.items)
            
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1 px-2">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href)
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          active
                            ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <span className={`${active ? 'text-blue-600' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User info at bottom (when expanded) */}
        {!isCollapsed && isAuthenticated && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                  userRole === 'admin' ? 'bg-purple-600' :
                  userRole === 'manager' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {userRole?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {userRole || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Collapsed state logout button */}
        {isCollapsed && isAuthenticated && (
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Logout"
            >
              {isLoggingOut ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}