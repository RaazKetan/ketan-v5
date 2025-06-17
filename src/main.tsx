import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PersonalDataProvider } from './context/PersonalDataContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersonalDataProvider>
    <App />
    </PersonalDataProvider>
  </StrictMode>,
)
