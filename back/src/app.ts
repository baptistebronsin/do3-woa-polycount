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
