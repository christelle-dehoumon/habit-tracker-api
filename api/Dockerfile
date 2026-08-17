# ============================================
# Dockerfile - Habit Tracker API
# ============================================

# Image de base : Node.js 20 Alpine (légère)
FROM node:20-alpine

# Métadonnées de l'image
LABEL maintainer="Christelle Dehoumon"
LABEL description="API REST pour le suivi d'habitudes"
LABEL version="1.0.0"

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json en premier (optimisation du cache Docker)
COPY package.json ./

# Installer les dépendances de production uniquement
RUN npm install --omit=dev

# Copier le reste du code source
COPY . .

# Exposer le port de l'application
EXPOSE 3000

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Commande de démarrage
CMD ["node", "server.js"]
