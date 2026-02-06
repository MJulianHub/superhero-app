import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Activamos React Router para poder navegar entre pantallas usando URLs. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
