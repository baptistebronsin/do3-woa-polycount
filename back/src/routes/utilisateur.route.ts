import { Router } from "express"
import * as utilisateur_controller from '../controllers/utilisateur.controller'

const utilisateur_router = Router();

utilisateur_router.post('/sign_up', utilisateur_controller.creation_compte);

export default utilisateur_router;