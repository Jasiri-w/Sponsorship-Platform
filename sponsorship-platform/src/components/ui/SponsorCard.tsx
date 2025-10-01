interface SponsorCardProps {
  sponsor: {
    id: string;
    name: string;
    logo_url?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    fulfilled: boolean;
    sponsorship_agreement_url?: string;
    receipt_url?: string;
    created_at: string;
    updated_at?: string;
    tiers?: {
      amount: number;
    };
  };
  showDetails?: boolean;
}

interface SponsorCardCompactProps {
  sponsor: SponsorCardProps['sponsor']
  showDetails?: boolean
  onViewMore?: () => void
  userRole?: string
  onEdit?: () => void
}

export default function SponsorCard({ 
  sponsor, 
  showDetails = true, 
  onViewMore, 
  userRole, 
  onEdit 
}: SponsorCardCompactProps) {
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'
  
  return (
    <div className="dashboard-card hover:shadow-elegant-lg transition-all duration-200 group">
      {/* Header with Logo and Basic Info */}
      <div className="flex items-start gap-4 mb-4">
        {/* Circular Logo */}
        <div className="flex-shrink-0">
          {sponsor.logo_url ? (
            <img
              src={sponsor.logo_url}
              alt={`${sponsor.name} logo`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200">
              <span className="text-white font-bold text-xl">
                {sponsor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Name and Tier */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{sponsor.name}</h3>
          {sponsor.tiers && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                sponsor.tiers.type === 'Custom' 
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {sponsor.tiers.name}
              </span>
              <span className="text-xs text-gray-500">{sponsor.tiers.type} Tier</span>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            sponsor.fulfilled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {sponsor.fulfilled ? 'Fulfilled' : 'Pending'}
          </span>
        </div>
      </div>
      
      {/* Amount */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-green-600">
          ${sponsor.tiers?.amount?.toLocaleString() || '0'}
        </p>
        <p className="text-sm text-gray-500">Sponsorship Amount</p>
      </div>

      {/* Quick Info */}
      <div className="space-y-2 text-sm mb-4">
        {sponsor.contact_name && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Contact:</span>
            <span className="text-gray-800 font-medium">{sponsor.contact_name}</span>
          </div>
        )}
        {sponsor.contact_email && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Email:</span>
            <span className="text-gray-800">{sponsor.contact_email}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            View Details
          </button>
        )}
        {isManagerOrAdmin && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}