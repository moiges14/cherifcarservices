import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { MapPin, Plus, Home, Briefcase, Dumbbell, Coffee, Star, Edit, Trash2 } from 'lucide-react';
import { generateMockLocations } from '../../utils/mockData';
import { Location } from '../../types';

const SavedLocations: React.FC = () => {
  const mockLocations = generateMockLocations();
  const [locations, setLocations] = useState<Record<string, Location>>(mockLocations);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  
  const locationIcons: Record<string, React.ReactNode> = {
    home: <Home size={18} />,
    work: <Briefcase size={18} />,
    gym: <Dumbbell size={18} />,
    restaurant: <Coffee size={18} />,
    default: <Star size={18} />
  };
  
  const getIconForLocation = (locationKey: string) => {
    return locationIcons[locationKey] || locationIcons.default;
  };
  
  const handleEditLocation = (locationKey: string) => {
    setEditingLocation(locationKey);
    setNewLocationAddress(locations[locationKey].address || '');
  };
  
  const handleDeleteLocation = (locationKey: string) => {
    const newLocations = { ...locations };
    delete newLocations[locationKey];
    setLocations(newLocations);
  };
  
  const handleSaveLocation = () => {
    if (editingLocation) {
      // Update existing location
      setLocations({
        ...locations,
        [editingLocation]: {
          ...locations[editingLocation],
          address: newLocationAddress
        }
      });
      setEditingLocation(null);
    } else if (isAddingLocation && newLocationName && newLocationAddress) {
      // Add new location
      const newLocationKey = newLocationName.toLowerCase().replace(/\s+/g, '_');
      setLocations({
        ...locations,
        [newLocationKey]: {
          latitude: 37.7749 + (Math.random() * 0.1 - 0.05), // Random coordinates for demo
          longitude: -122.4194 + (Math.random() * 0.1 - 0.05),
          address: newLocationAddress
        }
      });
      setIsAddingLocation(false);
      setNewLocationName('');
      setNewLocationAddress('');
    }
  };
  
  const cancelEdit = () => {
    setEditingLocation(null);
    setIsAddingLocation(false);
    setNewLocationName('');
    setNewLocationAddress('');
  };
  
  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Locations</h1>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setIsAddingLocation(true)}
          leftIcon={<Plus size={16} />}
          disabled={isAddingLocation || editingLocation !== null}
        >
          Add Location
        </Button>
      </div>
      
      {/* Add New Location Form */}
      {isAddingLocation && (
        <Card className="mb-6 border border-emerald-100">
          <h3 className="font-medium text-gray-900 mb-4">Add New Location</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                id="locationName"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="e.g., Office, Gym, Friend's House"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="locationAddress"
                value={newLocationAddress}
                onChange={(e) => setNewLocationAddress(e.target.value)}
                placeholder="Enter full address"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveLocation}
                disabled={!newLocationName || !newLocationAddress}
              >
                Save Location
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Locations List */}
      <div className="space-y-4">
        {Object.keys(locations).map((locationKey) => (
          <Card 
            key={locationKey}
            className={editingLocation === locationKey ? 'border-2 border-emerald-200' : ''}
          >
            {editingLocation === locationKey ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {getIconForLocation(locationKey)}
                  </div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {locationKey.replace(/_/g, ' ')}
                  </h3>
                </div>
                <div>
                  <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="editAddress"
                    value={newLocationAddress}
                    onChange={(e) => setNewLocationAddress(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveLocation}
                    disabled={!newLocationAddress}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {getIconForLocation(locationKey)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {locationKey.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">{locations[locationKey].address}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLocation(locationKey)}
                    className="text-gray-500 hover:text-emerald-600"
                    aria-label={`Edit ${locationKey}`}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(locationKey)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Delete ${locationKey}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {Object.keys(locations).length === 0 && !isAddingLocation && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No saved locations</h3>
          <p className="mt-1 text-sm text-gray-500">Add frequently visited locations for quicker ride booking.</p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setIsAddingLocation(true)}
            leftIcon={<Plus size={16} />}
            className="mt-4"
          >
            Add Your First Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedLocations;