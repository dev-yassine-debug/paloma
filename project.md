
# Souq Local - Admin Panel Export

## 📋 Vue d'ensemble du projet

**Souq Local** est une marketplace saoudienne complète avec panel d'administration en arabe (RTL). Le système gère une plateforme e-commerce avec utilisateurs multi-rôles, système financier intégré, et interface d'administration avancée.

### 🎯 Public cible
- Marché saoudien (Arabie Saoudite)
- Interface RTL (Right-to-Left)
- Devise : Saudi Riyal (SAR)
- Langues : Arabe (principal), Anglais (technique)

## 🏗 Architecture technique

### Frontend (React/TypeScript)
- **Framework** : React 18 + TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **State Management** : React Query (@tanstack/react-query)
- **Routing** : React Router DOM
- **Charts** : Recharts
- **Icons** : Lucide React

### Backend (Supabase)
- **Database** : PostgreSQL avec RLS
- **Authentication** : Supabase Auth + OTP
- **Storage** : Supabase Storage
- **Functions** : Edge Functions (Deno)
- **Real-time** : Supabase Realtime

## 📊 Pages d'administration

| Route | Titre (AR) | Composant | Description |
|-------|------------|-----------|-------------|
| `/admin/dashboard` | لوحة المعلومات | `EnhancedAdminDashboard` | Dashboard principal avec métriques |
| `/admin/users` | إدارة المستخدمين | `AdminUsersManagement` | Gestion complète des utilisateurs |
| `/admin/products` | إدارة المنتجات | `AdminProductsManagement` | Modération et gestion produits |
| `/admin/orders` | إدارة الطلبات | `AdminOrdersManagement` | Suivi des commandes |
| `/admin/wallets` | إدارة المحافظ | `AdminWalletOverview` | Gestion financière des portefeuilles |
| `/admin/transactions` | المعاملات المالية | `AdminTransactionHistory` | Historique transactions |
| `/admin/analytics` | التحليلات والتقارير | `AdminAnalytics` | Rapports et statistiques |
| `/admin/security` | الأمان والمراجعة | `SecurityMonitoring` | Audit et sécurité |
| `/admin/settings` | الإعدادات العامة | `AdminSettings` | Configuration système |

## 🗄 Tables Supabase principales

### Utilisateurs et authentification
- `profiles` : Profils utilisateurs étendus
- `otp_codes` : Codes OTP pour authentification
- `security_audit` : Logs d'audit sécurité

### Commerce
- `products` : Catalogue produits/services
- `product_categories` : Catégories hiérarchiques
- `orders` : Système de commandes
- `order_items` : Détails des commandes

### Finance
- `wallets` : Portefeuilles utilisateurs
- `admin_wallet` : Portefeuille administrateur
- `payment_transactions` : Historique transactions
- `commission_settings` : Configuration commissions

### Communication
- `notifications` : Système de notifications
- `chat_messages` : Messagerie intégrée
- `chat_conversations` : Conversations utilisateurs

## 👥 Rôles utilisateurs

### `app_role` ENUM
```sql
CREATE TYPE app_role AS ENUM ('client', 'seller', 'admin');
```

### Permissions par rôle

#### Client (`client`)
- Parcourir et acheter des produits
- Gérer ses commandes et wallet
- Messagerie avec vendeurs
- Historique d'achats

#### Vendeur (`seller`)
- Créer et gérer ses produits
- Traiter les commandes reçues
- Statistiques de vente
- Gestion du wallet et retraits

#### Admin (`admin`)
- Accès complet au panel d'administration
- Modération de tous les contenus
- Gestion financière globale
- Configuration système

## ⚙ Actions système principales

### Gestion des produits
- Approbation/rejet de produits
- Gestion des catégories
- Upload d'images/vidéos
- Modération de contenu

### Gestion financière
- Mise à jour des wallets
- Calcul des commissions
- Processing des paiements
- Gestion du cashback

### Administration
- Gestion des utilisateurs
- Configuration des paramètres
- Monitoring et analytics
- Audit de sécurité

## 🔌 Edge Functions (Backend)

### Authentification
- `send-otp` : Envoi OTP via WhatsApp
- `verify-otp` : Vérification et création session

### Paiements
- `initiate-payment` : Initiation paiement Telr
- `telr-webhook` : Traitement webhook Telr
- `finalize-transaction` : Finalisation transaction

### Gestion des commandes
- `create-order` : Création commande
- `process-order` : Traitement complet
- `calculate-order-totals` : Calcul des totaux

### Produits
- `approve-product` : Approbation produit
- `upload-product-image` : Upload sécurisé

### Utilitaires
- `advanced-search` : Recherche avancée
- `record-analytics` : Enregistrement événements
- `create-notification` : Système notifications

## 🔐 Secrets Supabase configurés

### Supabase Core
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### Intégrations externes
- `ULTRAMSG_API_KEY` (WhatsApp)
- `ULTRAMSG_INSTANCE_ID` (WhatsApp)
- `TELR_MERCHANT_ID` (Paiements)
- `TELR_API_KEY` (Paiements)
- `TELR_WEBHOOK_SECRET` (Paiements)

## 📈 Système financier

### Configuration par défaut
- **Commission admin** : 5% sur chaque vente
- **Cashback client** : 1.5% sur achats wallet
- **Frais retrait vendeur** : 2.5%

### Flux financier
1. Client achète produit
2. Commission prélevée automatiquement
3. Montant transféré au vendeur
4. Cashback crédité au client
5. Commission ajoutée au wallet admin

## 🚀 Intégrations tierces

### Telr (Paiements)
- Gateway de paiement saoudien
- Support SAR
- Webhook sécurisé
- Cartes et wallets locaux

### UltraMsg (WhatsApp)
- Envoi d'OTP
- Notifications automatiques
- Messages de confirmation
- Support en arabe

## 📱 Interface utilisateur

### Design RTL
- Interface complètement en arabe
- Support RTL natif
- Polices adaptées à l'arabe
- Couleurs conformes à la culture locale

### Responsive Design
- Mobile-first approach
- Adaptation tablette
- Desktop optimisé
- PWA ready

## 🔒 Sécurité

### Row Level Security (RLS)
- Toutes les tables protégées
- Accès basé sur les rôles
- Isolation des données utilisateur

### Audit Trail
- Toutes les actions loggées
- Traçabilité complète
- Alertes automatiques
- Reporting de sécurité

## 📊 Analytics et Monitoring

### Métriques suivies
- Utilisateurs actifs
- Volume de transactions
- Performance des vendeurs
- Taux de conversion
- Erreurs système

### Rapports disponibles
- Revenus par période
- Top produits/vendeurs
- Analyse géographique
- Comportement utilisateur

Cette documentation complète permet une migration facile vers Cursor et l'intégration avec votre application Flutter. Tous les composants sont modulaires et réutilisables.
