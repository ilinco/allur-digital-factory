import { Outlet } from "react-router";

function App() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  );
}

export default App;
