export default function FontTest() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">League Spartan Font Test</h2>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Heading 1 - The quick brown fox</h1>
          </div>
          
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Heading 2 - jumps over the lazy dog</h2>
          </div>
          
          <div>
            <h3 className="text-2xl font-medium text-gray-700">Heading 3 - Lorem ipsum dolor sit amet</h3>
          </div>
          
          <div>
            <p className="text-lg text-gray-600">
              Large paragraph text - consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          
          <div>
            <p className="text-base text-gray-600">
              Regular paragraph text - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">
              Small text - Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="font-light text-gray-600">Light (300)</p>
              <p className="font-light text-2xl">Aa Bb Cc</p>
            </div>
            <div className="text-center">
              <p className="font-normal text-gray-600">Regular (400)</p>
              <p className="font-normal text-2xl">Aa Bb Cc</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">Medium (500)</p>
              <p className="font-medium text-2xl">Aa Bb Cc</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-600">Semibold (600)</p>
              <p className="font-semibold text-2xl">Aa Bb Cc</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-600">Bold (700)</p>
              <p className="font-bold text-2xl">Aa Bb Cc</p>
            </div>
            <div className="text-center">
              <p className="font-black text-gray-600">Black (900)</p>
              <p className="font-black text-2xl">Aa Bb Cc</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Dark Background Test</h3>
        <p className="text-gray-100">
          League Spartan should look great on dark backgrounds too. This tests the contrast and readability.
        </p>
      </div>
    </div>
  )
}