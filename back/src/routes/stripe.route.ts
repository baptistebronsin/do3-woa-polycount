import { Router } from "express"
import * as stripe_controller from '../controllers/stripe.controller';

const stripe_router = Router();

stripe_router.post('/stripe_webhook', stripe_controller.endpoint_listener);

export default stripe_router;