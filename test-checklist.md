# ✅ Souq Local – Checklist de Test Flutter (App Client)

## 🧪 Objectif
Vérifier le bon fonctionnement de toutes les fonctionnalités critiques **côté client** dans l’application Flutter, après débogage par Lovable.dev.

---

### 🛠️ 1. Navigation & Accueil

- [ ] Après l'onboarding, redirection automatique vers `Page d'accueil` (non Login)
- [ ] La `Page d'accueil` affiche :
  - [ ] Produits disponibles (avec prix + image)
  - [ ] Services disponibles
  - [ ] Slider d'annonces actif (avec données réelles depuis admin panel)
  - [ ] Header contenant deux boutons : "Se connecter client" et "Se connecter vendeur"

---

### 🛍️ 2. Produits & Services

#### 🔍 Affichage
- [ ] Affichage correct du nom, image, prix et description pour tous les produits
- [ ] Affichage correct du nom, image, prix et description pour tous les services

#### ➕ Ajout au panier
- [ ] Le bouton "+" augmente bien la **quantité** (pour les produits)
- [ ] Le **prix total** est mis à jour dynamiquement selon la quantité
- [ ] Pour les **services**, la quantité reste toujours à `1` (non modifiable)
- [ ] Le bouton "Ajouter au panier" fonctionne sans erreur pour :
  - [ ] Un produit
  - [ ] Un service

---

### 💼 3. Panier & Transactions

- [ ] Les produits/services ajoutés apparaissent dans le panier
- [ ] Le montant total est cohérent avec les quantités sélectionnées
- [ ] Le bouton de passage à la caisse est fonctionnel
- [ ] Historique des transactions affiche les achats passés correctement

---

### 🔁 4. Fonctionnalités liées

- [ ] Le `système de favoris` est opérationnel (ajout/retrait)
- [ ] La `recherche par catégorie` fonctionne
- [ ] Les annonces (ads slider) proviennent bien des données du panel admin

---

### 🔒 5. Authentification (à **tester sans modifier**)

- [ ] Connexion via numéro WhatsApp (OTP UltraMsg) fonctionne
- [ ] Redirection correcte selon rôle (client ou vendeur)
- [ ] Connexion administrateur via username/password fonctionne (panel)

---

## 🧠 Notes de validation

- Effectuer ces tests sur appareil réel ou simulateur Flutter avec **connexion internet active**
- En cas d’erreur : noter le type d'erreur + vérifier les logs Supabase côté fonctions/edge functions

---

📌 Ce fichier permet à Lovable.dev (ou tout testeur) de valider si l’application Flutter est **entièrement opérationnelle** pour les utilisateurs finaux après les correctifs.
