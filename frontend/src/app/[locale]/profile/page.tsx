'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/fr/dashboard/client');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Utiliser les données de l'utilisateur du contexte
        const profileData: UserProfile = {
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || '',
          country: user.country || 'France',
          createdAt: user.createdAt,
          avatar: user.avatar,
        };
        
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          postalCode: profileData.postalCode || '',
          country: profileData.country || 'France',
        });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      // Appel API pour mettre à jour le profil
      await apiClient.put(`/clients/${profile.id}`, formData);
      
      // Mettre à jour le profil local
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      
      // Mettre à jour localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...userData, ...formData }));
      }
      
      setEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setSaving(true);
      
      await apiClient.put(`/clients/${profile?.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Mot de passe modifié avec succès !');
    } catch (err: any) {
      console.error('Erreur changement mot de passe:', err);
      alert(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/fr/dashboard/client');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <AuthenticatedLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{profile.firstName?.[0]?.toUpperCase() || '👤'}{profile.lastName?.[0]?.toUpperCase() || ''}</span>
                )}
              </div>
              <Badge variant="success" className="absolute -bottom-1 -right-1">
                Actif
              </Badge>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-primary-100">{profile.email}</p>
              <p className="text-primary-200 text-sm mt-1">
                Membre depuis {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Informations personnelles */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>👤 Informations personnelles</CardTitle>
                <Button 
                  variant={editing ? 'outline' : 'primary'}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Annuler' : '✏️ Modifier'}
                </Button>
              </div>
              
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="123 Rue de la Paix"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="75001"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Prénom</p>
                    <p className="font-medium">{profile.firstName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{profile.lastName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{profile.phone || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">
                      {profile.address 
                        ? `${profile.address}, ${profile.postalCode || ''} ${profile.city || ''}, ${profile.country || ''}`
                        : '-'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-6">🔒 Sécurité</CardTitle>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mot de passe</p>
                    <p className="text-sm text-gray-500">Dernière modification: il y a 30 jours</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                    Modifier
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-500">Non activée</p>
                  </div>
                  <Button variant="outline" disabled>
                    Activer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-6">⚙️ Préférences</CardTitle>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevoir des alertes sur votre compte</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications SMS</p>
                    <p className="text-sm text-gray-500">Recevoir des SMS pour les transactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Déconnexion */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">Déconnexion</p>
                  <p className="text-sm text-gray-500">Se déconnecter de votre compte</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6">🔑 Changer le mot de passe</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleChangePassword}
                  disabled={
                    !passwordData.currentPassword || 
                    !passwordData.newPassword || 
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    saving
                  }
                >
                  {saving ? 'Modification...' : 'Modifier'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthenticatedLayout>
  );
}
