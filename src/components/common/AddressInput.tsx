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

interface Suggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    // Initialiser les services Google Places
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Créer un div temporaire pour PlacesService
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }

    // Charger les adresses récentes depuis localStorage
    const saved = localStorage.getItem('recentAddresses');
    if (saved) {
      setRecentAddresses(JSON.parse(saved));
    }

    // Fermer les suggestions si on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'fr' }, // Limiter à la France
        types: ['address', 'establishment', 'geocode'],
        language: 'fr'
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 3) {
      searchPlaces(newValue);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    if (!placesService.current) return;

    setLoading(true);
    try {
      const request = {
        placeId: String(suggestion.place_id),
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const address = place.formatted_address || suggestion.description;
          onChange(address, {
            address,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
            place_id: place.place_id,
            name: place.name
          });

          // Sauvegarder dans les adresses récentes
          saveRecentAddress(address);
          
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
        setShowSuggestions(false);
        setLoading(false);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      onChange(suggestion.description);
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const saveRecentAddress = (address: string) => {
    const updated = [address, ...recentAddresses.filter(a => a !== address)].slice(0, 5);
    setRecentAddresses(updated);
    localStorage.setItem('recentAddresses', JSON.stringify(updated));
  };

  const handleRecentAddressClick = (address: string) => {
    onChange(address);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (value.length >= 3) {
      setShowSuggestions(true);
    } else if (recentAddresses.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getPlaceIcon = (types: string[]) => {
    if (types.includes('airport')) return '✈️';
    if (types.includes('train_station')) return '🚂';
    if (types.includes('hospital')) return '🏥';
    if (types.includes('school')) return '🏫';
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('shopping_mall')) return '🛍️';
    return '📍';
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
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${loading ? 'bg-gray-50' : ''}
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
        
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Adresses récentes */}
          {value.length < 3 && recentAddresses.length > 0 && (
            <div className="p-3 border-b border-gray-100">
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
          )}

          {/* Suggestions de Google Places */}
          {suggestions.length > 0 && (
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start space-x-3"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getPlaceIcon(suggestion.types)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message si aucune suggestion */}
          {value.length >= 3 && suggestions.length === 0 && !loading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune adresse trouvée pour "{value}"
            </div>
          )}

          {/* Message d'aide */}
          {value.length < 3 && recentAddresses.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Saisissez au moins 3 caractères pour voir les suggestions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressInput;