import { RequestHandler, Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Depense, Groupe, Participant_Groupe, Participant_Groupe_Liee_Depense, Tag, Utilisateur } from "@prisma/client";
import * as utilisateur_service from "../services/utilisateur.service";
import * as groupe_service from '../services/groupe.service';
import * as depense_service from '../services/depense.service';
import * as http_response_util from '../utils/http_response.utils';
import moment from "moment";
import { moment_date_time_format } from "../utils/moment.utils";
import { IUtilisateur } from "../models/utilisateur.model";

export const recuperer_toutes_depenses: RequestHandler = async (req: Request, res: Response) => {
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

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id) {
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
    }

    try {
        const depenses: Depense[] = await depense_service.recuperer_toutes_depenses(groupe_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Les dépenses ont été récupérées avec succès.",
            data: depenses.map((depense: Depense) => ({
                ...depense,
                ajoute_le: moment(depense.ajoute_le).format(moment_date_time_format),
            }))
        });
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des dépenses du groupe partagé.",
            erreur: error
        });
    }
}

export const recuperer_tous_tags: RequestHandler = async (req: Request, res: Response) => {
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
        const tags: Tag[] = await depense_service.recuperer_tous_tags();

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Les tags ont été récupérées avec succès.",
            data: tags
        });
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des tags.",
            erreur: error
        });
    }
}

export const recuperer_tous_utilisateur: RequestHandler = async (req: Request, res: Response) => {
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

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id) {
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
    }

    try {
        const utilisateur: Utilisateur[] = await depense_service.recuperer_tous_utilisateur(groupe_id);

        const utilisateurs_light: IUtilisateur[] = utilisateur.map((utilisateur: Utilisateur) => ({
            pk_utilisateur_id: utilisateur.pk_utilisateur_id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            genre: utilisateur.genre,
            email: utilisateur.email
        })); 

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Les utilisateurs ont été récupérées avec succès.",
            data: utilisateurs_light
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des utilisateurs du groupe partagé.",
            erreur: error
        });
    }
}

export const recuperer_toutes_affiliations_depenses: RequestHandler = async (req: Request, res: Response) => {
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

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id) {
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
    }

    try {
        const affiliations_depenses: Participant_Groupe_Liee_Depense[] = await depense_service.recuperer_toutes_affiliations_depenses(groupe_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Les affiliations des dépenses ont été récupérées avec succès.",
            data: affiliations_depenses
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des affiliations des dépenses du groupe partagé.",
            erreur: error
        });
    }
}