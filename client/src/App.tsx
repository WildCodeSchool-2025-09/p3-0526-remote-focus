import { Outlet } from "react-router";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen lg:flex">
      <Navbar />

      <main className="min-h-screen flex-1 p-6 pb-24 lg:pb-6 lg:w-[79dvw]">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
