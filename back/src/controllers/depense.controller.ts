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

export const creer_depense: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id_param, titre, montant, url_image, participant_payeur_id, participants, tags } = req.body;

    if (!["number"].includes(typeof groupe_id_param) || !["string"].includes(typeof titre) || titre == "" || (url_image != null && !["string"].includes(typeof url_image)) || !["number"].includes(typeof participant_payeur_id) || !["number"].includes(typeof montant) || !Array.isArray(participants) || (tags != null && !Array.isArray(tags)))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                { nom: "groupe_id_param", type: "string", facultatif: false },
                { nom: "titre", type: "string", facultatif: false },
                { nom: "montant", type: "float", facultatif: false },
                { nom: "url_image", type: "string", facultatif: true },
                { nom: "participant_payeur_id", type: "number", facultatif: false },
                { nom: "participants", type: "array", facultatif: false },
                { nom: "tags", type: "array", facultatif: true }
            ]
        });

    if (isNaN(Number(groupe_id_param)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    if (isNaN(Number(montant)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le montant doit être un nombre."
        });

    if (Number(montant) <= 0)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le montant doit être supérieur à 0."
        });

    if (isNaN(Number(participant_payeur_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le paye_par doit être un nombre."
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas ajouter une dépense à un groupe partagé car votre compte est en cours de désactivation."
        });

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

    let participants_groupe: Participant_Groupe[] = [];

    try {
        participants_groupe = await groupe_service.recuperer_participants(groupe_id);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de tous les participants du groupe."
        });
    }

    let participant_existant: Participant_Groupe | null = participants_groupe.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id);

    if (!participant_existant)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous n'êtes pas affilié à ce groupe."
        });

    if (participant_existant.quitte_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous avez quitté ce groupe."
        });

    if (!participant_existant.peut_creer_depense)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous n'avez pas les permissions pour créer une dépense dans ce groupe."
        });

    let participant_payeur: Participant_Groupe | null = participants_groupe.find((participant: Participant_Groupe) => participant.pk_participant_groupe_id == Number(participant_payeur_id));

    if (!participant_payeur)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le participant payeur n'existe pas."
        });

    participants.map((p: { fk_participant_groupe_id: number, montant: number | null }) => {
        if(!participants_groupe.find((participant_groupe: Participant_Groupe) => participant_groupe.pk_participant_groupe_id == p.fk_participant_groupe_id))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n°" + p.fk_participant_groupe_id + " n'existe pas."
            });
    });

    let tags_existant: Tag[] = [];

    try {
        tags_existant = await depense_service.recuperer_tous_tags();
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de tous les tags."
        });
    }

    tags.map((t: number) => {
        if(!tags_existant.find((tag_existant: Tag) => tag_existant.pk_tag_id == t))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le tag n°" + t + " n'existe pas."
            });
    });

    let depense: Depense | null = null;

    try {
        depense = await depense_service.creer_depense(groupe_existant.pk_groupe_id, participant_payeur.pk_participant_groupe_id, titre, montant, url_image);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création de la dépense.",
            erreur: error
        });
    }

    try {
        participants.map(async (participant: { fk_participant_groupe_id: number, montant: number | null }) => {
            await depense_service.lier_depense_participants(depense.pk_depense_id, participant.fk_participant_groupe_id, participant.montant);
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la liaison de la dépense avec les participants.",
            erreur: error
        });
    }

    try {
        tags.map(async (t: number) => {
            await depense_service.lier_depense_tags(depense.pk_depense_id, t);
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la liaison de la dépense avec les tags.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "La dépense a été créée avec succès.",
        data: {
            ...depense,
            ajoute_le: moment(depense.ajoute_le).format(moment_date_time_format)
        }
    });
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

export const recuperer_tous_tags_depenses: RequestHandler = async (req: Request, res: Response) => {
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
            message: "Le groupe_id_param doit être un nombre."
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

    try {
        const tags: { fk_depense_id: number, fk_tag_id: number }[] = await depense_service.recuperer_tous_tags_depenses(groupe_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "Les tags ont été récupérées avec succès.",
            data: tags
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des tags du groupe partagé.",
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

export const supprimer_depense: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { depense_id_param } = req.params;

    if (!["string"].includes(typeof depense_id_param) || depense_id_param == "")
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "depense_id_param", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(depense_id_param)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "La depense_id_param doit être un nombre."
        });

    const depense_id: number = Number(depense_id_param);

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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas supprimer une dépense à un groupe partagé car votre compte est en cours de désactivation."
        });

    let depense_existant: Depense | null = null;

    try {
        depense_existant = await depense_service.recuperer_depense_par_id(depense_id);

        if (!depense_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "La dépense n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de la dépense.",
            erreur: error
        });
    }

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(depense_existant.fk_groupe_id);

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

    let participants_existant: Participant_Groupe | null = null;

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(depense_existant.fk_groupe_id);

        participants_existant = participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id && participant.quitte_le == null);

        if (!participants_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
            erreur: error
        });
    }

    if (!participants_existant.peut_supprimer_depense)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous n'avez pas les permissions pour supprimer une dépense dans ce groupe."
        });

    try {
        await depense_service.supprimer_depense(depense_id);

        return res.status(http_response_util.statuts.succes.ok).json({
            message: "La dépense a été supprimée avec succès."
        });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la suppression de la dépense.",
            erreur: error
        });
    }
}

export const modifier_depense: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { depense_id, titre, montant, participant_payeur_id, url_image } = req.body;

    if (!["number"].includes(typeof depense_id) || !["string"].includes(typeof titre) || titre == "" || !["number"].includes(typeof montant) || !["number"].includes(typeof participant_payeur_id) || (url_image && !["string"].includes(typeof url_image)))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                { nom: "depense_id", type: "string", facultatif: false },
                { nom: "titre", type: "string", facultatif: false },
                { nom: "montant", type: "float", facultatif: false },
                { nom: "participant_payeur_id", type: "number", facultatif: false },
                { nom: "url_image", type: "string", facultatif: true }
            ]
        });

    if (isNaN(Number(depense_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "La depense_id doit être un nombre."
        });

    if (isNaN(Number(montant)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le montant doit être un nombre."
        });

    if (Number(montant) <= 0)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le montant doit être supérieur à 0."
        });

    if (isNaN(Number(participant_payeur_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_payeur_id doit être un nombre."
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas modifier une dépense à un groupe partagé car votre compte est en cours de désactivation."
        });

    let depense_existante: Depense | null = null;

    try {
        depense_existante = await depense_service.recuperer_depense_par_id(Number(depense_id));

        if (!depense_existante)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "La dépense n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({ 
            message: "Une erreur serveur est survenue lors de la récupération de la dépense.",
            erreur: error
        });
    }
    

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(depense_existante.fk_groupe_id);

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

    let participant_existant: Participant_Groupe | null = null;

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_existant.pk_groupe_id);

        participant_existant = participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id);

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });

        if (participant_existant.quitte_le != null)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous avez quitté ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
            erreur: error
        });
    }

    if (!participant_existant.peut_modifier_depense)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous n'avez pas les permissions pour modifier une dépense dans ce groupe."
        });

    let affiliations_depense: Participant_Groupe_Liee_Depense[] = [];

    try {
        affiliations_depense = await depense_service.recuperer_toutes_affiliations_depenses(groupe_existant.pk_groupe_id);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({ 
            message: "Une erreur serveur est survenue lors de la récupération des affiliations à la dépense du groupe.",
            erreur: error
        });
    }

    if (affiliations_depense.filter((aff: Participant_Groupe_Liee_Depense) => aff.fk_depense_id == depense_existante.pk_depense_id).reduce((somme: number, aff: Participant_Groupe_Liee_Depense) => somme + aff.montant ?? 0, 0) > Number(montant))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le montant de la dépense ne peut pas être inférieur à la somme des montants des autres dépenses du groupe."
        });

    let participant_payeur: Participant_Groupe | null = null;

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_existant.pk_groupe_id);

        participant_payeur = participants.find((participant: Participant_Groupe) => participant.pk_participant_groupe_id == Number(participant_payeur_id));

        if (!participant_payeur)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant payeur n'existe pas."
            });
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({ 
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe.",
            erreur: error
        });
    }

    let depense_modifiee: Depense | null = null;

    try {
        depense_modifiee = await depense_service.modifier_depense(depense_id, titre, montant, participant_payeur.pk_participant_groupe_id, url_image);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({ 
            message: "Une erreur serveur est survenue lors de la modification de la dépense.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "La dépense a été modifiée.",
        data: {
            ...depense_modifiee,
            ajoute_le: moment(depense_modifiee.ajoute_le).format(moment_date_time_format)
        }
    });
}