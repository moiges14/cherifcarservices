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
  savedLocations?: any[];
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = "Saisissez une adresse",
  label,
  icon,
  className = '',
  disabled = false,
  onPlaceSelect,
  savedLocations = []
}) => {
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Charger les adresses récentes depuis localStorage
    const saved = localStorage.getItem('recentAddresses');
    if (saved) {
      setRecentAddresses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Initialiser Google Places Autocomplete
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        return;
      }

      try {
        // Nettoyer l'ancienne instance
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        // Créer une nouvelle instance
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        });

        // Écouter les changements de lieu
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
            setShowSuggestions(false);
            
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          }
        });

      } catch (error) {
        console.warn('Erreur lors de l\'initialisation de Google Places Autocomplete:', error);
      }
    };

    // Attendre que Google Maps soit disponible
    if (window.google?.maps?.places) {
      initializeAutocomplete();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps?.places) {
          initializeAutocomplete();
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      // Nettoyer après 10 secondes
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
    setShowSuggestions(false);
  };

  const clearInput = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    if (!value && recentAddresses.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => setShowSuggestions(false), 200);
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
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      {showSuggestions && !value && recentAddresses.length > 0 && (
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

      {/* Lieux sauvegardés */}
      {showSuggestions && !value && savedLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              Lieux sauvegardés
            </div>
            {savedLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleRecentAddressClick(location.address)}
                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded flex items-center"
              >
                <MapPin className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-gray-500 truncate">{location.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInput;