'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
  iconOnly?: boolean
}

export default function LogoutButton({ className = '', iconOnly = false }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={iconOnly ? 'Logout' : undefined}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {!iconOnly && <span className="ml-2">Signing out...</span>}
        </>
      ) : (
        <>
          <LogOut className={`w-4 h-4 ${!iconOnly ? 'mr-2' : ''}`} />
          {!iconOnly && <span>Logout</span>}
          
          {/* Tooltip for icon-only mode */}
          {iconOnly && (
            <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </>
      )}
    </button>
  )
}