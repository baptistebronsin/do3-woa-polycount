import { Router } from "express"
import * as utilisateur_controller from '../controllers/utilisateur.controller'
import { authentification } from "../middlewares/token.middleware";

const utilisateur_router = Router();

utilisateur_router.post('/inscription', utilisateur_controller.creation_compte);
utilisateur_router.post('/connexion', utilisateur_controller.connexion);
utilisateur_router.get('/verification_compte', utilisateur_controller.verification_compte);
utilisateur_router.put('/modifier_email_non_verifie', utilisateur_controller.modification_email_non_verifie);
utilisateur_router.put('/mot_de_passe_oublie', utilisateur_controller.mot_de_passe_oublie);
utilisateur_router.put('/modifier_mot_de_passe_oublie', utilisateur_controller.modification_mot_de_passe_oublie);

utilisateur_router.get('/informations', authentification, utilisateur_controller.informations_utilisateur);
utilisateur_router.patch('/modifier_informations', authentification, utilisateur_controller.modification_informations);
utilisateur_router.put('/modifier_email', authentification, utilisateur_controller.modification_email);
utilisateur_router.patch('/modifier_mot_de_passe', authentification, utilisateur_controller.modification_mot_de_passe);
utilisateur_router.put('/desactivation', authentification, utilisateur_controller.desactivation);
utilisateur_router.put('/reactivation', authentification, utilisateur_controller.reactivation);

export default utilisateur_router;