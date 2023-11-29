import { RequestHandler, Request, Response } from "express";
import moment from "moment";
import bcryptjs from "bcryptjs"
import crypto from 'crypto';
import { capitalize_name } from "../functions/capitalise_name.function";
import { email_valide, genre_valide } from "../functions/verification.function";
import * as utilisateur_service from "../services/utilisateur.service";
import * as http_response_util from '../utils/http_response.utils';
import * as mail_utils from '../utils/mail.utils';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Suspension, Token, Utilisateur } from "@prisma/client";
import dotenv from "dotenv";
import { envoyer_mail } from "../functions/mail.function";
import { genere_token } from "../middlewares/token.middleware";
import { moment_date_time_format } from "../utils/moment.utils";
import { genre_utilisateur } from "../functions/genre.function";
import { temps_validation } from "../utils/token.utils";

dotenv.config();

export const creation_compte: RequestHandler = async (req: Request, res: Response) => {
    const {nom, prenom, genre, email, mot_de_passe} = req.body;

    const type_token: string = "Pol01";

    if (!nom || !prenom || !email || !mot_de_passe)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["nom", "prenom", "email", "mot_de_passe"]
        });

    const nom_formate: string = capitalize_name(nom);
    const prenom_formate: string = capitalize_name(prenom);
    const genre_formate: string = genre ? genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase() : null;
    const email_formate: string = email.toLowerCase();

    if (!genre_valide(genre_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir un genre valide ('M', 'Mme', 'Mlle', null)."
        });

    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    const email_domaine: string[] = email_formate.split('@')[1].split('.');

    // Si l'envoie de mail posera problème avec le domaine
    if (mail_utils.domaines_black_liste.find((email: string) => email == email_domaine[email_domaine.length - 2]))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Les adresses email '" + email_domaine[email_domaine.length - 2] + "' ne sont pas prises en charge."
        });

    const mot_de_passe_crypte = await bcryptjs.hash(mot_de_passe, 8);

    try {
        const utilisateur_existant: Utilisateur | null = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);

        if (utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Un utilisateur possède déjà cette adresse email."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification de l'unicité de l'email.",
            erreur: error
        });
    }

    let utilisateur_cree: Utilisateur | null = null;
    
    try {
        utilisateur_cree = await utilisateur_service.ajouter_utilisateur(nom_formate, prenom_formate, genre_formate, email_formate, mot_de_passe_crypte);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création de l'utilisateur.",
            erreur: error
        });
    }
    
    const token: string = crypto.randomBytes(100).toString('hex');

    try {
        await utilisateur_service.ajouter_token(utilisateur_cree.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du token. Mais l'utilisateur a bien été créé.",
            erreur: error
        });
    }

    const mail = mail_utils.contenu.mail_bienvenue;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_cree.genre)).replace(" $_NOM_$", (utilisateur_cree.genre ? " " + utilisateur_cree.nom : utilisateur_cree.prenom)).replace("$_URL_TOKEN_$", process.env.API_URL! + "/utilisateur/verification_compte?email=" + utilisateur_cree.email + "&token=" + token).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(email_formate, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de bienvenue."
        });
    
    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Votre comtpe a bien été créé.",
        data: {
            ...utilisateur_cree,
            cree_le: moment(utilisateur_cree.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_cree.valide_le ? moment(utilisateur_cree.valide_le).format(moment_date_time_format) : null,
            desactive_le: utilisateur_cree.desactive_le ? moment(utilisateur_cree.desactive_le).format(moment_date_time_format) : null
        }
    });
}

export const connexion: RequestHandler = async (req: Request, res: Response) => {
    const {email, mot_de_passe} = req.body;

    if (!email || !mot_de_passe)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["email", "mot_de_passe"]
        });

    const email_formate: string = email.toLowerCase();

    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    let utilisateur_existant: Utilisateur | null = null;
    
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    if (!utilisateur_existant)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "L'email ou le mot de passe est incorrect."
        });

    // On compare le mot de passe à celui de la bdd
    bcryptjs.compare(mot_de_passe, utilisateur_existant.mot_de_passe, async (err: any, result: any) => {
        if (err)
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la vérification du mot de passes de l'utilisateur."
            });

        if (!result)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "L'email ou le mot de passe est incorrect."
            });
    });

    // Si l'utilisateur possède une suspension
    try {
        const suspension_utilisateur: Suspension | null = await utilisateur_service.recuperer_suspension(utilisateur_existant.pk_utilisateur_id, new Date());

        if (suspension_utilisateur)
            return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
                message: "Votre compte a été suspendu.",
                data: suspension_utilisateur
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification des suspensions.",
            erreur: error
        });
    }

    // Si le compte a été vérifie, alors on génère un token de connexion
    if (utilisateur_existant.valide_le)
        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Connexion réussie.",
            data: {
                ...utilisateur_existant,
                cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
                valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
                desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
            },
            token: genere_token(utilisateur_existant.pk_utilisateur_id)
        });
    else
        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Connexion réussie. Veuillez faire vérifier votre compte.",
            data: {
                ...utilisateur_existant,
                cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
                valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
                desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
            },
            token: null
        });
}

export const verification_compte: RequestHandler = async (req: Request, res: Response) => {
    const {email, token} = req.query;

    if (!email || !token || typeof email != "string" || typeof token != "string")
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: ["email", "token"]
        });

    const email_formate: string = email.toLocaleString();

    // Si l'email n'est pas valide
    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche un utilisateur dans la bdd avec l'email
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);
        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations de l'utilisateur.",
            erreur: error
        });
    }

    // Si l'utilisateur a déjà validé son compte
    if (utilisateur_existant.valide_le)
        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Votre compte a déjà été validé."
        });

    let token_actif: Token | null = null;

    // On cherche un token actif pour cet utilisateur
    try {
        token_actif = await utilisateur_service.recuperer_token(utilisateur_existant.pk_utilisateur_id, token, "Pol01");
        if (!token_actif)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "La vérification de votre compte n'a pas pu se réaliser."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations sur le token.",
            erreur: error
        });
    }

    // Si le token est périmé
    if (token_actif.date_creation > new Date() || token_actif.date_desactivation < new Date())
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le token n'est plus valable.",
            data: token_actif
        });

    // On met à jour les informations de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            valide_le: new Date()
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la mise à jour des informations de l'utilisateur.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Votre compte a bien été vérifié."
    });
}

export const modification_email_non_verifie: RequestHandler = async (req: Request, res: Response) => {
    const {utilisateur_id, email} = req.body;

    if (!utilisateur_id || !email)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["utilisateur_id", "email"]
        });

    // Si la valeur n'est pas un nombre
    if (isNaN(utilisateur_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'utilisateur_id'."
        });

    const utilisateur_id_formate: number = Number(utilisateur_id);
    const email_formate: string = email.toLowerCase();

    // Si l'email n'est pas valide
    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    // On vérifie qu'un utilisateur existe dans la bdd avec cette PK 
    let utilisateur_existant: Utilisateur | null = null;
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id_formate);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification de l'existance de l'utilisateur.",
            erreur: error
        });
    }

    // Si l'email est déjà vérifiée, alors erreur
    if (utilisateur_existant.valide_le)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Cette adresse email est vérifiée, veuillez la modifier depuis votre espace personnel."
        });

    // Si l'email de la bdd est la même que la nouvelle
    if (utilisateur_existant.email == email_formate)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Cette adresse email est déjà associé à ce compte."
        });

    // Si un utilisateur possède déjà cette email
    try {
        const utilisateur_existant_meme_email: Utilisateur | null = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);

        if (utilisateur_existant_meme_email)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Cette adresse email est déjà utilisée."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification de la disponibilité de l'adresse email.",
            erreur: error
        });
    }

    // On modifie l'email dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            email: email_formate
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des données de l'utilisateur.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "La modification de l'adresse email a bien été prise en compte.",
        data: {
            ...utilisateur_existant,
            email: email_formate,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
            desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
        }
    });
}

export const mot_de_passe_oublie: RequestHandler = async (req: Request, res: Response) => {
    const {email} = req.body;

    const type_token: string = "Pol02";

    if (!email)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["email"]
        });

    const email_formate: string = email.toLowerCase();

    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    let utilisateur_existant: Utilisateur | null = null;

    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);
        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification de l'existance de l'utilisateur.",
            erreur: error
        });
    }

    try {
        const utilisateur_tokens: Token[] = await utilisateur_service.recuperer_tous_tokens(utilisateur_existant.pk_utilisateur_id);

        const token_actif: Token | undefined = utilisateur_tokens.find((token: Token) => token.type_verification == "Pol02" && token.date_creation <= new Date() && token.date_desactivation >= new Date());

        if (token_actif)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Un mail vous a déjà été envoyé, veuillez regarder dans votre boîte avant d'en regénérer un nouveau."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de récupération de tous les tokens.",
            erreur: error
        });
    }

    if (!utilisateur_existant.valide_le)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Votre compte n'a pas encore été vérifié, veuillez contacter le support : " + process.env.MAIL!
        });

    const token: string = crypto.randomBytes(100).toString('hex');
    try {
        await utilisateur_service.ajouter_token(utilisateur_existant.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'ajout du token.",
            erreur: error
        });
    }

    const mail = mail_utils.contenu.reinitialisation_mot_de_passe;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant.genre)).replace(" $_NOM_$", (utilisateur_existant.genre ? " " + utilisateur_existant.nom : utilisateur_existant.prenom)).replace("$_URL_TOKEN_$", process.env.API_URL! + "/utilisateur/mot_de_passe_oublie/" + utilisateur_existant.email + "/" + token).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(email_formate, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail pour réinitialiser le mot de passe."
        });

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Un mail contenant un lien de réinitialisation de mot de passe vous a été envoyé."
    });
}

export const modification_mot_de_passe_oublie: RequestHandler = async (req: Request, res: Response) => {
    const {email, token, mot_de_passe} = req.body;

    if (!email || !token || !mot_de_passe)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["email", "token", "mot_de_passe"]
        });

    const email_formate: string = email.toLowerCase();

    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });
    
    let utilisateur_existant: Utilisateur | null = null;

    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_email(email);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification de l'existance de l'utilisateur.",
            erreur: error
        });
    }

    let token_actif: Token | undefined;

    try {
        const tokens: Token[] = await utilisateur_service.recuperer_tous_tokens(utilisateur_existant.pk_utilisateur_id);

        token_actif = tokens.find((token_find: Token) => token_find.fk_utilisateur_id == utilisateur_existant.pk_utilisateur_id && token_find.type_verification == "Pol02" && token_find.token == token);

        if (!token_actif)
            return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
                message: "Aucun token n'a été trouvé."
            });

        if (token_actif.date_creation > new Date() || token_actif.date_desactivation < new Date())
            return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
                message: "Ce token ne peut pas être utilisable.",
                data: token_actif
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la vérification du token.",
            erreur: error
        });
    }

    const mot_de_passe_crypte = await bcryptjs.hash(mot_de_passe, 8);

    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            mot_de_passe: mot_de_passe_crypte
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification du mot de passe.",
            erreur: error
        });
    }

    try {
        await utilisateur_service.modifier_token({
            ...token_actif,
            date_desactivation: new Date()
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification de la date de désactivation du token.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Le mot de passe a bien été mis à jour."
    });
}

export const informations_utilisateur: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche un utilisateur depuis son id
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici vos informations",
        data: utilisateur_existant
    });
}

export const modification_informations: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const {nom, prenom, genre} = req.body;

    if (!nom || !prenom)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["nom", "prenom"]
        });

    const nom_formate: string = capitalize_name(nom);
    const prenom_formate: string = capitalize_name(prenom);
    const genre_formate: string = genre ? genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase() : null;

    // On vérifie que le genre est bien orthographié
    if (!genre_valide(genre_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir un genre valide ('M', 'Mme', 'Mlle', null)."
        });

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche l'utilisateur depuis son token JWT
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    // On modifie les informations de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            nom: nom_formate,
            prenom: prenom_formate,
            genre: genre_formate
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des données de l'utilisateur.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Les données ont bien été mises à jour.",
        data: {
            ...utilisateur_existant,
            nom: nom_formate,
            prenom: prenom_formate,
            genre: genre_formate,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
            desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
        }
    });
}

export const modification_email: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const type_token: string = "Pol01";

    const {email} = req.body;

    if (!email)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["email"]
        });

    const email_formate: string = email.toLowerCase();

    // Si l'email n'est pas valide
    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez saisir une adresse email valide."
        });

    const email_domaine: string[] = email_formate.split('@')[1].split('.');

    // Si l'envoie de mail posera problème avec le domaine
    if (mail_utils.domaines_black_liste.find((email: string) => email == email_domaine[email_domaine.length - 2]))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Les adresses email '" + email_domaine[email_domaine.length - 2] + "' ne sont pas prises en charge."
        });

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche l'utilisateur par son id avec son token JWT
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    // Si l'utilisateur possède déjà cette adresse email
    if (utilisateur_existant.email == email_formate)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Cette adresse email est déjà associé à votre compte."
        });

    // On modifie les informations de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            email: email_formate,
            valide_le: null
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la mise à jour des données de l'utilisateur.",
            erreur: error
        });
    }

    // On créé un token pour faire vérifier son compte
    const token: string = crypto.randomBytes(100).toString('hex');

    try {
        await utilisateur_service.ajouter_token(utilisateur_existant.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du token. Mais l'utilisateur a bien été créé.",
            erreur: error
        });
    }

    // On l'informe du changement par mail
    const mail = mail_utils.contenu.mail_notification_changement;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant.genre)).replace(" $_NOM_$", (utilisateur_existant.genre ? " " + utilisateur_existant.nom : utilisateur_existant.prenom)).replace("$_URL_TOKEN_$", process.env.API_URL! + "/utilisateur/verification_compte?email=" + utilisateur_existant.email + "&token=" + token).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(email_formate, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de bienvenue."
        });

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Votre adresse email a bien été mise à jour.",
        data: {
            ...utilisateur_existant,
            email: email_formate,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: null,
            desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
        }
    });
}

export const modification_mot_de_passe: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const {mot_de_passe} = req.body;

    if (!mot_de_passe)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["mot_de_passe"]
        });

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche l'utilisateur par son id avec son token JWT
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    const mot_de_passe_crypte = await bcryptjs.hash(mot_de_passe, 8);

    // On met à jour le mot de passe de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            mot_de_passe: mot_de_passe_crypte
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification du mot de passe de l'utilisateur.",
            erreur: error
        });
    }

    // On l'informe du changement par mail
    const mail = mail_utils.contenu.mail_notification_modification_mot_de_passe_realise;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant.genre)).replace(" $_NOM_$", (utilisateur_existant.genre ? " " + utilisateur_existant.nom : utilisateur_existant.prenom)).replace("$_MAIL_$", process.env.MAIL!).replace("$_MAIL_$", process.env.MAIL!) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(utilisateur_existant.email, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de bienvenue."
        });

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Votre mot de passe a bien été mise à jour.",
        data: {
            ...utilisateur_existant,
            mot_de_passe: mot_de_passe_crypte,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
            desactive_le: utilisateur_existant.desactive_le ? moment(utilisateur_existant.desactive_le).format(moment_date_time_format) : null
        }
    });
}

export const desactivation: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche l'utilisateur par son id avec son token JWT
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }
    
    if (utilisateur_existant.desactive_le)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Votre compte est déjà désactivé."
        });

    const maintenant: Date = new Date();

    // On modifie les données de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            desactive_le: maintenant
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la désactivation de l'utilisateur.",
            erreur: error
        });
    }

    const date_suppression_donnees: Date = new Date();
    date_suppression_donnees.setDate(maintenant.getDate() + 30);

    // On l'informe du changement par mail
    const mail = mail_utils.contenu.mail_desactivation;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant.genre)).replace(" $_NOM_$", (utilisateur_existant.genre ? " " + utilisateur_existant.nom : utilisateur_existant.prenom)).replace("$_DATE_DESACTIVATION_$", moment(date_suppression_donnees).format("DD/MM/YYYY")) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(utilisateur_existant.email, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de désactivation."
        });

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Votre comtpe a bien été désactivé.",
        data: {
            ...utilisateur_existant,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
            desactive_le: moment(maintenant).format(moment_date_time_format)
        }
    });
}

export const reactivation: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let utilisateur_existant: Utilisateur | null = null;

    // On cherche l'utilisateur par son id avec son token JWT
    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Malgré votre token jwt, nous ne vous avons pas trouvé dans la base de données."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données de l'utilisateur.",
            erreur: error
        });
    }

    if (!utilisateur_existant.desactive_le)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Votre compte est déjà activé."
        });

    // On modifie les données de l'utilisateur dans la bdd
    try {
        await utilisateur_service.modifier_utilisateur({
            ...utilisateur_existant,
            desactive_le: null
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des données de l'utilisateur.",
            erreur: error
        });
    }

    // On l'informe du changement par mail
    const mail = mail_utils.contenu.mail_reactivation;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant.genre)).replace(" $_NOM_$", (utilisateur_existant.genre ? " " + utilisateur_existant.nom : utilisateur_existant.prenom)) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(utilisateur_existant.email, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de réactivation."
        });

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Votre comtpe a bien été réactivé.",
        data: {
            ...utilisateur_existant,
            cree_le: moment(utilisateur_existant.cree_le).format(moment_date_time_format),
            valide_le: utilisateur_existant.valide_le ? moment(utilisateur_existant.valide_le).format(moment_date_time_format) : null,
            desactive_le: null
        }
    });
}