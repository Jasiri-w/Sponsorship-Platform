import { logout } from './actions'

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign Out</h1>
        <p className="text-gray-300 text-center mb-6">
          Are you sure you want to sign out of your account?
        </p>
        <form className="space-y-4">
          <button 
            formAction={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}