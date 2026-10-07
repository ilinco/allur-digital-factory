import { Outlet } from "react-router";
import { DashboardLayout } from "@/components/ui/DashboardLayout";

function App() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default App;
