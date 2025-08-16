import { useNotificationStore } from './notificationStore'
import { Notification } from '@/components/NotificationDropdown'

export const useNotifications = () => {
  const { addNotification } = useNotificationStore()

  const showNotification = (
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    addNotification({
      title,
      message,
      type,
      action
    })
  }

  const showSuccess = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    showNotification(title, message, 'success', action)
  }

  const showError = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    showNotification(title, message, 'error', action)
  }

  const showWarning = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    showNotification(title, message, 'warning', action)
  }

  const showInfo = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    showNotification(title, message, 'info', action)
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// Global notification functions (can be used outside of React components)
export const addGlobalNotification = (
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  action?: { label: string; onClick: () => void }
) => {
  const { addNotification } = useNotificationStore.getState()
  addNotification({
    title,
    message,
    type,
    action
  })
}

export const addGlobalSuccess = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
  addGlobalNotification(title, message, 'success', action)
}

export const addGlobalError = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
  addGlobalNotification(title, message, 'error', action)
}

export const addGlobalWarning = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
  addGlobalNotification(title, message, 'warning', action)
}

export const addGlobalInfo = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
  addGlobalNotification(title, message, 'info', action)
}
