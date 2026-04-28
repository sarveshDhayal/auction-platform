import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

// Pages
import Dashboard from './pages/Dashboard';
import LoginRegister from './pages/LoginRegister';
import CreateAuction from './pages/CreateAuction';
import AuctionRoom from './pages/AuctionRoom';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MyAuctions from './pages/MyAuctions';
import BiddingHistory from './pages/BiddingHistory';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-text-primary">
      <Navbar />
      <main className="flex-grow pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/auth" element={<LoginRegister />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-auction" element={
            <ProtectedRoute>
              <CreateAuction />
            </ProtectedRoute>
          } />
          <Route path="/auction/:id" element={
            <ProtectedRoute>
              <AuctionRoom />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-auctions" element={
            <ProtectedRoute>
              <MyAuctions />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <BiddingHistory />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <GoogleOAuthProvider clientId={(import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "946106601149-r7vnsqf7h3ilcgo1kga8ju1uc5mitrt1.apps.googleusercontent.com"}>
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#0F172A',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                  },
                }}
              />
              <AppContent />
              <ReactQueryDevtools initialIsOpen={false} />
            </GoogleOAuthProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
