export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-gray-600">You do not have the necessary permissions to view this page.</p>
    </div>
  );
} 