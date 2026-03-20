import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Pairing from './components/Pairing';
import BotList from './components/BotList';
import Developer from './components/Developer';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import NotificationPopup from './components/NotificationPopup';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBotAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Navbar />
      <LoginModal />
      <main>
        <Hero />
        <Pairing onBotAdded={handleBotAdded} />
        <BotList refreshTrigger={refreshTrigger} />
        <Developer />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] bg-grid text-[#ededed] selection:bg-white/30">
          <Toaster position="top-center" richColors theme="dark" />
          <NotificationPopup />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
