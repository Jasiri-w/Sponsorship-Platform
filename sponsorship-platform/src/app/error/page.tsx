'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-300 mb-6">
          We encountered an error while processing your request. This could be due to an authentication issue or a server error.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Login
          </Link>
          
          <Link 
            href="/signup" 
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  )
}
