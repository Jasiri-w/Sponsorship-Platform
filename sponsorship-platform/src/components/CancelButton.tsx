'use client'

interface CancelButtonProps {
  className?: string
  children: React.ReactNode
}

export default function CancelButton({ className, children }: CancelButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className={className}
    >
      {children}
    </button>
  )
}