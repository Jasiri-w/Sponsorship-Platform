import PageHeader from '@/components/ui/PageHeader'
import ContentCard from '@/components/ui/ContentCard'

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Profile" 
        description="Manage your personal information and preferences"
      />

      <ContentCard title="User Profile">
        <p className="text-gray-600">Profile management coming soon...</p>
      </ContentCard>
    </div>
  )
}
