import { Router } from "express"
import * as abonnement_controller from '../controllers/abonnement.controller'
import { admin_authentification } from "../middlewares/admin.middleware";
import { authentification } from "../middlewares/token.middleware";

const abonnement_router = Router();

// Partie admin
abonnement_router.post('/caracterisque_abonnement/ajouter', admin_authentification, abonnement_controller.creation_caracteristique);
abonnement_router.patch('/caracterisque_abonnement/modifier', admin_authentification, abonnement_controller.modification_caracteristique);
abonnement_router.get('/caracterisque_abonnement', admin_authentification, abonnement_controller.recuperer_toutes_caracteristiques);

// Partie admin
abonnement_router.post('/ajouter', admin_authentification, abonnement_controller.creation_abonnement);
abonnement_router.put('/desactiver', admin_authentification, abonnement_controller.desactivation_abonnement);
abonnement_router.put('/activer', admin_authentification, abonnement_controller.activer_abonnement);
abonnement_router.get('/', admin_authentification, abonnement_controller.recuperer_tous_abonnements);

abonnement_router.get('/disponible', abonnement_controller.recuperer_tous_abonnements_disponibles);
abonnement_router.post('/souscrire', authentification, abonnement_controller.souscription_abonnement);
abonnement_router.get('/souscrire', authentification, abonnement_controller.recuperer_toutes_souscriptions_abonnements_utilisateur);
abonnement_router.put('/resilier', authentification, abonnement_controller.resilier_souscription_abonnement);

// Partie admin
abonnement_router.post('/code_reduction/ajouter', admin_authentification, abonnement_controller.creation_code_reduction);
abonnement_router.patch('/code_reduction/modifier', admin_authentification, abonnement_controller.modifier_code_reduction);
abonnement_router.get('/code_reduction', admin_authentification, abonnement_controller.recuperer_tous_codes_reductions);

// Partie admin
abonnement_router.post('/offre_speciale/ajouter', admin_authentification, abonnement_controller.creation_offre_speciale);
abonnement_router.patch('/offre_speciale/modifier', admin_authentification, abonnement_controller.modifier_offre_speciale);
abonnement_router.get('/offre_speciale', admin_authentification, abonnement_controller.recuperer_toutes_offres_speciales);

export default abonnement_router;