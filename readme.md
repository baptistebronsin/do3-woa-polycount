## Polycount

Ce dépôt GitHub contient toute la structure de l'application `Polycount`. Celle-ci est développée avec les frameworks NodeJS (Express) et ReactJS en TypeScript.

### Installation

1. Téléchargez le contenu de l'application depuis son dépôt distant GitHub avec Git.
    ```bash
    git clone https://github.com/baptistebronsin/do3-woa-polycount.git
    ```
2. Veillez à être sur la branche `master`.
3. Veuillez vérifier que `node` et `npm` sont bien installés sur votre machine.
    ```bash
    node --version
    ```
    ```bash
    npm --version
    ```

### Base de données PostgreSQL

Assurez-vous qu'un système de gestion de base de données (SGBD) type PotgreSQL soit disponible et accessible sur votre machine.
Dans notre cas, nous allons utiliser un container Docker avec la dernière version de PostgreSQL.

1. Récupérez la dernière image Docker de PostgreSQL.
    ```bash
    docker pull postgres
    ```
2. Démarrez un container Docker avec l'image précédente.
    ```bash
    docker run --name polycount-bd -e POSTGRES_PASSWORD=polycount_password -e POSTGRES_DB=polycount -p 5432:5432 -d postgres
    ```
3. Entrez dans le container.
    ```bash
    docker exec -it polycount-bd bash
    ```
4. Connectez-vous avec l'utilisateur `postgres`.
    ```bash
    psql -U postgres -d polycount
    ```
5. Regardez si la base de données `polycount` existe bien.
    ```bash
    \l
    ```
6. Saisissez la commande suivante pour ajouter les tags de dépenses dans notre base de données.
    ```sql
    INSERT INTO "public"."Tag" (titre, couleur, icon)
    VALUES ('Transport', '2764C8', 'faPlane'),
        ('Nourriture', '2FD431', 'faUtensils'),
        ('Logement', 'D125DC', 'faHome'),
        ('Activité', 'EA7C0F', 'faHiking'),
        ('Autre', '000000', 'faQuestion');
    ```

### Back-end NodeJS

Rendez-vous dans le répertoire `/votre/chemin/do3-woa-polycount/back` pour la mise en place du serveur NodeJS.

1. Installez toutes les dépenses NPM pour l'application.
    ```bash
    npm install
    ```
2. Créez un fichier `.env` dans le répertoire courant.
    ```bash
    nano .env
    ```
    Ce fichier est nécéssaire au fonctionnement de l'application, veuillez retrouver ci-dessous toutes les variables utilisées.

    ```env
    PORT_SERVEUR = 8080
    EXPIRATION_JWTOKEN = "30m"
    CLE_TOKEN = "une clé JWT"

    DATABASE_URL="postgresql://postgres:polycount_password@127.0.0.1:5432/polycount?schema=public"

    MAIL = "une adresse email"
    PASSWORD_MAIL = "le mot de passe de l'adresse email"

    API_URL = "http://localhost:8080"
    APP_URL = "http://localhost:3000"

    STRIPE_KEY = "clé de connexion à stripe"

    TOKEN_ADMINISTRATEUR = "un token administrateur"
    ```

    Veillez à bien remplacer toutes les valeurs. Pour une plus grande praticité, je vous joins une note privée Bitwarden (ce fichier se supprimera automatiquement le 20/02/2024 à 23:00:00) avec les informations suivantes : `MAIL`, `PASSWORD_MAIL` et `STRIPE_KEY`.
    https://send.bitwarden.com/#fmHBR5eM4UKFvbD-AW4clw/7ys86o8UCnER5_ZaK14-xw

3. Compilez l'application en JavaScript.
    ```bash
    npm run build
    ```
4. Lancez l'application NodeJS.
    ```bash
    npm start
    ```

### Front-end ReactJS

Rendez-vous dans le répertoire `/votre/chemin/do3-woa-polycount/front/polycount` pour la mise en place de l'application ReactJS.

1. Installez toutes les dépenses NPM pour l'application.
    ```bash
    npm install
    ```
2. Créez un fichier `.env` dans le répertoire courant.
    ```bash
    nano .env
    ```
    Ce fichier est nécéssaire au fonctionnement de l'application, veuillez retrouver ci-dessous toutes la variable utilisée.

    ```
    NODE_ENV="dev"
    ```
3. Compilez l'application en JavaScript.
    ```bash
    npm run build
    ```
4. Lancez l'application ReactJS.
    ```bash
    npm start
    ```

## Version en ligne

Le projet `Polycount` a été déployé sur ma lame serveur personnelle Polytech. Vous pouvez y accéder avec l'url suivante :
`https://polycount.baptistebronsin.be`.

## Fonctionnalités

L'application `Polycount` est destinée à pouvoir gérer des utilisateurs qui souhaitent pouvoir créer des dépenses groupées.

Nous pouvons donc y retrouver les points suivants :
* Création de compte
* Envoi d'un mail avec un lien (token) pour faire vérifier un compte
* Connexion à un compte
* Création, modification et suppression d'un groupe de dépense
* Création, modification et suppression d'une dépense
* Visualisation par un diagramme en bâtons des sommes dûes et acquises dans le groupe de dépense
* Création d'un participant fictif : C'est un participant d'un groupe de dépense à qui on pourra attribuer des dépenses sans que celui-ci soit un utilisateur réel de notre base de données.
* Ajout de participants : 3 manières sont disponibles
    1. Envoi d'un mail d'invitation à un utilisateur réel de notre base de données.
    2. Création d'un lien d'invitation avec une expiration de 48 heures.
    3. Création d'un participant fictif.
* Envoi d'un mail d'invitation pour associer un utilisateur réel à un participant fictif existant dans un groupe de dépense
* Gestion des permissions pour les participants d'un groupe de dépense : `création`, `modification`, `suppression`, etc...
* Exclusion d'un participant d'un groupe de dépense
* Modification des informations personnelles relatives à l'utilisateur courant
* Désactivation du compte de l'utilisateur courant
