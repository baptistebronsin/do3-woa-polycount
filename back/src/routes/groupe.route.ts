import { Router } from "express"
import * as groupe_controller from '../controllers/groupe.controller'
import { authentification } from "../middlewares/token.middleware";

const groupe_router = Router();

groupe_router.get('/', authentification, groupe_controller.recuperer_tous_groupes);
groupe_router.post('/creation', authentification, groupe_controller.creation_groupe);

export default groupe_router;