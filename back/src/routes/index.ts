import { Router } from "express";
import utilisateur_router from "./utilisateur.route";
import abonnement_router from "./abonnement.route";
import stripe_router from "./stripe.route";
import groupe_router from "./groupe.route";

const routes: Router = Router();

routes.use('/utilisateur', utilisateur_router);
routes.use('/abonnement', abonnement_router);
routes.use('/groupe', groupe_router);
routes.use('/stripe', stripe_router);

export default routes;