import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function SponsorsTiersPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Fetch all sponsors with their tier information
  const { data: sponsors, error: sponsorsError } = await supabase
    .from('sponsors')
    .select(`
      *,
      tiers (
        id,
        name,
        amount,
        type,
        created_at
      )
    `)
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Sponsors with Tiers</h1>
          <p className="text-gray-300">All sponsors showing their tier information</p>
        </div>

        {sponsorsError ? (
          <div className="bg-red-900 border border-red-600 p-4 rounded-lg mb-6">
            <h3 className="text-red-300 font-semibold">Error Loading Sponsors</h3>
            <p className="text-red-200">{sponsorsError.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sponsors && sponsors.length > 0 ? (
              sponsors.map((sponsor) => (
                <div key={sponsor.id} className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {sponsor.logo_url ? (
                        <div className="h-16 w-16 bg-gray-800 rounded flex items-center justify-center">
                          <img
                            src={sponsor.logo_url}
                            alt={`${sponsor.name} logo`}
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Sponsor Info */}
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-white mb-2">{sponsor.name}</h2>
                      
                      {/* Tier Information */}
                      {sponsor.tiers ? (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-blue-400">{sponsor.tiers.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              sponsor.tiers.type === 'Custom' 
                                ? 'bg-purple-600 text-purple-100'
                                : 'bg-blue-600 text-blue-100'
                            }`}>
                              {sponsor.tiers.type}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Amount:</span>
                              <span className="text-green-400 font-semibold">
                                {sponsor.tiers.amount ? `$${parseFloat(sponsor.tiers.amount).toLocaleString()}` : 'N/A'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tier ID:</span>
                              <span className="text-gray-300 font-mono text-xs">{sponsor.tiers.id}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-900 border border-red-600 p-3 rounded-lg">
                          <p className="text-red-300 text-sm">⚠️ No tier information available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sponsor Details */}
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Contact:</span>
                        <p className="text-gray-300">{sponsor.contact_name || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p className="text-gray-300 break-all">{sponsor.contact_email || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <p className="text-gray-300">{sponsor.contact_phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Fulfilled:</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          sponsor.fulfilled 
                            ? 'bg-green-600 text-green-100' 
                            : 'bg-yellow-600 text-yellow-100'
                        }`}>
                          {sponsor.fulfilled ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    {sponsor.address && (
                      <div className="mt-3">
                        <span className="text-gray-400">Address:</span>
                        <p className="text-gray-300">{sponsor.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents Status */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Document Status:</h4>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${sponsor.sponsorship_agreement_url ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-gray-400">Agreement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${sponsor.receipt_url ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-gray-400">Receipt</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${sponsor.logo_url ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-gray-400">Logo</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Sponsor ID: {sponsor.id}</span>
                      <span>Created: {new Date(sponsor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">No sponsors found.</p>
              </div>
            )}
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="bg-gray-800 p-4 rounded overflow-x-auto">
            <pre className="text-green-400 text-xs">
              <strong>Query Results:</strong>
              {JSON.stringify({ sponsors, sponsorsError }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}