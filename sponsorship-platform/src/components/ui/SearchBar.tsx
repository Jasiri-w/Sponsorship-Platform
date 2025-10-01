'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className = ""
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   placeholder-gray-400 text-gray-900 bg-white
                   transition-colors duration-200"
      />
    </div>
  )
}