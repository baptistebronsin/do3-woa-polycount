import express from 'express';
import routes from './routes';
const cors = require('cors');

import dotenv from "dotenv";
import logger from './middlewares/logger.middleware';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(logger);
app.use(express.json());
app.use(routes);

app.get('/api', (req, res) => {
    res.status(200).json({message: "Le serveur fonctionne !"});
});

app.listen(process.env.PORT_SERVEUR, () => {
    console.log(`The application is listening on http://localhost:${process.env.PORT_SERVEUR} !`);
})