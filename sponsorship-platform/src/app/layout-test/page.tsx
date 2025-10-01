export default function LayoutTestPage() {
  return (
    <div className="max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Layout Test Page</h1>
        <p className="text-gray-600">
          This page helps you test the sidebar behavior. Use the collapse/expand button in the sidebar to see how the content adjusts.
        </p>
      </div>

      {/* Visual indicators to show content positioning */}
      <div className="space-y-6">
        {/* Full-width colored sections to show content boundaries */}
        <div className="bg-red-100 border-2 border-red-300 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Red Section</h2>
          <p className="text-red-700">
            This red section should move when you collapse/expand the sidebar. 
            If it moves smoothly to the right/left, the sidebar is pushing content correctly.
          </p>
        </div>

        <div className="bg-blue-100 border-2 border-blue-300 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Blue Section</h2>
          <p className="text-blue-700">
            Watch this blue section as you toggle the sidebar. It should resize and reposition 
            smoothly without any content jumping or overlapping.
          </p>
        </div>

        <div className="bg-green-100 border-2 border-green-300 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Green Section</h2>
          <p className="text-green-700">
            The green section demonstrates how the entire content area adapts to the sidebar state.
            Content should never go under the sidebar.
          </p>
        </div>

        <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Yellow Section</h2>
          <p className="text-yellow-700">
            This yellow section shows the bottom content behavior. Everything should maintain 
            proper spacing and alignment during sidebar transitions.
          </p>
        </div>
      </div>

      {/* Grid to show responsive behavior */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Responsiveness Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-purple-100 border border-purple-300 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Card {i + 1}</h3>
              <p className="text-purple-700 text-sm mt-2">
                Grid cards should reflow properly when the sidebar changes size.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-100 border border-gray-300 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Testing Instructions</h2>
        <div className="text-gray-700 space-y-2">
          <p><strong>1.</strong> Look at the left sidebar and find the collapse/expand button (chevron icon)</p>
          <p><strong>2.</strong> Click the button to toggle between expanded (256px) and collapsed (64px) states</p>
          <p><strong>3.</strong> Observe how all the colored sections above move smoothly with the sidebar</p>
          <p><strong>4.</strong> Verify that no content goes under the sidebar or gets cut off</p>
          <p><strong>5.</strong> Check that the transition is smooth (300ms duration) without jerky movements</p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Expected Behavior:</strong> Content should be "pushed" to the right when sidebar expands, 
            and "pulled" to the left when sidebar collapses, with all content staying visible and properly aligned.
          </p>
        </div>
      </div>
    </div>
  )
}