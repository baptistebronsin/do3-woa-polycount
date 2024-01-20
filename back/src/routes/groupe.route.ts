import { Router } from "express"
import * as groupe_controller from '../controllers/groupe.controller'
import { authentification } from "../middlewares/token.middleware";

const groupe_router = Router();

groupe_router.get('/', authentification, groupe_controller.recuperer_tous_groupes);
groupe_router.post('/creation', authentification, groupe_controller.creation_groupe);
groupe_router.get('/:groupe_id_param', authentification, groupe_controller.recuperer_un_groupe);
groupe_router.get('/:groupe_id_param/participants', authentification, groupe_controller.recuperer_participants);
groupe_router.put('/participant/creer', authentification, groupe_controller.creer_participant_fictif);
groupe_router.patch('/participant/modifier', authentification, groupe_controller.modifier_participant);
groupe_router.patch('/participant/quitter', authentification, groupe_controller.quitter_participant);
groupe_router.post('/participant/association_utilisateur_fictif', authentification, groupe_controller.associer_compte_participant_fictif);
groupe_router.post('/participant/email/verification', groupe_controller.ajouter_participant_email_verification);
groupe_router.post('/participant/email', authentification, groupe_controller.ajouter_participant_email);
groupe_router.put('/participant/email/verification/detail', groupe_controller.recuperer_groupe_email_verification);
groupe_router.post('/participant/lien', authentification, groupe_controller.ajouter_participant_lien);
groupe_router.post('/participant/lien/verification', authentification, groupe_controller.ajouter_participant_lien_verification);
groupe_router.put('/participant/lien/verification/detail', authentification, groupe_controller.recuperer_groupe_lien_verification);

export default groupe_router;