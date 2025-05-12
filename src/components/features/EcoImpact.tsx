import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import { Leaf, BarChart, DollarSign, Car, Award } from 'lucide-react';
import { RideStatus, VehicleType } from '../../types';

const EcoImpact: React.FC = () => {
  const { rides, currentUser } = useApp();
  
  // Filter completed rides
  const completedRides = rides.filter(ride => ride.status === RideStatus.COMPLETED);
  
  // Calculate carbon statistics
  const calculateStats = () => {
    const totalRides = completedRides.length;
    const totalDistance = completedRides.reduce((sum, ride) => sum + ride.distance, 0);
    const totalCarbonEmitted = completedRides.reduce((sum, ride) => sum + ride.carbonFootprint, 0);
    
    // Calculate carbon saved compared to standard vehicles
    const carbonSaved = completedRides.reduce((sum, ride) => {
      if (ride.vehicleType === VehicleType.ELECTRIC || ride.vehicleType === VehicleType.HYBRID || ride.vehicleType === VehicleType.SHARED) {
        // Calculate what would have been emitted with a standard vehicle
        const standardEmission = ride.distance * 120; // 120g CO2 per km for standard car
        return sum + (standardEmission - ride.carbonFootprint);
      }
      return sum;
    }, 0);
    
    // Calculate eco-rides percentage
    const ecoRides = completedRides.filter(ride => 
      ride.vehicleType === VehicleType.ELECTRIC || 
      ride.vehicleType === VehicleType.HYBRID || 
      ride.vehicleType === VehicleType.SHARED
    ).length;
    
    const ecoRidesPercentage = totalRides > 0 ? Math.round((ecoRides / totalRides) * 100) : 0;
    
    return {
      totalRides,
      totalDistance: totalDistance.toFixed(1),
      totalCarbonEmitted: (totalCarbonEmitted / 1000).toFixed(2), // Convert to kg
      carbonSaved: (carbonSaved / 1000).toFixed(2), // Convert to kg
      ecoRidesPercentage,
      treesEquivalent: Math.round(carbonSaved / 21000) // Each tree absorbs ~21kg CO2 per year
    };
  };
  
  const stats = calculateStats();
  
  const renderStatCard = (icon: React.ReactNode, title: string, value: string | number, subtitle?: string) => (
    <Card padding="md" className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 my-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </Card>
  );
  
  // Calculate user level and next milestone
  const getUserLevel = () => {
    const carbonSaved = parseFloat(stats.carbonSaved);
    
    if (carbonSaved < 1) return { level: 'Eco Starter', next: 1, progress: carbonSaved };
    if (carbonSaved < 5) return { level: 'Green Explorer', next: 5, progress: carbonSaved };
    if (carbonSaved < 10) return { level: 'Eco Warrior', next: 10, progress: carbonSaved };
    if (carbonSaved < 25) return { level: 'Climate Champion', next: 25, progress: carbonSaved };
    if (carbonSaved < 50) return { level: 'Earth Guardian', next: 50, progress: carbonSaved };
    return { level: 'Climate Hero', next: carbonSaved, progress: carbonSaved };
  };
  
  const userLevel = getUserLevel();
  const progressPercentage = (userLevel.progress / userLevel.next) * 100;
  
  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Eco Impact</h1>
      
      {/* Level Badge */}
      <Card className="mb-6 text-center p-5 border-2 border-emerald-100">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-3">
          <Award size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{userLevel.level}</h2>
        <p className="text-sm text-gray-500 mb-3">
          {userLevel.level !== 'Climate Hero' 
            ? `${stats.carbonSaved} kg CO₂ saved of ${userLevel.next} kg needed for next level`
            : 'You\'ve reached the highest level!'}
        </p>
        
        {userLevel.level !== 'Climate Hero' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        )}
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {renderStatCard(
          <Leaf size={24} className="text-emerald-600" />,
          'Carbon Saved',
          `${stats.carbonSaved} kg`,
          'CO₂ emissions reduced'
        )}
        
        {renderStatCard(
          <Car size={24} className="text-sky-600" />,
          'Eco Rides',
          `${stats.ecoRidesPercentage}%`,
          'of your total rides'
        )}
        
        {renderStatCard(
          <BarChart size={24} className="text-amber-600" />,
          'Total Distance',
          `${stats.totalDistance} km`,
          'traveled with EcoRide'
        )}
        
        {renderStatCard(
          <DollarSign size={24} className="text-green-600" />,
          'Rewards Earned',
          '125',
          'eco points to redeem'
        )}
      </div>
      
      {/* Environmental Impact */}
      <Card className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Environmental Impact</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Leaf size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Trees Equivalent</p>
                <p className="text-sm text-gray-500">CO₂ absorbed by trees in a year</p>
              </div>
            </div>
            <span className="text-lg font-bold">{stats.treesEquivalent}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Car size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Car Trips Avoided</p>
                <p className="text-sm text-gray-500">Equivalent standard car trips</p>
              </div>
            </div>
            <span className="text-lg font-bold">{Math.round(parseFloat(stats.carbonSaved) * 10 / 2.3)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Social Cost Saved</p>
                <p className="text-sm text-gray-500">Environmental damage prevented</p>
              </div>
            </div>
            <span className="text-lg font-bold">${(parseFloat(stats.carbonSaved) * 51 / 1000).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <p>* Environmental impact calculations based on EPA standards and research data.</p>
        </div>
      </Card>
      
      {/* Badges Section */}
      <Card className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Eco Achievements</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { 
              name: 'First Ride', 
              icon: <Car size={18} className="text-emerald-600" />,
              achieved: stats.totalRides > 0 
            },
            { 
              name: '5 Electric Rides', 
              icon: <Leaf size={18} className="text-emerald-600" />,
              achieved: completedRides.filter(r => r.vehicleType === VehicleType.ELECTRIC).length >= 5
            },
            { 
              name: '1kg CO₂ Saved', 
              icon: <Leaf size={18} className="text-emerald-600" />,
              achieved: parseFloat(stats.carbonSaved) >= 1
            },
            { 
              name: '10 Total Rides', 
              icon: <Car size={18} className="text-emerald-600" />,
              achieved: stats.totalRides >= 10
            },
            { 
              name: '5kg CO₂ Saved', 
              icon: <Leaf size={18} className="text-emerald-600" />,
              achieved: parseFloat(stats.carbonSaved) >= 5
            },
            { 
              name: '100% Eco Month', 
              icon: <Award size={18} className="text-emerald-600" />,
              achieved: stats.ecoRidesPercentage === 100 && stats.totalRides >= 3
            },
          ].map((badge, index) => (
            <div 
              key={index}
              className={`text-center p-3 rounded-lg ${badge.achieved ? 'bg-green-50' : 'bg-gray-50 opacity-60'}`}
            >
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${badge.achieved ? 'bg-green-100' : 'bg-gray-200'}`}>
                {badge.icon}
              </div>
              <p className="text-xs font-medium">{badge.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EcoImpact;