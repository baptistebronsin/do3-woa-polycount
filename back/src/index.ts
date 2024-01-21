process.env.TZ = 'Europe/Paris';

import express, { Request, Response } from 'express';
import routes from './routes';
const cors = require('cors');

import dotenv from "dotenv";
import logger from './middlewares/logger.middleware';
dotenv.config();

import helmet from 'helmet';
import prisma from './services/prisma.service';

const app = express();
import { exec } from 'child_process';
import migrer from './services/migration.service';

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended: false}));
app.use(logger);
app.use(express.json());
app.use((req, res, next) => {
    setTimeout(() => {
        next();
    }, 2000);
});

app.use(routes);

app.get('/', async (_: Request, res: Response) => {
    await prisma.$queryRaw`SELECT 1;`;
    return res.status(200).json({message: "Ha l'batard il fonctionne !"});
});

// TODO: void comment couper la connection à la base de données avant de fermer le serveur
app.listen(process.env.PORT_SERVEUR, async () => {
    try {
        console.log('trying to connect to database');
        await prisma.$connect();
        console.log('running migrations');

        await migrer();

        console.log(`The application is listening on ${process.env.API_URL} !`);
    } catch (error) {
        console.log(error);
        throw error;
    }
})
