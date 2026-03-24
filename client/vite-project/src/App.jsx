import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SystemDesignerAuth from "./pages/SystemDesignerAuth";
import MemberAuth from "./pages/MemberAuth";
import Aurora from "./components/Aurora"; // use your Aurora component file

function AppShell({ children }) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 bg-black" />

      <div className="pointer-events-none fixed inset-0 z-10">
        <Aurora
          colorStops={["#ec4b22", "#a3f5d6", "#89fb6a"]}
          blend={0.64}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="relative z-20">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth/system-designer"
            element={<SystemDesignerAuth />}
          />
          <Route path="/auth/member" element={<MemberAuth />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen grid place-items-center text-white">
                <div className="text-center">
                  <h1 className="text-2xl font-semibold">Page not found</h1>
                  <Link
                    to="/"
                    className="text-white underline underline-offset-2 hover:opacity-80"
                  >
                    Go home
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
