import React from 'react';
import MapComponent from './MapComponent';
import { Location } from '../../types';

interface MapProps {
  center?: { lat: number, lng: number };
  zoom?: number;
  markers?: (Location & { icon?: 'pickup' | 'dropoff' | 'driver' })[];
  onLocationSelect?: (location: Location) => void;
  showSearchBox?: boolean;
  showRoute?: boolean;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  // Center on Paris by default
  center = { lat: 48.8566, lng: 2.3522 },
  zoom = 6,
  markers = [],
  onLocationSelect,
  showSearchBox = false,
  showRoute = false,
  className = '',
}) => {
  return (
    <MapComponent
      center={center}
      zoom={zoom}
      markers={markers}
      onLocationSelect={onLocationSelect}
      showSearchBox={showSearchBox}
      showRoute={showRoute}
      className={className}
    />
  );
};

export default Map;