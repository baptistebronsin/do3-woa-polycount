## Polycount : Back-end

Ce répertoire contient toute la structure du back-end de l'application `Polycount`. Celui-ci est développé avec le framework NodeJS en TypeScript.

### Installation

_Cette procédure d'installation est tirée du site `Digital Ocean` : https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript_

1. Veuillez vérifier que `node` et `npm` sont bien installés sur votre machine.
2. Créez un projet nodeJS _(l'option `-y` permet de créer le projet d'un coup en acceptant tous les réglages)_
    ```ssh
    npm init -y
    ```
3. Téléchargez les modules TypeScript dans les dépendances de développement
   ```ssh
   npm install --save-dev typescript
   ```
4. Créez le fichier de configuration TypeScript
   ```ssh
   nano tsconfig.json
   ```
5. Saisissez le contenu suivant
    ```json
    {
    "compilerOptions": {
        "module": "commonjs",
        "esModuleInterop": true,
        "target": "es6",
        "moduleResolution": "node",
        "sourceMap": true,
        "outDir": "dist"
    },
    "lib": ["es2015"]
    }
    ```
6. Installez le framework `Express`
   ```ssh
   npm install --save express
   npm install -save-dev @types/express
   ```
7. Créer le fichier racine du projet NodeJS
    ```ssh
    nano src/app.ts
    ```
8. Vous pouvez par exemple remplir ce fichier avec le contenu suivant
    ```ts
    import express, { Request, Response } from 'express';
    import * as core from "express-serve-static-core";

    const app: core.Express = express();
    const port: number = 3000;

    app.get('/', (req: Request, res: Response) => {
        res.status(200).send('Hello World!');
    });

    app.listen(port, () => {
        return console.log(`Express is listening at http://localhost:${port}`);
    });
    ```
9. Dans votre fichier `package.json` modifier les réglages suivants
    ```json
    {
        ...
        "main": "dist/index.js",
        "scripts": {
            "start": "tsc && node dist/app.js"
        },
        ...
    }
    ```
10. Créer le fichier `.gitignore` et ajoutez le contenu suivant
    ```ssh
    nano .gitignore
    ```

    ```txt
    node_modules/
    dist/
    ```

11. Faites un premier `git add .gitignore` pour que git ne prenne pas en compte les répertoires.

12. Démarrez votre serveur NodeJS avec la commande suivante
    ```ssh
    npm start
    ```