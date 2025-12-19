import { Buffer } from 'buffer'

window.global = window.global ?? window
window.Buffer = window.Buffer ?? Buffer
window.process = window.process ?? { env: {} }

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
