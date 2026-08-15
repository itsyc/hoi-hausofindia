const path = require('path')

// Set default environment for Hostinger Web Hosting
process.env.NODE_ENV = 'production'
process.env.PORT = process.env.PORT || 3000
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0'

// Load Next.js Standalone Production Server
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js')

try {
  require(standaloneServer)
} catch (error) {
  console.error('Failed to start Next.js standalone server:', error)
  process.exit(1)
}
