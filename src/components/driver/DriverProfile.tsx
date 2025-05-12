import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Phone, Car, License, Star, Camera } from 'lucide-react';
import { VehicleType } from '../../types';

const DriverProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    license_number: '',
    vehicle_info: {
      make: '',
      model: '',
      year: '',
      type: '' as VehicleType,
      plate_number: ''
    },
    profile_picture: '',
    rating: 5.0,
    total_rides: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadDriverProfile();
    }
  }, [user?.id]);

  const loadDriverProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (err) {
      console.error('Error loading driver profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('drivers')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          license_number: profileData.license_number,
          vehicle_info: profileData.vehicle_info,
          updated_at: new Date()
        })
        .eq('id', user?.id);

      if (error) throw error;
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={profileData.profile_picture || "https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 text-white hover:bg-emerald-700">
              <Camera size={16} />
            </button>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
            <div className="flex items-center mt-1">
              <Star className="text-yellow-400" size={16} />
              <span className="ml-1">{profileData.rating} • {profileData.total_rides} rides</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditMode}
                leftIcon={<User size={18} />}
              />
              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditMode}
                leftIcon={<Phone size={18} />}
              />
              <Input
                label="License Number"
                value={profileData.license_number}
                onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })}
                disabled={!isEditMode}
                leftIcon={<License size={18} />}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
            <div className="space-y-4">
              <Input
                label="Vehicle Make"
                value={profileData.vehicle_info.make}
                onChange={(e) => setProfileData({
                  ...profileData,
                  vehicle_info: { ...profileData.vehicle_info, make: e.target.value }
                })}
                disabled={!isEditMode}
                leftIcon={<Car size={18} />}
              />
              <Input
                label="Vehicle Model"
                value={profileData.vehicle_info.model}
                onChange={(e) => setProfileData({
                  ...profileData,
                  vehicle_info: { ...profileData.vehicle_info, model: e.target.value }
                })}
                disabled={!isEditMode}
              />
              <Input
                label="Vehicle Year"
                value={profileData.vehicle_info.year}
                onChange={(e) => setProfileData({
                  ...profileData,
                  vehicle_info: { ...profileData.vehicle_info, year: e.target.value }
                })}
                disabled={!isEditMode}
              />
              <Input
                label="License Plate"
                value={profileData.vehicle_info.plate_number}
                onChange={(e) => setProfileData({
                  ...profileData,
                  vehicle_info: { ...profileData.vehicle_info, plate_number: e.target.value }
                })}
                disabled={!isEditMode}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
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
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DriverProfile;