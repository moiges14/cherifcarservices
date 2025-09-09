import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  Users,
  Car,
  Star,
  Settings,
  FileText,
  Map,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  Bell
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import SetupGuide from './SetupGuide';

interface Stats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  averageRating: number;
  activeRides: number;
  revenue: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  driver_id: string | null;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  user_email?: string;
  driver_name?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    averageRating: 0,
    activeRides: 0,
    revenue: 0
  });
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadStats();
    loadAdminUsers();
  }, []);

  useEffect(() => {
    if (activeSection === 'bookings') {
      loadBookings();
      loadDrivers();
    }
  }, [activeSection]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: driversCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      const { data: ridesData } = await supabase
        .from('rides')
        .select('status, price');

      const totalRides = ridesData?.length || 0;
      const activeRides = ridesData?.filter(ride => 
        ['searching', 'matched', 'driver_en_route', 'in_progress'].includes(ride.status)
      ).length || 0;
      const revenue = ridesData?.reduce((sum, ride) => sum + (ride.price || 0), 0) || 0;

      const { data: ratingsData } = await supabase
        .from('reviews')
        .select('rating');
      
      const averageRating = ratingsData?.length 
        ? ratingsData.reduce((sum, review) => sum + review.rating, 0) / ratingsData.length
        : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalDrivers: driversCount || 0,
        totalRides,
        averageRating,
        activeRides,
        revenue
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const { data, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;
      setAdminUsers(data || []);
    } catch (err) {
      console.error('Error loading admin users:', err);
      setError('Failed to load admin users');
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (email),
          drivers:driver_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data.map(booking => ({
        ...booking,
        user_email: booking.users?.email,
        driver_name: booking.drivers?.name
      })));
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setDrivers(data);
    } catch (err) {
      console.error('Error loading drivers:', err);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([
          {
            email: newAdminEmail,
            role: 'admin'
          }
        ]);

      if (insertError) throw insertError;

      setNewAdminEmail('');
      setIsAddingAdmin(false);
      await loadAdminUsers();
    } catch (err) {
      console.error('Error adding admin:', err);
      setError('Failed to add admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (deleteError) throw deleteError;

      await loadAdminUsers();
    } catch (err) {
      console.error('Error removing admin:', err);
      setError('Failed to remove admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditingBooking(true);
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('bookings')
        .update({
          status: editingBooking.status,
          driver_id: editingBooking.driver_id
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      setIsEditingBooking(false);
      await loadBookings();
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      await loadBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-emerald-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="text-gray-500">Active accounts</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
        </div>
        <div className="h-2 bg-emerald-100 rounded-full">
          <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Car className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Drivers</h3>
              <p className="text-gray-500">Registered drivers</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</span>
        </div>
        <div className="h-2 bg-blue-100 rounded-full">
          <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Map className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Rides</h3>
              <p className="text-gray-500">Currently in progress</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.activeRides}</span>
        </div>
        <div className="h-2 bg-purple-100 rounded-full">
          <div className="h-2 bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-amber-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Rides</h3>
              <p className="text-gray-500">Completed rides</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.totalRides}</span>
        </div>
        <div className="h-2 bg-amber-100 rounded-full">
          <div className="h-2 bg-amber-500 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
              <p className="text-gray-500">Customer satisfaction</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </span>
        </div>
        <div className="h-2 bg-yellow-100 rounded-full">
          <div 
            className="h-2 bg-yellow-500 rounded-full" 
            style={{ width: `${(stats.averageRating / 5) * 100}%` }}
          ></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
              <p className="text-gray-500">Total earnings</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            €{stats.revenue.toFixed(2)}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-2 bg-gray-500 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </Card>
    </div>
  );

  const renderAdminUsers = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Admin Users</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddingAdmin(true)}
          leftIcon={<Plus size={16} />}
        >
          Add Admin
        </Button>
      </div>

      {isAddingAdmin && (
        <Card className="mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Admin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="admin@example.com"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingAdmin(false);
                  setNewAdminEmail('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddAdmin}
                disabled={!newAdminEmail}
                isLoading={loading}
              >
                Add Admin
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adminUsers.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Réservations</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trajet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chauffeur
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.user_email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="mb-1">De: {booking.pickup}</div>
                    <div>À: {booking.dropoff}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {booking.date}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="mr-1" />
                      {booking.time}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusStyle(booking.status)
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.driver_name || 'Non assigné'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditBooking(booking)}
                    className="text-emerald-600 hover:text-emerald-900 mr-3"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Modifier la réservation</h3>
              <button
                onClick={() => setIsEditingBooking(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={editingBooking?.status}
                  onChange={(e) => setEditingBooking(prev => ({ ...prev!, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chauffeur
                </label>
                <select
                  value={editingBooking?.driver_id || ''}
                  onChange={(e) => setEditingBooking(prev => ({ ...prev!, driver_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner un chauffeur</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingBooking(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveBooking}
                  isLoading={loading}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings size={20} /> },
    { id: 'bookings', label: 'Réservations', icon: <Calendar size={20} /> },
    { id: 'setup', label: 'Configuration', icon: <Settings size={20} /> },
    { id: 'admins', label: 'Admin Users', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Logged in as {user?.email}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium
                    ${activeSection === item.id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'bookings' && renderBookings()}
          {activeSection === 'setup' && <SetupGuide />}
          {activeSection === 'admins' && renderAdminUsers()}
          {activeSection === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;