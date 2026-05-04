import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { SurveyPage } from './pages/SurveyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SurveyPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
