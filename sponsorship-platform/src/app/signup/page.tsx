import { signup } from './actions'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/nsbe_logo.png"
                alt="Logo"
                width={48}
                height={48}
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Sponsorship Platform
              </h1>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create your account</h2>
          <p className="text-gray-600">Join the platform to manage sponsors and events</p>
        </div>
        
        {/* Signup Form */}
        <div className="dashboard-card">
          <form className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                id="full_name" 
                name="full_name" 
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 bg-white transition-colors duration-200"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 bg-white transition-colors duration-200"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 bg-white transition-colors duration-200"
                placeholder="Create a secure password"
              />
            </div>
            
            <button 
              formAction={signup}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Create Account
            </button>
          </form>
        </div>
        
        {/* Sign in link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
