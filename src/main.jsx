import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background text-primary">Loading...</div>}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
