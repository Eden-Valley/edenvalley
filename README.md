# Eden Valley Genesis

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.0.0-6E9F18?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40.0-2EAD33?logo=playwright)](https://playwright.dev/)

> **Découvrez votre véritable nature cognitive. Trouvez votre complément. Construisez l'impossible.**

Eden Valley est une plateforme de matching cognitif qui identifie et connecte les fondateurs selon leur ADN cognitif - distinguant les **Architectes** (penseurs, mapmakers) des **Bâtisseurs** (doers, exécutants). Inspirée par les duos légendaires comme Wozniak & Jobs, Walt & Roy Disney.

## 🎯 Mission

Le taux d'échec des startups n'est pas une question d'idées ou de marchés. C'est une question d'**architecture fondamentale des équipes fondatrices**.

Eden Valley ne match pas les compétences. Elle match l'**ADN cognitif**.

- **Pionnier (Architecte)** : Voit la carte, conçoit l'architecture, résout les problèmes complexes
- **Bâtisseur (Doer)** : Construit la route, exécute avec énergie, transforme la vision en réalité

## ✨ Fonctionnalités

### 🧠 Diagnostic Cognitif
- Test de 8 questions basé sur la psychologie cognitive
- Algorithme de scoring différenciant Thinker vs Doer
- Résultat personnalisé avec storytelling émotionnel (Pain → Relief → Revelation)

### 🌐 Internationalisation (i18n)
- Support de 7 langues : EN, FR, ES, RU, AR, ZH, JA
- Détection automatique de la langue du navigateur
- Système de traduction complet avec React Context

### 🎵 Expérience Audio Premium
- Musique ambiente procédurale générée en temps réel (Web Audio API)
- Sons de feedback interactifs (scroll, transitions, actions)
- Contrôle de l'intensité musicale selon la progression utilisateur

### 🔗 Système de Parrainage
- Génération de liens d'invitation personnalisés
- Tracking des referrals
- Accès exclusif par validation

### 🎨 UI/UX Épurée
- Design minimaliste inspiré de l'esthétique "Eden"
- Animations fluides avec Framer Motion
- Scroll storytelling avec 14 frames narratives
- Responsive mobile-first

### 💼 Profils Investisseurs
- Formulaire dédié pour les funder
- Sélection rigoureuse du réseau d'investisseurs
- Matching avec startups structuralement infaillibles

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Framework** | React 18.2 + TypeScript 5.2 |
| **Build Tool** | Vite 5.0 |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Routing** | React Router DOM 6.20 |
| **State** | React Context + Hooks |
| **Audio** | Web Audio API (procédural) |
| **Testing** | Vitest + React Testing Library + Playwright |
| **Icons** | Lucide React |
| **Database** | PostgreSQL (Neon) |

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (ou yarn/pnpm/bun)
- **Git**

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/kellykheir/eden-valley-genesis.git
cd eden-valley-genesis
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
bun install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Database (Neon PostgreSQL)
VITE_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Referral System
VITE_REFERRAL_BASE_URL=https://edensvalley.com/
```

> ⚠️ **Important** : Le fichier `.env.local` est ignoré par git (voir `.gitignore`). Ne jamais commiter de credentials.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible à `http://localhost:5173`

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production (optimisé) |
| `npm run preview` | Prévisualisation du build de production |
| `npm test` | Tests unitaires avec Vitest (watch mode) |
| `npm run test:ui` | Tests unitaires avec interface Vitest UI |
| `npm run test:e2e` | Tests end-to-end avec Playwright |
| `npm run lint` | Linting ESLint |
| `npm run typecheck` | Vérification TypeScript |

## 🏗 Structure du projet

```
eden-valley-genesis/
├── src/
│   ├── components/          # Composants React réutilisables
│   │   └── ui/               # Composants shadcn/ui
│   ├── hooks/                # Custom React Hooks
│   │   ├── AudioContext.tsx  # Système audio procédural
│   │   ├── useScrollSound.ts # Sons de scroll
│   │   └── useScrollVelocity.ts
│   ├── i18n/                 # Internationalisation
│   │   ├── LanguageContext.tsx
│   │   └── translations.ts     # Traductions (7 langues)
│   ├── lib/                  # Utilitaires
│   │   └── utils.ts
│   ├── pages/                # Composants page
│   │   ├── Home.tsx          # Landing storytelling
│   │   ├── RoleChoice.tsx    # Choix Found/Build/Fund
│   │   ├── Test.tsx          # Diagnostic cognitif
│   │   ├── ResultPage.tsx    # Résultat personnalisé
│   │   ├── Funder.tsx        # Profil investisseur
│   │   └── Thanks.tsx        # Confirmation
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Styles globaux + Tailwind
├── public/                   # Assets statiques
├── .windsurf/               # Workflows Windsurf
├── docs/                     # Documentation
├── tests/                    # Tests additionnels
├── .env.example              # Template variables d'env
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 🎨 Design System

### Couleurs (Tailwind Config)

```javascript
colors: {
  background: '#0A0A0A',      // Noir profond
  foreground: '#FAFAFA',       // Blanc cassé
  primary: '#D4AF37',        // Or Eden
  'eden-crimson': '#DC2626', // Rouge dramatique
  'eden-dim': '#525252',     // Gris atténué
}
```

### Typographie

- **Display** : Cormorant Garamond (élégance classique)
- **Body** : DM Sans (lisibilité moderne)
- **Mono** : JetBrains Mono (data, tags)

### Animation

- **Easing** : `cubic-bezier(0.4, 0, 0.2, 1)`
- **Durations** : 200ms (micro), 500ms (standard), 1000ms (dramatic)
- **Stagger** : 100ms entre éléments

## 🧪 Tests

### Tests unitaires

```bash
npm test
```

Couverture actuelle :
- ✅ Storytelling rendering
- ✅ Navigation logo display
- ✅ i18n language switching
- ✅ Audio context initialization

### Tests E2E (Playwright)

```bash
npm run test:e2e
```

Scénarios testés :
- Parcours utilisateur complet (Home → Test → Result)
- Flow investisseur
- Changement de langue
- Responsive design

## 🔧 Dépannage

### Storytelling ne s'affiche pas

1. Vérifier les logs console pour `[Storytelling Diagnostic]`
2. Confirmer que `src/i18n/translations.ts` contient les clés :
   - `thinker.pain1`, `thinker.relief1`, `thinker.revelation`
   - `doer.pain1`, `doer.relief1`, `doer.revelation`
   - `funder.pain1`, `funder.revelation`
3. Vérifier que la classe `.visible` est ajoutée aux éléments `.scroll-reveal`

### Audio ne démarre pas

- L'audio Web nécessite une interaction utilisateur (click/touch/scroll)
- Vérifier que le navigateur n'a pas bloqué l'autoplay
- Consulter les logs `[Audio]` dans la console

### Erreurs de build

```bash
# Nettoyer le cache
rm -rf node_modules dist
npm install
npm run build
```

## 🔒 Sécurité

- ✅ Variables d'environnement exclues du git (`.gitignore`)
- ✅ Pas de credentials hardcodés
- ✅ Database URLs uniquement via env vars
- ✅ Validation des entrées utilisateur
- ✅ Protection XSS via React

## 📄 Licence

Propriétaire - © 2024 Eden Valley. Tous droits réservés.

## 👥 Équipe

- **Fondateur** : [Kelly Kheir](https://github.com/kellykheir)

## 🤝 Contribution

Ce projet est actuellement en développement privé. Pour toute suggestion :

1. Forker le repository
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Committer (`git commit -m 'Add amazing feature'`)
4. Pusher (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📞 Contact

Pour toute question ou partenariat : contact@edensvalley.com

---

<p align="center">
  <strong>Eden Valley</strong> — Trouvez votre moitié. Construisez l'empire.
</p>

