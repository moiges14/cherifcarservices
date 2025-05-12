import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Settings, CreditCard, MapPin, Bell, HelpCircle, LogOut, Award, Leaf, Phone, Mail, Camera, Shield, History, Wallet } from 'lucide-react';
import { VehicleType } from '../../types';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_picture: '',
    preferred_vehicle_type: '' as VehicleType,
    language: 'en',
    theme: 'light',
    notification_preferences: {
      ride_updates: true,
      promotions: false,
      eco_impact: true,
      email: true,
      push: true,
      sms: false
    },
    eco_preferences: {
      prioritize_eco_friendly: true,
      allow_ride_sharing: true,
      carbon_offset: true
    },
    payment_methods: [] as any[],
    billing_address: '',
    corporate_code: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      setProfileData({
        ...profileData,
        ...userData,
        email: user.email || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Update profile with Senegal flag
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_picture: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg",
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({
        ...prev,
        profile_picture: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg"
      }));

      setSuccessMessage('Profile picture updated successfully');
      await loadUserProfile(); // Reload profile data
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (category: string, key: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          preferred_vehicle_type: profileData.preferred_vehicle_type,
          language: profileData.language,
          theme: profileData.theme,
          notification_preferences: profileData.notification_preferences,
          eco_preferences: profileData.eco_preferences,
          billing_address: profileData.billing_address,
          corporate_code: profileData.corporate_code,
          emergency_contact: profileData.emergency_contact,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccessMessage('Profile updated successfully');
      setIsEditMode(false);
      await loadUserProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'payment', label: 'Payment', icon: <Wallet size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  if (!user?.id) {
    return (
      <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="text-center py-6">
            <p className="text-gray-500">Please sign in to view your profile</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-wrap space-x-2 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
              ${activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {successMessage}
        </div>
      )}

      {loading && !error && !successMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
          Loading...
        </div>
      )}

      <Card>
        {activeTab === 'profile' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <div className="mb-4 sm:mb-0 sm:mr-6 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={profileData.profile_picture || "https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleProfilePictureChange}
                  className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 cursor-pointer hover:bg-emerald-700"
                >
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profileData.name || user?.email}</h2>
                <div className="flex items-center text-gray-500 mt-1">
                  <Mail size={16} className="mr-1" />
                  <span>{profileData.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                disabled={!isEditMode}
                leftIcon={<User size={18} />}
                fullWidth
              />

              <Input
                label="Phone Number"
                name="phone"
                value={profileData.phone || ''}
                onChange={handleInputChange}
                disabled={!isEditMode}
                leftIcon={<Phone size={18} />}
                fullWidth
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  name="billing_address"
                  value={profileData.billing_address}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
                <div className="space-y-3">
                  <Input
                    label="Contact Name"
                    name="emergency_contact_name"
                    value={profileData.emergency_contact.name}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'name', e.target.value)}
                    disabled={!isEditMode}
                    fullWidth
                  />
                  <Input
                    label="Contact Phone"
                    name="emergency_contact_phone"
                    value={profileData.emergency_contact.phone}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'phone', e.target.value)}
                    disabled={!isEditMode}
                    fullWidth
                  />
                  <Input
                    label="Relationship"
                    name="emergency_contact_relationship"
                    value={profileData.emergency_contact.relationship}
                    onChange={(e) => handleNestedInputChange('emergency_contact', 'relationship', e.target.value)}
                    disabled={!isEditMode}
                    fullWidth
                  />
                </div>
              </div>

              <div className="mt-6">
                {isEditMode ? (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        loadUserProfile();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                    leftIcon={<Settings size={16} />}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tab content remains unchanged */}
        {/* ... */}
      </Card>
    </div>
  );
};

export default UserProfile;