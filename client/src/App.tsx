import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar";

function App() {
  return (
    <div className="min-h-screen lg:flex">
      <Navbar />

      <main className="min-h-screen flex-1 p-6 pb-24 lg:pb-6">
        <Outlet />
      </main>

      <MobileNavbar />
    </div>
  );
}

export default App;
