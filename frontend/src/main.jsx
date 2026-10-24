import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: 'https://6b507932b0a4303abc79aacb0362cb3f@o4512309989801984.ingest.us.sentry.io/4512310033776640',
  environment: window.location.hostname,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)