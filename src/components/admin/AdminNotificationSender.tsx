
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Search, X, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: string;
  sound: string;
  metadata: Record<string, any>;
}

const AdminNotificationSender = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'admin_message',
    sound: '',
    metadata: {}
  });

  // Types de notifications disponibles
  const notificationTypes = [
    { value: 'admin_message', label: 'Message Admin' },
    { value: 'order_created', label: 'Commande créée' },
    { value: 'order_delivered', label: 'Commande livrée' },
    { value: 'order_cancelled', label: 'Commande annulée' },
    { value: 'product_approved', label: 'Produit approuvé' },
    { value: 'product_rejected', label: 'Produit rejeté' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'system_update', label: 'Mise à jour système' }
  ];

  // Sons disponibles
  const availableSounds = [
    { value: '', label: 'Son par défaut' },
    { value: 'notif_sound', label: 'Son de notification' },
    { value: 'order_sound', label: 'Son de commande' },
    { value: 'success_sound', label: 'Son de succès' },
    { value: 'alert_sound', label: 'Son d\'alerte' }
  ];

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, role')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.phone?.includes(searchTerm) ||
    profile.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addUser = (profile: Profile) => {
    if (!selectedUsers.find(user => user.id === profile.id)) {
      setSelectedUsers([...selectedUsers, profile]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const addAllUsers = () => {
    setSelectedUsers(profiles);
  };

  const clearAllUsers = () => {
    setSelectedUsers([]);
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message || selectedUsers.length === 0) {
      toast.error('Veuillez remplir tous les champs requis et sélectionner au moins un utilisateur');
      return;
    }

    try {
      setIsSending(true);

      // Préparer les notifications à insérer
      const notifications = selectedUsers.map(user => ({
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        sound: formData.sound || null,
        metadata: formData.metadata,
        is_read: false
      }));

      // Insérer les notifications
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Notification envoyée avec succès à ${selectedUsers.length} utilisateur(s)`);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        message: '',
        type: 'admin_message',
        sound: '',
        metadata: {}
      });
      setSelectedUsers([]);

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleTestNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }

    try {
      // Récupérer l'ID de l'admin actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `[TEST] ${formData.title}`,
          message: formData.message,
          type: formData.type,
          sound: formData.sound || null,
          metadata: { ...formData.metadata, test: true },
          is_read: false
        });

      if (error) throw error;
      toast.success('Notification de test envoyée');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification de test');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envoyer une notification
          </CardTitle>
          <CardDescription>
            Envoyez des notifications ciblées aux utilisateurs de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire de notification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la notification"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Contenu de la notification"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sound">Son (optionnel)</Label>
              <Select value={formData.sound} onValueChange={(value) => setFormData({ ...formData, sound: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un son" />
                </SelectTrigger>
                <SelectContent>
                  {availableSounds.map(sound => (
                    <SelectItem key={sound.value} value={sound.value}>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        {sound.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metadata">Métadonnées (JSON)</Label>
              <Input
                id="metadata"
                value={JSON.stringify(formData.metadata)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || '{}');
                    setFormData({ ...formData, metadata: parsed });
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                placeholder='{"order_id": "123", "action": "open_order"}'
              />
            </div>
          </div>

          {/* Boutons de test */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={!formData.title || !formData.message}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Test notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sélectionner les destinataires
          </CardTitle>
          <CardDescription>
            Choisissez les utilisateurs qui recevront la notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone ou rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={addAllUsers}>
              Tout sélectionner
            </Button>
            <Button variant="outline" onClick={clearAllUsers}>
              Tout désélectionner
            </Button>
          </div>

          {/* Utilisateurs sélectionnés */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Utilisateurs sélectionnés ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.name} ({user.role})
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUser(user.id)}
                      className="h-4 w-4 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Liste des utilisateurs */}
          <div className="max-h-60 overflow-y-auto border rounded-md">
            {isLoading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun utilisateur trouvé</div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      selectedUsers.find(u => u.id === profile.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => addUser(profile)}
                  >
                    <div>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-sm text-gray-500">{profile.phone}</div>
                    </div>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'outline'}>
                      {profile.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton d'envoi */}
          <Button
            onClick={handleSendNotification}
            disabled={isSending || selectedUsers.length === 0 || !formData.title || !formData.message}
            className="w-full"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer la notification ({selectedUsers.length} destinataire{selectedUsers.length > 1 ? 's' : ''})
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationSender;
