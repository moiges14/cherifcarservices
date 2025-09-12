/*
  # Ajouter utilisateur admin

  1. Ajout d'un nouvel administrateur
    - Email: moiges14@hotmail.com
    - Rôle: admin
    - Accès complet à l'interface d'administration

  2. Sécurité
    - L'utilisateur pourra accéder à toutes les fonctionnalités admin
    - Gestion des réservations, chauffeurs, clients et notifications
*/

-- Ajouter l'utilisateur admin
INSERT INTO admin_users (email, role) 
VALUES ('moiges14@hotmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;