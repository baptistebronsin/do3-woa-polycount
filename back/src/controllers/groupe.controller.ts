import { RequestHandler, Request, Response } from "express";
import moment from "moment";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Groupe, Participant_Groupe, Utilisateur } from "@prisma/client";
import * as utilisateur_service from "../services/utilisateur.service";
import * as groupe_service from '../services/groupe.service';
import * as http_response_util from '../utils/http_response.utils';
import { moment_date_time_format } from "../utils/moment.utils";

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