import PageHeader from '@/components/ui/PageHeader'
import ContentCard from '@/components/ui/ContentCard'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Settings" 
        description="Manage your account and application preferences"
      />

      <ContentCard title="Application Settings">
        <p className="text-gray-600">Settings page coming soon...</p>
      </ContentCard>
    </div>
  )
}
