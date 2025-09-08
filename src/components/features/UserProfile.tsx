import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Settings, CreditCard, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  rating?: number;
  rides_completed?: number;
  carbon_saved?: number;
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({
        name: formData.name,
        phone: formData.phone,
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...formData });
      setEditing(false);
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Mon profil</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Informations personnelles</h3>
              <Button
                variant="outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            {editing ? (
              <form onSubmit={updateProfile} className="space-y-4">
                <Input
                  icon={User}
                  type="text"
                  placeholder="Nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  icon={Phone}
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{profile.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{profile.phone || 'Non renseigné'}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Settings */}
          <Card className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Paramètres</h3>
            <div className="space-y-4">
              <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg">
                <Bell className="w-5 h-5 text-gray-400" />
                <span>Notifications</span>
              </button>
              <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span>Moyens de paiement</span>
              </button>
              <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>Adresses favorites</span>
              </button>
              <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg">
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Préférences</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div>
          <Card>
            <h3 className="text-xl font-semibold mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.rating?.toFixed(1) || '5.0'}
                </div>
                <div className="flex justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (profile.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Note moyenne</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profile.rides_completed || 0}
                </div>
                <p className="text-sm text-gray-600">Trajets effectués</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {profile.carbon_saved?.toFixed(1) || '0.0'} kg
                </div>
                <p className="text-sm text-gray-600">CO₂ économisé</p>
              </div>
            </div>
          </Card>

          <Button
            variant="outline"
            className="w-full mt-6 text-red-600 border-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}