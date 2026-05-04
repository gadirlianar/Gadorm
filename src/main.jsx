import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl animate-pulse-soft">🏫</span>
            <span className="text-[13px] font-medium text-labelTertiary tracking-wide">Loading...</span>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
