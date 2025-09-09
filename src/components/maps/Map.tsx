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
  pickup?: { address: string; lat: number; lng: number };
  destination?: { address: string; lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

const Map: React.FC<MapProps> = ({
  center = { lat: 48.8566, lng: 2.3522 },
  zoom = 12,
  markers = [],
  onLocationSelect,
  showSearchBox = false,
  showRoute = false,
  className = '',
  pickup,
  destination,
  driverLocation,
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
      pickup={pickup}
      destination={destination}
      driverLocation={driverLocation}
    />
  );
};

export default Map;