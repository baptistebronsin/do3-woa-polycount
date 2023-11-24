import { Router } from "express";
import utilisateur_router from "./utilisateur.route";

const routes: Router = Router();

routes.use('/utilisateur', utilisateur_router)

export default routes;