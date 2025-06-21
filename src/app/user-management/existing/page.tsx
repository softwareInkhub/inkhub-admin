'use client';

export default function ExistingUserPage() {
  // This would typically fetch and display a list of users.
  const users = [
    { id: 1, email: 'admin@example.com', role: 'Admin' },
    { id: 2, email: 'user1@example.com', role: 'User' },
    { id: 3, email: 'user2@example.com', role: 'User' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Existing Users</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <a href="#" className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{user.email}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 