import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '192.168.254.219', // Bind to all network interfaces
    port: 5173, // Set a specific port (optional)
  }, 
})
