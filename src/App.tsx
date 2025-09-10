import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import AuthModal from './components/auth/AuthModal';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BookRide from './components/features/BookRide';
import ActiveRide from './components/features/ActiveRide';
import { RideHistory } from './components/features/RideHistory';
import UserProfile from './components/features/UserProfile';
import Services from './components/features/Services';
import Reviews from './components/features/Reviews';
import AboutUs from './components/features/AboutUs';
import ChatAssistant from './components/common/ChatAssistant';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentCancel from './components/payment/PaymentCancel';

function AppContent() {
  const [activePage, setActivePage] = useState('book');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();
  const { currentRide, bookRide, cancelRide } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, loading]);

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  // Handle payment success/cancel routes
  if (window.location.pathname === '/payment-success') {
    return <PaymentSuccess />;
  }
  
  if (window.location.pathname === '/payment-cancel') {
    return <PaymentCancel />;
  }
  const renderContent = () => {
    switch (activePage) {
      case 'admin':
        return (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        );
      case 'book':
        return <BookRide onRideBooked={bookRide} />;
      case 'rates':
        return <BookRide onRideBooked={bookRide} />;
      case 'history':
        return <RideHistory />;
      case 'profile':
        return <UserProfile />;
      case 'services':
        return <Services />;
      case 'about':
        return <AboutUs />;
      default:
        return <BookRide onRideBooked={bookRide} />;
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
        
        {currentRide && (
          <ActiveRide
            rideId={currentRide.id}
            pickup={currentRide.pickup}
            destination={currentRide.dropoff}
            driver={currentRide.driver || {
              id: 'mock-driver',
              name: 'Conducteur assigné',
              rating: 4.8,
              vehicle: {
                make: 'Toyota',
                model: 'Prius',
                licensePlate: 'AB-123-CD',
                color: 'Blanc'
              },
              phone: '+33 1 23 45 67 89',
              photo: null
            }}
            status={currentRide.status}
            onCancel={cancelRide}
          />
        )}
        
        <Reviews />
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose}
        mode={authMode}
        onModeChange={setAuthMode}
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