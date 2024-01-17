process.env.TZ = 'Europe/Paris';

import express, { Request, Response } from 'express';
import routes from './routes';
const cors = require('cors');

import dotenv from "dotenv";
import logger from './middlewares/logger.middleware';
dotenv.config();

import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended: false}));
app.use(logger);
app.use(express.json());

// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 2000);
// });

app.use(routes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({message: "Ha l'batard il fonctionne !"});
});

app.listen(process.env.PORT_SERVEUR, () => {
    console.log(`The application is listening on ${process.env.API_URL} !`);
})