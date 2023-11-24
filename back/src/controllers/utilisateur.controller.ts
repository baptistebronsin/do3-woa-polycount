import { RequestHandler, Request, Response } from "express";
import moment from "moment";
import bcryptjs from "bcryptjs"
import Jwt from "jsonwebtoken";
import { capitalize_name } from "../functions/capitalise_name.function";
import { email_valide, genre_valide } from "../functions/verification.function";
import * as utilisateur_service from "../services/utilisateur.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Utilisateur } from "@prisma/client";
import dotenv from "dotenv";
import { envoyer_mail } from "../functions/mail.function";

dotenv.config();

export const creation_compte: RequestHandler = async (req: Request, res: Response) => {
    const {nom, prenom, genre, email, mot_de_passe} = req.body;

    if (!nom || !prenom || !email || !mot_de_passe)
        return res.status(400).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["nom", "prenom", "email", "mot_de_passe"]
        });

    const nom_formate: string = capitalize_name(nom);
    const prenom_formate: string = capitalize_name(prenom);
    const genre_formate: string = genre ? genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase() : null;
    const email_formate: string = email.toLowerCase();

    if (!genre_valide(genre_formate))
        return res.status(400).json({
            message: "Veuillez saisir un genre valide ('M', 'Mme', 'Mlle', null)."
        });

    if (!email_valide(email_formate))
        return res.status(400).json({
            message: "Veuillez saisir une adresse email valide."
        });

    const mot_de_passe_crypte = await bcryptjs.hash(mot_de_passe, 8);

    try {
        const utilisateur_existant: Utilisateur | null = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);

        if (utilisateur_existant)
            return res.status(400).json({
                message: "Un utilisateur possède déjà cette adresse email."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(500).json({
            message: "Une erreur serveur est survenue.",
            erreur: error
        });
    }

    const utilisateur_cree: Utilisateur | null = await utilisateur_service.ajouter_utilisateur(nom_formate, prenom_formate, genre_formate, email_formate, mot_de_passe_crypte);

    if (!utilisateur_cree)
        return res.status(500).json({
            message: "Une erreur est survenue lors de la création de l'utilisateur."
        });

    const token: string = Jwt.sign({email: email_formate}, process.env.CLE_TOKEN!, {expiresIn: "2h"});

    const token_cree: boolean = await utilisateur_service.ajouter_token(utilisateur_cree.pk_utilisateur_id, token, "Poly01", 2);

    if (!token_cree)
        return res.status(500).json({
            message: "Une erreur est survenue lors de la création du token. Mais l'utilisateur a bien été créé."
        });

    const etat_mail: boolean = await envoyer_mail(email_formate, "Création de votre compte", "Salut bg<br><br>Voici ton token pour valider la création de ton compte : " + token);

    if (!etat_mail)
        return res.status(500).json({
            message: "Une erreur est survenue de l'envoi du mail de bienvenue."
        });
    
    return res.status(201).json({
        message: "Votre comtpe a bien été créé.",
        data: utilisateur_cree
    });
}