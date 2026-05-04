import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminHomePage } from './pages/AdminHomePage'
import { AdminLayout } from './pages/AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminResponsesPage } from './pages/AdminResponsesPage'
import { SurveyPage } from './pages/SurveyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SurveyPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminLoginPage />} />
        <Route path="home" element={<AdminHomePage />} />
        <Route path="responses" element={<AdminResponsesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
