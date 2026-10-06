import { Outlet } from "react-router";

function App() {
  return (
    <div className="min-h-dvh bg-[#f6f6f6] text-slate-900">
      <Outlet />
    </div>
  );
}

export default App;
