'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ModernSidebar from './ModernSidebar'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface SimpleAppLayoutProps {
  children: React.ReactNode
}

export default function SimpleAppLayout({ children }: SimpleAppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userData, setUserData] = useState<{ full_name?: string; role?: string }>({})
  const pathname = usePathname()

  // Fetch user data - Moved before any conditional returns
  useEffect(() => {
    async function fetchUserData() {
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

  // Don't apply layout to auth pages
  const authPages = ['/login', '/signup', '/auth']
  const isAuthPage = authPages.some(page => pathname.startsWith(page))
  
  if (isAuthPage) {
    return <>{children}</>
  }

  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Sponsors', href: '/sponsors' },
    { label: 'Events', href: '/events' },
    { label: 'Events & Sponsors', href: '/events-sponsors' },
    ...(userData.role === 'admin' || userData.role === 'manager' 
      ? [{ label: 'User Management', href: '/manage/users' }] 
      : [])
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Now Fixed */}
      <ModernSidebar />
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur-sm shadow-elegant border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image src="/nsbe_logo.png" alt="Logo" width={32} height={32} />
                <h1 className="font-bold text-gray-900 text-lg">
                  Sponsorship Platform
                </h1>
              </div>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-gray-100">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
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
                </div>
                
                <nav className="space-y-2 pt-4">
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        block px-4 py-2 rounded-lg font-medium text-sm transition-colors
                        ${isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 shadow-elegant'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-elegant'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Dynamic Left Margin */}
      <div className="min-h-screen">
        {/* Mobile content padding to account for fixed header */}
        <div className="lg:hidden h-16" /> 
        
        <main className="container mx-auto px-4 py-10 max-w-14xl" id="main-content-area">
          {children}
        </main>
      </div>
    </div>
  )
}