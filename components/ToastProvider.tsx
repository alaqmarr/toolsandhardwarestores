'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#12151b',
          color: '#f8fafc',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        },
        success: {
          iconTheme: {
            primary: '#f59e0b',
            secondary: '#12151b',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#12151b',
          },
        },
      }}
    />
  )
}
