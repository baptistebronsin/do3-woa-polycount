# Utiliser l'image officielle PostgreSQL comme image de base
FROM postgres:latest

# Définir les variables d'environnement pour la configuration de PostgreSQL
ENV POSTGRES_DB='polycount'
ENV POSTGRES_USER='bbronsin'
ENV POSTGRES_PASSWORD='zUmKk3DE35YQK9NCh9Uxh@FnusABXELSHhj7SkX'

# Ajouter des scripts de configuration ou des données initiales
# COPY ./init.sql /docker-entrypoint-initdb.d/

# (Optionnel) Ajouter des extensions ou des outils supplémentaires
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     votre_extension \
# && rm -rf /var/lib/apt/lists/*

# Exposer le port (5432 est le port par défaut de PostgreSQL)
EXPOSE 5432

# docker build -t polycount-db .
# docker run --name polycount-db -d -p 127.0.0.1:5432:5432 polycount-db