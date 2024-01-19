import { Router } from "express"
import * as groupe_controller from '../controllers/groupe.controller'
import { authentification } from "../middlewares/token.middleware";

const groupe_router = Router();

groupe_router.get('/', authentification, groupe_controller.recuperer_tous_groupes);
groupe_router.post('/creation', authentification, groupe_controller.creation_groupe);
groupe_router.get('/:groupe_id_param', authentification, groupe_controller.recuperer_un_groupe);
groupe_router.get('/:groupe_id_param/participants', authentification, groupe_controller.recuperer_participants);
groupe_router.post('/participant/email', authentification, groupe_controller.ajouter_participant_email);

export default groupe_router;