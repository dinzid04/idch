import { Terminal, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, userData, limit, isAdmin, openLoginModal, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-white" />
          <span className="font-mono font-medium text-sm tracking-tight text-white">HuTao_MD</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <a href="/#clone" className="hover:text-white transition-colors">Deploy</a>
          <a href="/#my-bots" className="hover:text-white transition-colors">Instances</a>
          <a href="/#developer" className="hover:text-white transition-colors">Author</a>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
              <ShieldAlert className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-white font-medium">{user.displayName || user.email}</span>
                  <span className="text-[10px] font-mono text-neutral-400">Limit: {limit}/3</span>
                </div>
                <img 
                  src={userData?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={openLoginModal}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md font-medium text-xs hover:bg-neutral-200 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
