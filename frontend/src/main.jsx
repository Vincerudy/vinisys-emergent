import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from 'bootstrap'
import './assets/scss/theme.scss'

console.log('🚀 Main.jsx loading...')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  console.log('✅ Root element found, rendering App...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error('❌ Root element not found!')
}
