'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  Menu, 
  X,
  Plus,
  User,
  LogIn,
  LogOut,
  Clock,
  Shield,
  Crown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const baseNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Sponsors', href: '/sponsors', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
]

const sponsorshipChairNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { 
    user, 
    userProfile, 
    loading, 
    isAuthenticated, 
    isEmailVerified,
    isApproved, 
    isSponsorshipChair,
    userStatus,
    canAccessSettings,
    signOut 
  } = useAuth()
  
  // Combine navigation items based on permissions
  const navigation = [
    ...baseNavigation,
    ...(canAccessSettings() ? sponsorshipChairNavigation : [])
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="layout-container">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-salmon-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 heading-xs text-gray-900">Sponsorship Manager</span>
                </div>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    {isSponsorshipChair && (
                      <Crown className="h-4 w-4 text-purple-500" title="Sponsorship Chair" />
                    )}
                    {!isEmailVerified && (
                      <Clock className="h-4 w-4 text-blue-500" title="Email not verified" />
                    )}
                    {isEmailVerified && !isApproved && (
                      <Clock className="h-4 w-4 text-yellow-500" title="Pending approval" />
                    )}
                    <button
                      onClick={handleSignOut}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/auth/login" className="p-1 text-gray-400 hover:text-gray-600" title="Sign In">
                    <LogIn className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-spartan-medium rounded-md ${
                      isActive
                        ? 'bg-salmon-100 text-salmon-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-salmon-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white ">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto pt-16">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center justify-between w-full pt-16">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-salmon-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 heading-xs text-gray-900">Sponsorship Manager</span>
                </div>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    {isSponsorshipChair && (
                      <Crown className="h-4 w-4 text-purple-500" title="Sponsorship Chair" />
                    )}
                    {!isEmailVerified && (
                      <Clock className="h-4 w-4 text-blue-500" title="Email not verified" />
                    )}
                    {isEmailVerified && !isApproved && (
                      <Clock className="h-4 w-4 text-yellow-500" title="Pending approval" />
                    )}
                    <button
                      onClick={handleSignOut}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/auth/login" className="p-1 text-gray-400 hover:text-gray-600" title="Sign In">
                    <LogIn className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-spartan-medium rounded-md ${
                      isActive
                        ? 'bg-salmon-100 text-salmon-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-salmon-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-salmon-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-salmon-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}