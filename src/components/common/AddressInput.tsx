import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Clock } from 'lucide-react';

interface AddressInputProps {
  value: string;
  onChange: (value: string, placeData?: any) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onPlaceSelect?: (place: any) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = "Saisissez une adresse",
  label,
  icon,
  className = '',
  disabled = false,
  onPlaceSelect
}) => {
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Charger les adresses récentes depuis localStorage
    const saved = localStorage.getItem('recentAddresses');
    if (saved) {
      setRecentAddresses(JSON.parse(saved));
    }

    // Attendre que Google Maps soit disponible et initialiser Autocomplete
    const checkAndInitialize = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        return;
      }

      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.formatted_address) {
            const address = place.formatted_address;
            const placeData = {
              address,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
              place_id: place.place_id,
              name: place.name
            };

            onChange(address, placeData);
            saveRecentAddress(address);
            
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          }
        });

      } catch (error) {
        console.warn('Erreur lors de l\'initialisation de Google Places Autocomplete:', error);
      }
    };

    if (window.google?.maps?.places) {
      checkAndInitialize();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps?.places) {
          checkAndInitialize();
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      setTimeout(() => clearInterval(checkGoogleMaps), 10000);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const saveRecentAddress = (address: string) => {
    const updated = [address, ...recentAddresses.filter(a => a !== address)].slice(0, 5);
    setRecentAddresses(updated);
    localStorage.setItem('recentAddresses', JSON.stringify(updated));
  };

  const handleRecentAddressClick = (address: string) => {
    onChange(address);
    if (inputRef.current) {
      inputRef.current.value = address;
    }
  };

  const clearInput = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon || <MapPin className="w-5 h-5 text-gray-400" />}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            disabled:bg-gray-50 disabled:text-gray-500
          `}
        />
        
        {value && (
          <button
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Adresses récentes */}
      {!value && recentAddresses.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Clock className="w-3 h-3 mr-1" />
              Adresses récentes
            </div>
            {recentAddresses.map((address, index) => (
              <button
                key={index}
                onClick={() => handleRecentAddressClick(address)}
                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
              >
                <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{address}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInput;