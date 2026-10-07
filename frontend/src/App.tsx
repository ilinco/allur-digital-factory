import { Outlet } from 'react-router';
import { DashboardLayout } from '@/components/ui/dashboard/DashboardLayout';

function App() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default App;
