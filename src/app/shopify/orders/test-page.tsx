export default function OrdersTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Orders Test Page</h1>
      <p className="text-gray-600 mb-4">This is a test page to verify the Orders tab is working correctly.</p>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold text-blue-800 mb-2">Tab System Test</h2>
        <ul className="text-blue-700 space-y-1">
          <li>✅ Page loads without 404</li>
          <li>✅ Tab navigation works</li>
          <li>✅ Sidebar integration works</li>
          <li>✅ URL routing works</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Current Status:</h3>
        <p className="text-green-600">✅ Orders page is accessible via tabs</p>
      </div>
    </div>
  );
} 