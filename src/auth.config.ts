export const authConfig = {
  pages: {
    signIn: '/login', // Your login page route
    unauthorized: '/unauthorized', // A page to show if a user is not authorized
  },
  roles: {
    // Define which roles can access which paths
    // The key is the start of the path
    '/user-management': ['Admin', 'Super-Admin'],
    '/shopify': ['Admin', 'Super-Admin'],
    '/pinterest': ['Admin', 'Super-Admin'],
    '/design-library': ['Designer', 'Admin', 'Super-Admin'],
    '/settings': ['Admin', 'Super-Admin'],
  },
}; 