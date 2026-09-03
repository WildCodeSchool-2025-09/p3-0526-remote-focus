# Focus

Focus est une application de suivi de films, séries et animés : catalogue, fiches détaillées, favoris, watchlist, recommandations personnalisées et statistiques de visionnage.

Projet final réalisé en équipe de 4 dans le cadre de la formation Développeur Web & Web Mobile de la Wild Code School.

## Table des matières

- [Focus](#focus)
  - [Table des matières](#table-des-matières)
  - [Stack technique](#stack-technique)
  - [Fonctionnalités](#fonctionnalités)
  - [Design](#design)
  - [Installation \& utilisation](#installation--utilisation)
  - [Commandes de base](#commandes-de-base)
  - [Base de données](#base-de-données)
  - [Convention de nommage](#convention-de-nommage)
  - [Qualité de code](#qualité-de-code)
  - [Équipe](#équipe)
  - [Contribution](#contribution)

## Stack technique

Monorepo JS, architecture React – Express – MySQL.

**Client**
- React + Vite + TypeScript
- React Router
- Tailwind CSS + DaisyUI (thème custom "focus")
- React Hook Form + Zod
- Recharts
- Lucide React

**Serveur**
- Node.js + Express + TypeScript
- MySQL avec `mysql2`, requêtes SQL brutes (pas d'ORM), pattern Repository
- JWT + bcrypt pour l'authentification
- Multer + Sharp pour l'upload d'avatars

**Données**
- Seed initial généré à partir de l'API [TMDB](https://www.themoviedb.org/documentation/api)

**Outillage**
- Biome (lint + format), Commitlint, tsx, Jest + Supertest

## Fonctionnalités

- Catalogue public de films, séries et animés — filtres par format et genre, recherche, tri
- Fiches détaillées (film, série, saison, comédien) avec casting, plateformes, genres, notes
- Compte utilisateur : inscription, connexion, préférences de genres à l'onboarding
- Favoris, watchlist, statut de visionnage, notation personnelle
- Accueil personnalisé : suggestions selon les goûts, acteurs les plus vus
- Radar des sorties (calendrier) et statistiques de visionnage
- Paramètres de compte : photo de profil, thème, filtre PEGI 16+

## Design

Le design system (palette, typographie, composants) est défini dans le styleguide du projet. Thème sombre de référence pour tous les écrans.

| Rôle | Couleur |
|---|---|
| Fond global | `#0D1117` |
| Surface (cartes, panneaux) | `#0F242F` |
| Primaire | `#17B890` |
| Secondaire | `#2E6373` |
| Accent | `#F2B705` |
| Erreur / alerte | `#E83658` |
| Texte principal | `#F5F5F0` |

Typographies : **Poppins** (titres) et **Inter** (texte courant).

## Installation & utilisation

1. Installez l'extension **Biome** dans votre éditeur et configurez-la comme formateur par défaut.
2. Clonez ce dépôt puis placez-vous dans le répertoire cloné.
3. Exécutez `npm install`.
4. Créez les fichiers `.env` dans `server/` et `client/` à partir des fichiers `.env.sample` (ne les supprimez pas).
5. Renseignez votre `TMDB_BEARER_TOKEN` personnel dans `server/.env` (un compte TMDB gratuit suffit).
6. Lancez `npm run db:migrate` puis `npm run db:seed` pour préparer la base de données.
7. Lancez `npm run dev` pour démarrer le client et le serveur.

## Commandes de base

| Commande | Description |
|---|---|
| `npm install` | Installe les dépendances du client et du serveur |
| `npm run dev` | Démarre le client et le serveur en parallèle |
| `npm run db:migrate` | Recrée la base de données à partir du schéma |
| `npm run db:seed` | Remplit la base de données avec les fixtures |
| `npm run check` | Lint + format (Biome) + vérification des types |
| `npm run check:fix` | Corrige automatiquement ce qui peut l'être |
| `npm run test` | Lance les tests client et serveur |
| `npm run build` | Build de production |


## Base de données

Le schéma complet (16 tables) est défini dans `server/database/schema.sql` et appliqué via :

```bash
npm run db:migrate
```

Les données de démonstration sont générées à partir de l'API TMDB puis chargées via :

```bash
npm run db:seed
```

> Le premier peuplement (`tmdb.json`) nécessite une clé API TMDB et prend 10 à 20 minutes. Une fois `tmdb.json` généré et commité, les autres membres de l'équipe peuvent seed sans clé API.

## Convention de nommage

Les conventions de nommage (routes API, fichiers back/front, composants, states, Git) sont détaillées dans [`docs/conventions-nommage.md`](./docs/conventions-nommage.md).

## Qualité de code

- **Biome** assure le lint et le formatage (`npm run check`), exécuté aussi en CI sur chaque pull request vers `dev`.
- **TypeScript** est vérifié en mode strict côté client et serveur (`tsc --noEmit`).
- **Commitlint** avec Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- Toutes les requêtes SQL utilisent des requêtes préparées (`mysql2`) — pas de concaténation de chaînes.

## Équipe

Projet réalisé par 4 étudiants de la promotion Wild Code School 2026-05
Thomas FABULET : https://github.com/Tofalt
Sophie LEBAS DE LACOUR : https://github.com/SophieLDL
Dorian PENNEGAT : https://github.com/czagoh
Alexandra VELISAR : https://github.com/alexandravelisar
