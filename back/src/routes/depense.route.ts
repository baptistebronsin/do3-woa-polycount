import { Router } from "express"
import * as depense_controller from '../controllers/depense.controller'
import { authentification } from "../middlewares/token.middleware";

const depense_router = Router();

depense_router.get('/tags', authentification, depense_controller.recuperer_tous_tags);
depense_router.get('/utilisateurs/:groupe_id_param', authentification, depense_controller.recuperer_tous_utilisateur);
depense_router.get('/affiliations/:groupe_id_param', authentification, depense_controller.recuperer_toutes_affiliations_depenses);
depense_router.get('/:groupe_id_param', authentification, depense_controller.recuperer_toutes_depenses);

export default depense_router;