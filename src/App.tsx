import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import SearchDashboard from './pages/SearchDashboard';
import MethodologyPage from './pages/MethodologyPage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ParticlesBg from './components/common/ParticlesBg';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container flex flex-col min-h-screen relative overflow-hidden bg-slate-950 text-slate-100">
          <ParticlesBg />
          <Navbar />
          <main className="main-content flex-grow relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <SearchDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
