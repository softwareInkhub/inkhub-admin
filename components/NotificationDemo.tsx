'use client'

import { useNotifications } from '@/lib/notificationUtils'

export function NotificationDemo() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  const handleTestNotifications = () => {
    // Test different notification types
    showSuccess(
      'Test Success',
      'This is a test success notification. Everything is working perfectly!',
      {
        label: 'View Details',
        onClick: () => console.log('Success action clicked')
      }
    )

    setTimeout(() => {
      showError(
        'Test Error',
        'This is a test error notification. Something went wrong.',
        {
          label: 'Retry',
          onClick: () => console.log('Error action clicked')
        }
      )
    }, 1000)

    setTimeout(() => {
      showWarning(
        'Test Warning',
        'This is a test warning notification. Please check your settings.',
        {
          label: 'Fix Now',
          onClick: () => console.log('Warning action clicked')
        }
      )
    }, 2000)

    setTimeout(() => {
      showInfo(
        'Test Info',
        'This is a test info notification. Here is some useful information.',
        {
          label: 'Learn More',
          onClick: () => console.log('Info action clicked')
        }
      )
    }, 3000)
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Notification Demo</h3>
      <button 
        onClick={handleTestNotifications} 
        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Test Notifications
      </button>
      <p className="text-sm text-secondary-600 mt-2">
        Click the button above to test different notification types. Check the notification bell in the navbar.
      </p>
    </div>
  )
}
