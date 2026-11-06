import { Navigate, Route, Routes } from 'react-router'
import Header from './components/Header/Header.tsx'
import Sidebar from './components/Sidebar/Sidebar.tsx'
import { AssetsProvider } from './context/AssetsProvider.tsx'
import AssetsPage from './pages/AssetsPage/AssetsPage.tsx'
import DashboardPage from './pages/DashboardPage/DashboardPage.tsx'
import MaintenanceRecordsPage from './pages/MaintenanceRecordsPage/MaintenanceRecordsPage.tsx'
import ScheduledMaintenancePage from './pages/ScheduledMaintenancePage/ScheduledMaintenancePage.tsx'

function App() {
  return (
    <AssetsProvider>
      <div className="flex h-dvh flex-col">
        <Header />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-8">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/dashboard/:assetId/maintenance-records"
                element={<MaintenanceRecordsPage />}
              />
              <Route
                path="/dashboard/:assetId/scheduled-maintenance"
                element={<ScheduledMaintenancePage />}
              />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AssetsProvider>
  )
}

export default App
