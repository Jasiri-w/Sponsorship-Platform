'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  UserCog,
  ChevronLeft,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import Image from 'next/image'
import LogoutButton from './LogoutButton'

interface SidebarProps {
  className?: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export default function ModernSidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userData, setUserData] = useState<{ full_name?: string; role?: string }>({})
  const pathname = usePathname()

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, role')
          .eq('user_id', user.id)
          .single()
          
        if (profile) {
          setUserData({
            full_name: profile.full_name || 'User',
            role: profile.role
          })
        }
      }
    }
    
    fetchUserData()
  }, [])

  // Update main content margin when sidebar state changes
  useEffect(() => {
    const updateMargin = () => {
      const mainContent = document.getElementById('main-content-area')
      if (mainContent) {
        if (window.innerWidth >= 1024) {
          const marginLeft = isCollapsed ? '4rem' : '16rem' // 64px or 256px
          mainContent.style.marginLeft = marginLeft
          mainContent.style.transition = 'margin-left 0.3s ease-in-out'
        } else {
          mainContent.style.marginLeft = '0'
        }
      }
    }

    // Initial setup
    updateMargin()

    // Handle window resize
    window.addEventListener('resize', updateMargin)
    return () => window.removeEventListener('resize', updateMargin)
  }, [isCollapsed])

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Sponsors',
      href: '/sponsors',
      icon: Building2,
    },
    {
      label: 'Events',
      href: '/events',
      icon: Calendar,
    },
  ]

  const bottomNavItems: NavItem[] = [
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  // Admin/Manager navigation items
  const adminNavItems: NavItem[] = (userData.role === 'admin' || userData.role === 'manager') ? [
    {
      label: 'User Management',
      href: '/manage/users',
      icon: UserCog,
    },
  ] : [];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={`hidden lg:block ${className}`}>
      <div 
        className={`
          bg-white border-r border-gray-200 flex flex-col h-screen sidebar-transition
          fixed top-0 left-0 z-40
          ${isCollapsed ? 'w-20' : 'w-60'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Image src="/nsbe_logo.png" alt="Logo" width={32} height={32} />
              <h1 className="font-bold text-gray-900 text-lg">
                Sponsorship Platform
              </h1>
            </div>
          )}
          
          {isCollapsed && (
            <Image src="/nsbe_logo.png" alt="Logo" width={32} height={32} />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              p-1.5 rounded-lg hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'mx-auto mt-2' : ''}
            `}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft 
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scrollbar">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Main Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  group relative focus-ring
                  ${active 
                    ? 'bg-blue-50 text-blue-700 shadow-elegant' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-elegant'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon 
                  className={`
                    w-5 h-5 flex-shrink-0 transition-colors
                    ${active ? 'text-blue-600' : 'text-gray-500'}
                  `} 
                />
                
                {!isCollapsed && (
                  <>
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin Navigation */}
        {adminNavItems.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-2">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Administration
              </div>
            )}

            {adminNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    group relative focus-ring
                    ${active 
                      ? 'bg-purple-50 text-purple-700 shadow-elegant' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-elegant'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon 
                    className={`
                      w-5 h-5 flex-shrink-0 transition-colors
                      ${active ? 'text-purple-600' : 'text-gray-500'}
                    `} 
                  />
                  
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Account
            </div>
          )}

          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  group relative focus-ring
                  ${active 
                    ? 'bg-blue-50 text-blue-700 shadow-elegant' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-elegant'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon 
                  className={`
                    w-5 h-5 flex-shrink-0 transition-colors
                    ${active ? 'text-blue-600' : 'text-gray-500'}
                  `} 
                />
                
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}

          {/* User info and logout when expanded */}
          {!isCollapsed && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {userData.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <div className="px-3">
                <LogoutButton className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200" />
              </div>
            </div>
          )}
          
          {/* Logout button when collapsed */}
          {isCollapsed && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="px-3">
                <LogoutButton className="w-full flex items-center justify-center px-3 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 group relative" iconOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}