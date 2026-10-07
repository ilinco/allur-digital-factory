import { Outlet } from 'react-router';
import { DashboardLayout } from '@/components/ui/dashboard/DashboardLayout';
import { ErrorBoundary } from '@/components/ui/error/ErrorBoundary';

function App() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  );
}

export default App;
