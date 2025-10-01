'use client'

import { ChevronDown } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  className?: string
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = ""
}: FilterDropdownProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   text-gray-900 bg-white cursor-pointer
                   transition-colors duration-200"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )
}