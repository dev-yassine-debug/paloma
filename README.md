
# Souq Local - Admin Panel

🇸🇦 **Marketplace saoudienne avec panel d'administration en arabe (RTL)**

## 📋 Description

Souq Local est une plateforme e-commerce complète ciblant le marché saoudien, avec un système d'administration avancé permettant de gérer utilisateurs, produits, commandes, portefeuilles et transactions financières.

### ✨ Fonctionnalités principales

- 🏪 **Marketplace complète** : Produits physiques et services
- 👥 **Gestion utilisateurs** : Clients, vendeurs, administrateurs
- 💰 **Système financier** : Wallets, commissions, cashback
- 📱 **Interface RTL** : Design adapté à l'arabe
- 🔐 **Authentification OTP** : Via WhatsApp (UltraMsg)
- 💳 **Paiements** : Intégration Telr Gateway
- 📊 **Analytics** : Statistiques et rapports temps réel

## 🛠 Stack technique

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **React Router** pour le routing
- **React Query** pour l'état server
- **Recharts** pour les graphiques

### Backend
- **Supabase** (Database + Auth + Storage)
- **Edge Functions** pour la logique métier
- **Row Level Security** (RLS)
- **PostgreSQL** avec fonctions personnalisées

### Intégrations
- **Telr** : Gateway de paiement
- **UltraMsg** : WhatsApp API
- **Supabase Storage** : Upload de fichiers

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Telr (paiements)
- Compte UltraMsg (WhatsApp)

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd souq-local-admin
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration Supabase

#### A. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

#### B. Exécuter les migrations SQL
```bash
# Copier les fichiers SQL depuis /supabase/migrations/
# Les exécuter dans l'ordre chronologique dans SQL Editor
```

#### C. Configurer les secrets
Dans **Settings > Edge Functions > Secrets** :
```
ULTRAMSG_API_KEY=votre_cle_ultramsg
ULTRAMSG_INSTANCE_ID=votre_instance_ultramsg
TELR_MERCHANT_ID=votre_merchant_telr
TELR_API_KEY=votre_cle_telr
TELR_WEBHOOK_SECRET=votre_secret_webhook
```

### 4. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp docs/env.example .env.local

# Éditer .env.local avec vos vraies valeurs
```

### 5. Déployer les Edge Functions
```bash
# Installer la CLI Supabase
npm install -g @supabase/cli

# Login
supabase login

# Lier le projet
supabase link --project-ref cuxmjglodmhpjlcqkqhx

# Déployer les fonctions
supabase functions deploy
```

### 6. Lancer l'application
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔑 Premier accès admin

### 1. Créer le compte admin
Exécuter dans **SQL Editor** de Supabase :
```sql
-- Créer un utilisateur admin
INSERT INTO auth.users (id, email, phone, email_confirmed_at, phone_confirmed_at)
VALUES (gen_random_uuid(), 'admin@souqlocal.sa', '+966501234567', now(), now());

-- Créer le profil admin
INSERT INTO profiles (id, name, phone, role)
VALUES (
  (SELECT id FROM auth.users WHERE phone = '+966501234567'),
  'Admin Principal',
  '+966501234567',
  'admin'
);
```

### 2. Se connecter
1. Aller sur `/admin-login`
2. Entrer le numéro : `+966501234567`
3. Recevoir l'OTP par WhatsApp
4. Se connecter

## 📱 Pages d'administration

| Route | Description | Composant |
|-------|-------------|-----------|
| `/admin/dashboard` | Tableau de bord principal | `EnhancedAdminDashboard` |
| `/admin/users` | Gestion des utilisateurs | `AdminUsersManagement` |
| `/admin/products` | Gestion des produits | `AdminProductsManagement` |
| `/admin/orders` | Gestion des commandes | `AdminOrdersManagement` |
| `/admin/wallets` | Gestion des portefeuilles | `AdminWalletOverview` |
| `/admin/transactions` | Transactions financières | `AdminTransactionHistory` |
| `/admin/analytics` | Analytics et rapports | `AdminAnalytics` |
| `/admin/security` | Sécurité et audit | `SecurityMonitoring` |
| `/admin/settings` | Paramètres système | `AdminSettings` |

## 🏗 Architecture

### Structure des dossiers
```
src/
├── components/
│   ├── admin/           # Composants admin
│   ├── client/          # Interface client
│   ├── seller/          # Interface vendeur
│   └── ui/              # Composants UI (shadcn)
├── hooks/               # Hooks personnalisés
├── pages/               # Pages de l'application
├── integrations/        # Configuration Supabase
└── lib/                 # Utilitaires

supabase/
├── functions/           # Edge Functions
├── migrations/          # Migrations SQL
└── config.toml         # Configuration
```

### Rôles utilisateurs
- **`client`** : Acheteurs de la plateforme
- **`seller`** : Vendeurs avec boutique
- **`admin`** : Accès complet au panel d'administration

## 💰 Système financier

### Commissions par défaut
- **Commission admin** : 5% sur chaque vente
- **Cashback client** : 1.5% sur achats par wallet
- **Frais de retrait** : 2.5% pour les vendeurs

### Wallets
- **Wallet admin** : Centralise commissions et frais
- **Wallets utilisateurs** : Soldes individuels
- **Recharge** : Via Telr ou crédit admin
- **Historique complet** : Toutes transactions tracées

## 🔐 Sécurité

### Authentification
- **OTP par WhatsApp** : Via UltraMsg API
- **Sessions Supabase** : JWT avec expiration
- **Row Level Security** : Accès contrôlé par rôle

### Audit
- **Security audit** : Log de toutes les actions
- **Rate limiting** : Protection contre le spam
- **Validation stricte** : Toutes les entrées utilisateur

## 📊 Monitoring

### Logs disponibles
- **Edge Functions** : Via Supabase Dashboard
- **Erreurs React** : Error Boundary intégré
- **Transactions** : Traçabilité complète

### Métriques suivies
- Nombre d'utilisateurs actifs
- Volume de transactions
- Performance des vendeurs
- Taux de conversion

## 🚀 Déploiement

### Production
```bash
# Build
npm run build

# Déployer sur Vercel/Netlify
# Les Edge Functions sont automatiquement déployées sur Supabase
```

### Variables d'environnement production
Configurer dans votre plateforme de déploiement :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- Autres variables du fichier `.env.example`

## 📚 Documentation

- [Vue générale du projet](docs/project.md)
- [Modèles de données](docs/data-models.md)
- [Routes d'administration](docs/admin-routes.md)
- [Edge Functions](docs/backend-functions.md)

## 🤝 Contribution

1. Fork du projet
2. Créer une branche feature
3. Commit des changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire - Souq Local © 2024

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : support@souqlocal.sa
- 📱 WhatsApp : +966501234567
- 🐛 Issues : GitHub Issues

---

Made with ❤️ for the Saudi market 🇸🇦

---

## الخطوة التالية: تشغيل المشروع على localhost

الآن بعد تثبيت الحزم، يمكنك تشغيل التطبيق مباشرة بالأمر التالي:

```bash
npm run dev
```
أو
```bash
yarn dev
```

بعدها:
- سيفتح التطبيق على الرابط:  
  [http://localhost:5173](http://localhost:5173)

---

## ملاحظات إضافية

- إذا لم يكن لديك ملف `.env.local`، انسخه من المثال:
  ```bash
  cp docs/env.example .env.local
  ```
  ثم عدّل القيم حسب بياناتك (مفاتيح Supabase، Telr، UltraMsg...).

- إذا ظهرت لك أخطاء تتعلق بقاعدة البيانات أو البيئة، تأكد من تنفيذ جميع ملفات SQL في مجلد `supabase/migrations/` على مشروع Supabase الخاص بك.

- التحذيرات حول الـ vulnerabilities ليست حرجة لتشغيل المشروع محليًا، لكن يمكنك محاولة إصلاحها لاحقًا بـ:
  ```bash
  npm audit fix
  ```

---

هل تريد أن أساعدك في توليد ملف البيئة أو شرح خطوة معينة بالتفصيل؟  
إذا واجهت أي خطأ عند تشغيل `npm run dev`، أرسل لي رسالة بالخطأ وسأساعدك فورًا!
