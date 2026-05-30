import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScenarioList } from './pages/ScenarioList'
import { InvestigationBoard } from './pages/InvestigationBoard'
import { JoinPage } from './pages/JoinPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScenarioList />} />
        <Route path="/:scenarioId/join" element={<JoinPage />} />
        <Route path="/:scenarioId" element={<InvestigationBoard />} />
      </Routes>
    </BrowserRouter>
  )
}
