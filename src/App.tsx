import { Route, Routes } from 'react-router-dom'
import './App.css'
import { HeroDetailPage } from './pages/HeroDetailPage'
import { HeroListPage } from './pages/HeroListPage'

function App() {
  return (
    <Routes>
      {/* Esta ruta es la pantalla principal (el listado). */}
      <Route path="/" element={<HeroListPage />} />

      {/* Esta ruta es la pantalla de detalle de un héroe. */}
      <Route path="/hero/:id" element={<HeroDetailPage />} />
    </Routes>
  )
}

export default App
