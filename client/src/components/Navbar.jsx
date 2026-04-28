import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, X, LogOut, User, LayoutDashboard, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Gavel className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
              BidMaster
            </span>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/create-auction" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                  Create Auction
                </Link>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                  <input 
                    type="text" 
                    placeholder="Search auctions..." 
                    className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-64 transition-all"
                  />
                </div>
                
                <button className="relative p-2 text-text-secondary hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-fast"></span>
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-white/20 bg-white/10"
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-background border border-white/10 shadow-2xl py-1 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-white/10">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                        <Link to="/" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-white/5 transition-colors">
                            <Menu className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-white/5 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link to="/auth" className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-white hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text-secondary hover:text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-white/10 bg-background overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 border-b border-white/10 mb-2">
                    <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                      <p className="text-base font-medium text-white">{user.name}</p>
                      <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-white hover:bg-white/5">
                    Dashboard
                  </Link>
                  <Link to="/create-auction" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-white hover:bg-white/5">
                    Create Auction
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-white/5">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-danger hover:bg-white/5">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary">
                  Sign In / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
