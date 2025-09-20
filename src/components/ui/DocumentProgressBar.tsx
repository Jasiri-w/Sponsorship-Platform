'use client'

import { FileText, Receipt, CheckCircle, Clock } from 'lucide-react'

interface DocumentProgressBarProps {
  hasAgreement: boolean
  hasReceipt: boolean
  className?: string
}

export function DocumentProgressBar({ hasAgreement, hasReceipt, className = '' }: DocumentProgressBarProps) {
  // Calculate progress: 0% = no documents, 50% = agreement only, 100% = both
  const getProgress = () => {
    if (hasAgreement && hasReceipt) return 100
    if (hasAgreement || hasReceipt) return 50
    return 0
  }

  const progress = getProgress()

  const getProgressColor = () => {
    if (progress === 100) return 'bg-green-500'
    if (progress === 50) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const getProgressText = () => {
    if (progress === 100) return 'Complete'
    if (progress === 50) return 'In Progress'
    return 'Not Started'
  }

  const getProgressIcon = () => {
    if (progress === 100) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (progress === 50) return <Clock className="h-4 w-4 text-yellow-600" />
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Document Completion</h3>
        <div className="flex items-center space-x-2">
          {getProgressIcon()}
          <span className={`text-sm font-medium ${
            progress === 100 ? 'text-green-700' : 
            progress === 50 ? 'text-yellow-700' : 
            'text-gray-500'
          }`}>
            {getProgressText()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
            hasAgreement ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {hasAgreement ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${hasAgreement ? 'text-green-700' : 'text-gray-500'}`}>
              Sponsorship Agreement
            </p>
            <p className="text-xs text-gray-400">
              {hasAgreement ? 'Document uploaded' : 'Awaiting document'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
            hasReceipt ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {hasReceipt ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Receipt className="h-3 w-3" />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${hasReceipt ? 'text-green-700' : 'text-gray-500'}`}>
              Payment Receipt
            </p>
            <p className="text-xs text-gray-400">
              {hasReceipt ? 'Document uploaded' : 'Awaiting document'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-600">
          {progress === 100 && 'All required documents have been uploaded'}
          {progress === 50 && 'One document uploaded, one remaining'}
          {progress === 0 && 'No documents uploaded yet'}
        </p>
      </div>
    </div>
  )
}