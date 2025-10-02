import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    details?: string | null;
    created_at: string;
    event_sponsors?: Array<{
      id: string;
      sponsors?: {
        id: string;
        name: string;
        logo_url?: string;
        fulfilled: boolean;
      };
    }>;
  };
  showSponsors?: boolean;
  onViewMore?: () => void;
  userRole?: string;
  onEdit?: () => void;
}

export default function EventCard({ 
  event, 
  showSponsors = false, 
  onViewMore,
  userRole,
  onEdit 
}: EventCardProps) {
  const sponsorCount = event.event_sponsors?.length || 0;
  const fulfilledSponsors = event.event_sponsors?.filter(
    es => es.sponsors?.fulfilled
  ).length || 0;
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  // Get up to 3 sponsors for display
  const displaySponsors = event.event_sponsors?.slice(0, 3) || [];
  const hasMoreSponsors = sponsorCount > 3;

  return (
    <div className="dashboard-card hover:shadow-elegant-lg transition-all duration-200 group">
      {/* Event Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Event Description */}
      {event.details && (
        <div className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
          {event.details}
        </div>
      )}

      {/* Sponsors Section - Overlapping Avatars */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Overlapping Sponsor Logos */}
          {displaySponsors.length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {displaySponsors.map((eventSponsor, index) => {
                  const sponsor = eventSponsor.sponsors;
                  if (!sponsor) return null;
                  
                  return (
                    <div
                      key={eventSponsor.id}
                      className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                      style={{ zIndex: displaySponsors.length - index }}
                    >
                      {sponsor.logo_url ? (
                        <img 
                          src={sponsor.logo_url} 
                          alt={sponsor.name}
                          className="w-full h-full object-cover"
                          title={sponsor.name}
                        />
                      ) : (
                        <div 
                          className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
                          title={sponsor.name}
                        >
                          <span className="text-white font-medium text-xs">
                            {sponsor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Sponsor Count */}
              <div className="ml-3 text-sm text-gray-600 flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-medium">{sponsorCount}</span>
                <span>Sponsor{sponsorCount !== 1 ? 's' : ''}</span>
                {hasMoreSponsors && (
                  <span className="text-gray-500">({sponsorCount - 3} more)</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>No sponsors yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
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