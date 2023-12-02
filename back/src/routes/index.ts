import { Router } from "express";
import utilisateur_router from "./utilisateur.route";
import abonnement_router from "./abonnement.route";

const routes: Router = Router();

routes.use('/utilisateur', utilisateur_router)
routes.use('/abonnement', abonnement_router);

export default routes;