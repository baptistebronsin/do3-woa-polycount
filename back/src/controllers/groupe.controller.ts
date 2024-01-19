import { RequestHandler, Request, Response } from "express";
import moment from "moment";
import crypto from 'crypto';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Groupe, Participant_Groupe, Utilisateur } from "@prisma/client";
import * as utilisateur_service from "../services/utilisateur.service";
import * as groupe_service from '../services/groupe.service';
import * as http_response_util from '../utils/http_response.utils';
import { moment_date_time_format } from "../utils/moment.utils";
import { temps_validation } from "../utils/token.utils";
import * as mail_utils from '../utils/mail.utils';
import { genre_utilisateur } from "../functions/genre.function";
import { envoyer_mail } from "../functions/mail.function";
import { email_valide } from "../functions/verification.function";

export const recuperer_tous_groupes: RequestHandler = async (req: Request, res: Response) => {
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

    try {
        const groupes: Groupe[] = await groupe_service.recuperer_tous_groupes(utilisateur_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Voici tous les groupes où vous êtes affiliés.",
            data: groupes.map((groupe: Groupe) => ({
                ...groupe,
                cree_le: moment(groupe.cree_le).format(moment_date_time_format),
                cloture_le: groupe.cloture_le ? moment(groupe.cloture_le).format(moment_date_time_format) : null
            }))
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des groupes partagés.",
            erreur: error
        });
    }
}

export const recuperer_un_groupe: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id_param } = req.params;

    if (!["string"].includes(typeof groupe_id_param) || groupe_id_param == "")
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id_param)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    const groupe_id: number = Number(groupe_id_param);

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

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations du groupe.",
            erreur: error
        });
    }

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_id);

        if (!participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id && participant.quitte_le == null))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici le groupe partagé.",
        data: {
            ...groupe_existant,
            cree_le: moment(groupe_existant.cree_le).format(moment_date_time_format),
            cloture_le: groupe_existant.cloture_le ? moment(groupe_existant.cloture_le).format(moment_date_time_format) : null
        }
    });
}

export const creation_groupe: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { nom, description, lien_image, participants } = req.body;

    if (!["string"].includes(typeof nom) || nom == "" || (description && !["string"].includes(typeof description)) || (lien_image && !["string"].includes(typeof lien_image)) || (participants != null && !(participants instanceof Array)))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "nom", type: "string", facultatif: false },
                { nom: "description", type: "string", facultatif: true },
                { nom: "lien_image", type: "string", facultatif: true },
                { nom: "participants", type: "list", facultatif: true }
            ]
        });

    if (nom.length > 50)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Veuillez saisir un nom de groupe avec au maximum 50 caractères."
        });

    if (description != null && description.length > 200)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Veuillez saisir une description de groupe avec au maximum 200 caractères."
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

    let creation_groupe: Groupe | null = null;

    try {
        creation_groupe = await groupe_service.creer_groupe(nom, description, utilisateur_id, lien_image);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du groupe.",
            erreur: error
        });
    }

    if (participants != null) {
        try {
            for(let index: number = 0; index < participants.length; index++) {
                await groupe_service.ajouter_participant(creation_groupe.pk_groupe_id, null, participants[index]);
            }
        } catch (error: PrismaClientKnownRequestError | any) {
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de l'ajout de participants au groupe.",
                erreur: error
            });
        }
    }

    try {
        await groupe_service.ajouter_participant(creation_groupe.pk_groupe_id, utilisateur_id, null);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'ajout du participant principal au groupe.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Le groupe partagé a bien été créé.",
        data: {
            ...creation_groupe,
            cree_le: moment(creation_groupe.cree_le).format(moment_date_time_format)
        }
    });
}

export const recuperer_participants: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id_param } = req.params;

    if (!["string"].includes(typeof groupe_id_param) || groupe_id_param == "")
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id_param)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    const groupe_id: number = Number(groupe_id_param);

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

    try {
        const groupes: Groupe[] = await groupe_service.recuperer_tous_groupes(utilisateur_id);

        if (!groupes.find((groupe: Groupe) => groupe.pk_groupe_id == groupe_id))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des groupes.",
            erreur: error
        });
    }

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Voici tous les participants du groupe partagé.",
            data: participants.map((participants: Participant_Groupe) => ({
                ...participants,
                rejoint_le: participants.rejoint_le ? moment(participants.rejoint_le).format(moment_date_time_format) : null,
                quitte_le: participants.quitte_le ? moment(participants.quitte_le).format(moment_date_time_format) : null
            }))
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
            erreur: error
        });
    }
}

export const ajouter_participant_email: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let { groupe_id, email } = req.body;

    const type_token: string = "Pol03";

    if (!["number"].includes(typeof groupe_id) || !["string"].includes(typeof email) || email == "")
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false },
                { nom: "email", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    if (!email_valide(email))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "L'email n'est pas valide."
        });

    groupe_id = Number(groupe_id);

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

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors récupération des informations du groupe.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut envoyer des invitations."
        });

    let utilisateur_existant_email: Utilisateur | null = null;

    try {
        utilisateur_existant_email = await utilisateur_service.recuperer_utilisateur_par_email(email);

        if (!utilisateur_existant_email)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé avec cet email."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors récupération des informations de l'utilisateur.",
                erreur: error
            });
    }

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_id);

        if (!participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id && participant.quitte_le == null))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });

        if (participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_existant_email.pk_utilisateur_id))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "L'utilisateur est déjà affilié à ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
                erreur: error
            });
    }

    let participant_creation: Participant_Groupe | null = null;

    try {
        participant_creation = await groupe_service.ajouter_participant(groupe_id, utilisateur_existant_email.pk_utilisateur_id, null);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de l'ajout du participant au groupe.",
                erreur: error
            });
    }

    const token: string = crypto.randomBytes(100).toString('hex');

    try {
        await utilisateur_service.ajouter_token(utilisateur_existant.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du token. Mais l'utilisateur a bien été créé.",
            erreur: error
        });
    }

    const mail = mail_utils.contenu.mail_invitation_groupe;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant_email.genre)).replace(" $_NOM_$", (utilisateur_existant_email.genre ? " " + utilisateur_existant_email.nom : utilisateur_existant_email.prenom)).replace("$_NOM_GROUPE_$", groupe_existant.nom).replace("$_PRENOM_INVITEUR_$", utilisateur_existant.prenom).replace("$_NOM_INVITEUR_$", utilisateur_existant.nom).replace("$_URL_TOKEN_$", process.env.API_URL! + "/groupe/participant/email/verification?email=" + utilisateur_existant_email.email + "&token=" + token).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
    const etat_mail: boolean = await envoyer_mail(utilisateur_existant_email.email, mail.entete, contenu_mail);

    if (!etat_mail)
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue de l'envoi du mail de bienvenue."
        });

    const utilisateur_formate: any = {
        pk_utilisateur_id: utilisateur_existant_email.pk_utilisateur_id,
        nom: utilisateur_existant_email.nom,
        prenom: utilisateur_existant_email.prenom,
        genre: utilisateur_existant_email.genre,
        email: utilisateur_existant_email.email
    };

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "un mail d'invitation a bien été envoyé.",
        data: {
            participant: participant_creation,
            utilisateur: utilisateur_formate
        }
    });
}