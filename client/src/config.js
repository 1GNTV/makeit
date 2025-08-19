// Configuration for different environments
const config = {
  development: {
    socketUrl: 'http://localhost:3001',
    uploadUrl: 'http://localhost:3001/upload'
  },
  production: {
    // Replace with your actual backend URL when deployed
    socketUrl: 'https://your-backend-domain.com',
    uploadUrl: 'https://your-backend-domain.com/upload'
  }
}

// Get current environment
const env = import.meta.env.MODE || 'development'

// Export current config
export const currentConfig = config[env]

// Export individual values
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || currentConfig.socketUrl
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || currentConfig.uploadUrl
