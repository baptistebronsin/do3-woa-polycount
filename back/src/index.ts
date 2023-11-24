import express, { Request, Response } from 'express';
import routes from './routes';
const cors = require('cors');

import dotenv from "dotenv";
import logger from './middlewares/logger.middleware';
dotenv.config();

import { PrismaClient } from '@prisma/client'
import helmet from 'helmet';
const prisma: PrismaClient = new PrismaClient()

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended: false}));
app.use(logger);
app.use(express.json());
app.use(routes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({message: "Ha l'batard il fonctionne !"});
});

app.listen(process.env.PORT_SERVEUR, () => {
    console.log(`The application is listening on http://localhost:${process.env.PORT_SERVEUR} !`);
})