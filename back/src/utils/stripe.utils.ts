import dotenv from "dotenv";
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_KEY);

export default stripe;