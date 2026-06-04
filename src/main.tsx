import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.tsx'
import { PersonalDataProvider } from './context/PersonalDataContext.tsx'
import { ChatHistoryProvider } from './context/ChatHistoryContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersonalDataProvider>
      <ChatHistoryProvider>
        <App />
        {/* Both proxy through /_vercel/insights/* so the strict CSP
            (default-src 'self') keeps working without any host
            additions. Privacy-first: no cookies, no PII. */}
        <Analytics />
        <SpeedInsights />
      </ChatHistoryProvider>
    </PersonalDataProvider>
  </StrictMode>,
)
