# Habit Tracker API

API REST conteneurisée avec Docker permettant de gérer un système de suivi d'habitudes quotidiennes.

## Architecture

Le projet est composé de trois services conteneurisés :

-L' API : Application Node.js/Express exposant une API REST
- Base de données : PostgreSQL 16 pour la persistance des données
- Adminer : Interface web pour la gestion visuelle de la base de données

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js | 20 (Alpine) |
| Framework API | Express | 4.19.2 |
| Base de données | PostgreSQL | 16 (Alpine) |
| Driver DB | node-postgres (pg) | 8.12.0 |
| Interface DB | Adminer | latest |
| Orchestration | Docker Compose | v2 |

## Prérequis

- Docker Engine 20.10 ou supérieur
- Docker Compose v2 ou supérieur

## Installation et démarrage

### 1. Cloner le projet

    git clone <url-du-repo>
    cd habit-tracker-api

### 2. Configuration

Le fichier .env contient les variables d'environnement nécessaires :

    API_PORT=3000
    DB_HOST=db
    DB_PORT=5432
    DB_NAME=habits_db
    DB_USER=admin
    DB_PASSWORD=SecurePassword123!
    ADMINER_PORT=8080

### 3. Lancement de la stack

    docker compose up --build

Pour un démarrage en arrière-plan :

    docker compose up -d --build

### 4. Vérification

- API : http://localhost:3000
- Adminer : http://localhost:8080

## Documentation de l'API

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | / | Documentation de l'API |
| GET | /health | Vérification de l'état de l'API et de la BDD |
| GET | /habits | Liste de toutes les habitudes |
| GET | /habits/:id | Détails d'une habitude spécifique |
| POST | /habits | Création d'une nouvelle habitude |
| PUT | /habits/:id | Mise à jour d'une habitude |
| DELETE | /habits/:id | Suppression d'une habitude |

### Modèle de données

    {
      "id": 1,
      "name": "Lire 30 minutes",
      "description": "Lire un livre chaque soir",
      "frequency": "daily",
      "streak": 0,
      "created_at": "2026-08-17T12:00:00.000Z"
    }

### Exemples d'utilisation

Créer une habitude :

    curl -X POST http://localhost:3000/habits \
      -H "Content-Type: application/json" \
      -d '{"name":"Lire 30 minutes","description":"Lire un livre chaque soir","frequency":"daily"}'

Lister toutes les habitudes :

    curl http://localhost:3000/habits

Récupérer une habitude par ID :

    curl http://localhost:3000/habits/1

Mettre à jour une habitude :

    curl -X PUT http://localhost:3000/habits/1 \
      -H "Content-Type: application/json" \
      -d '{"streak": 5}'

Supprimer une habitude :

    curl -X DELETE http://localhost:3000/habits/1

## Structure du projet

    habit-tracker-api/
    ├── api/
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── package.json
    │   └── server.js
    ├── docker-compose.yaml
    ├── .env
    ├── .gitignore
    └── README.md

## Accès à la base de données via Adminer

1. Ouvrir http://localhost:8080
2. Se connecter avec les paramètres suivants :
   - Système : PostgreSQL
   - Serveur : db
   - Utilisateur : admin
   - Mot de passe : SecurePassword123!
   - Base de données : habits_db

## Bonnes pratiques appliquées

- Sécurité : Variables sensibles externalisées dans un fichier .env
- Sécurité : Utilisateur non-root dans le conteneur de l'API
- Performance : Image Docker basée sur Alpine Linux (légère)
- Performance : Optimisation du cache Docker (copie du package.json avant le code)
- Fiabilité : Healthcheck sur la base de données
- Fiabilité : Politique de redémarrage automatique (unless-stopped)
- Fiabilité : Attente de la BDD via depends_on avec condition service_healthy
- Persistance : Volume Docker nommé pour les données PostgreSQL
- Isolation : Réseau Docker dédié pour la communication inter-conteneurs
- Maintenabilité : Code commenté et structure claire

## Commandes utiles

Voir les logs :

    docker compose logs -f

Logs d'un service spécifique :

    docker compose logs -f api

Arrêter la stack :

    docker compose down

Arrêter et supprimer les volumes (attention : perte de données) :

    docker compose down -v

Reconstruire après modification du code :

    docker compose up --build

Accéder au shell d'un conteneur :

    docker compose exec api sh
    docker compose exec db psql -U admin -d habits_db

## Auteur

Christelle DEHOUMON

## Licence

MIT
< test webhook -->
test de jenkins
