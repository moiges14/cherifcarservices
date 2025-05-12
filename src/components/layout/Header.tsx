import React, { useState, useEffect } from 'react';
import { Menu, X, User, Clock, Car, MapPin, LogOut, Euro, Briefcase, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';

interface HeaderProps {
  setActivePage: (page: string) => void;
  activePage: string;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setActivePage, activePage, onAuthClick }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<{ name?: string; profile_picture?: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    } else {
      setProfileData(null);
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, profile_picture')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const menuItems = [
    { id: 'book', label: 'Réserver', icon: <Car size={18} /> },
    { id: 'rates', label: 'Tarifs', icon: <Euro size={18} /> },
    { id: 'services', label: 'Prestations', icon: <Briefcase size={18} /> },
    { id: 'about', label: 'Qui sommes-nous', icon: <Info size={18} /> },
  ];

  const userMenuItems = [
    { id: 'history', label: 'Historique', icon: <Clock size={18} /> },
    { id: 'profile', label: 'Profil', icon: <User size={18} /> },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (pageId: string) => {
    setActivePage(pageId);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileMenuOpen(false);
  };

  const displayName = profileData?.name || user?.email?.split('@')[0] || 'User';
  const defaultProfilePicture = "https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img src="/eco-car.svg" alt="Chérif Car Services" className="h-10 w-10" />
            <div className="ml-2">
              <div className="text-xl font-bold text-gray-900">Chérif Car Services</div>
              <div className="text-xs text-gray-600">Service de voiture avec chauffeur</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${activePage === item.id
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {user && userMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${activePage === item.id
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={profileData?.profile_picture || defaultProfilePicture}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {displayName}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onAuthClick}
              >
                Connexion
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {user ? (
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onAuthClick}
              >
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6 lg:px-8">
            {[...menuItems, ...userMenuItems].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  flex items-center w-full px-3 py-2 rounded-md text-base font-medium
                  ${activePage === item.id
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Mobile User Profile */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 sm:px-6 lg:px-8">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={profileData?.profile_picture || defaultProfilePicture}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {displayName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                <LogOut size={18} className="mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;