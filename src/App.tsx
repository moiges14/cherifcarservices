import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BookRide from './components/features/BookRide';
import ActiveRide from './components/features/ActiveRide';
import RideHistory from './components/features/RideHistory';
import UserProfile from './components/features/UserProfile';
import Services from './components/features/Services';
import Reviews from './components/features/Reviews';
import AboutUs from './components/features/AboutUs';
import ChatAssistant from './components/common/ChatAssistant';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';

function AppContent() {
  const [activePage, setActivePage] = useState('book');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, loading]);

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'admin':
        return (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        );
      case 'book':
        return <BookRide />;
      case 'rates':
        return <BookRide />;
      case 'history':
        return <RideHistory />;
      case 'profile':
        return <UserProfile />;
      case 'services':
        return <Services />;
      case 'about':
        return <AboutUs />;
      default:
        return <BookRide />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        setActivePage={setActivePage} 
        activePage={activePage} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
      />
      
      <main className="flex-grow">
        {renderContent()}
        
        <ActiveRide />
        
        <Reviews />
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose} 
      />

      <ChatAssistant />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;