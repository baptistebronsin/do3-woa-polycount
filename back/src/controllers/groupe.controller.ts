import { RequestHandler, Request, Response } from "express";
import moment from "moment";
import crypto from 'crypto';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Groupe, Participant_Groupe, Token, Utilisateur } from "@prisma/client";
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas créer un groupe partagé car votre compte est en cours de désactivation."
        });

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
                await groupe_service.ajouter_participant(creation_groupe.pk_groupe_id, null, participants[index], null);
            }
        } catch (error: PrismaClientKnownRequestError | any) {
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de l'ajout de participants au groupe.",
                erreur: error
            });
        }
    }

    try {
        await groupe_service.ajouter_participant(creation_groupe.pk_groupe_id, utilisateur_id, null, new Date());
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

export const modifier_groupe: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id, nom, description, lien_image } = req.body;

    if (!["number"].includes(typeof groupe_id) || !["string"].includes(typeof nom) || nom == "" || (description && !["string"].includes(typeof description)) || (lien_image && !["string"].includes(typeof lien_image)))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false },
                { nom: "nom", type: "string", facultatif: false },
                { nom: "description", type: "string", facultatif: true },
                { nom: "lien_image", type: "string", facultatif: true }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas modifier un groupe partagé car votre compte est en cours de désactivation."
        });

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(Number(groupe_id));

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
            message: "Seul l'administrateur du groupe partagé peut modifier le groupe."
        });

    let groupe_modifie: Groupe | null = null;

    try {
        groupe_modifie = await groupe_service.modifier_groupe(Number(groupe_id), nom, description, lien_image);

        if (!groupe_modifie)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe n'a pas pu être modifié."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        console.log(error);
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification du groupe.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Le groupe a bien été modifié.",
        data: {
            ...groupe_modifie,
            cree_le: moment(groupe_modifie.cree_le).format(moment_date_time_format),
            cloture_le: groupe_modifie.cloture_le ? moment(groupe_modifie.cloture_le).format(moment_date_time_format) : null
        }
    });
}

export const cloturer_groupe: RequestHandler = async (req: Request, res: Response) => {
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas clôturer un groupe partagé car votre compte est en cours de désactivation."
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
            message: "Une erreur serveur est survenue lors récupération des informations du groupe.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut clôturer le groupe."
        });

    let groupe_cloture: Groupe | null = null;

    try {
        groupe_cloture = await groupe_service.cloturer_groupe(groupe_id);

        if (!groupe_cloture)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe n'a pas pu être clôturé."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        console.log(error);
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la clôture du groupe.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Le groupe a bien été clôturé.",
        data: {
            ...groupe_cloture,
            cree_le: moment(groupe_cloture.cree_le).format(moment_date_time_format),
            cloture_le: groupe_cloture.cloture_le ? moment(groupe_cloture.cloture_le).format(moment_date_time_format) : null
        }
    });
}

export const quitter_groupe: RequestHandler = async (req: Request, res: Response) => {
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
            message: "Une erreur serveur est survenue lors récupération des informations du groupe.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id == utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "L'administrateur du groupe partagé ne peut pas quitter son groupe."
        });

    let participant_existant: Participant_Groupe | null = null;

    try {
        const participants_existant: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_id);

        participant_existant = participants_existant.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id);
        
        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous n'êtes pas affilié à ce groupe."
            });
        
        if (participant_existant.quitte_le != null)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous avez déjà quitté ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        console.log(error);
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue.",
            erreur: error
        });
    }

    let participant_modifie: Participant_Groupe | null = null;

    try {
        participant_modifie = await groupe_service.quitter_participant(participant_existant.pk_participant_groupe_id);
    } catch (error: PrismaClientKnownRequestError | any) {
        console.log(error);
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Vous avez bien quitté le groupe partagé.",
        data: {
            ...participant_modifie,
            rejoint_le: moment(participant_modifie.rejoint_le).format(moment_date_time_format),
            quitte_le: participant_modifie.quitte_le ? moment(participant_modifie.quitte_le).format(moment_date_time_format) : null
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

export const creer_participant_fictif: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id, nom_participant } = req.body;

    if (!["number"].includes(typeof groupe_id) || !["string"].includes(typeof nom_participant))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false },
                { nom: "nom_participant", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    if (nom_participant.length > 30)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le nom du participant ne doit pas faire plus de 30 caractères."
        });

    const groupe_id_number: number = Number(groupe_id);

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
            message: "Vous ne pouvez pas ajouteur un participant fictif à un groupe partagé car votre compte est en cours de désactivation."
        });

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(groupe_id_number);

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

    let participant_creation: Participant_Groupe | null = null;

    try {
        participant_creation = await groupe_service.ajouter_participant(groupe_id_number, null, nom_participant, null);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de l'ajout du participant au groupe.",
                erreur: error
            });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "L'utilisateur fictif a bien été créé.",
        data: participant_creation
    });
}

export const modifier_participant: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { participant_groupe_id, nom, peut_creer_depense, peut_modifier_depense, peut_supprimer_depense, peut_manipuler_tag, peut_modifier_montant_max_depense, montant_max_depense } = req.body;

    if (!["number"].includes(typeof participant_groupe_id) || (nom != null && !["string"].includes(typeof nom)) || !["boolean"].includes(typeof peut_creer_depense) || !["boolean"].includes(typeof peut_modifier_depense) || !["boolean"].includes(typeof peut_supprimer_depense) || !["boolean"].includes(typeof peut_manipuler_tag) || !["boolean"].includes(typeof peut_modifier_montant_max_depense) || (montant_max_depense != null && !["number"].includes(typeof montant_max_depense)))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "participant_groupe_id", type: "number", facultatif: false },
                { nom: "nom", type: "string", facultatif: true },
                { nom: "peut_creer_depense", type: "boolean", facultatif: false },
                { nom: "peut_modifier_depense", type: "boolean", facultatif: false },
                { nom: "peut_supprimer_depense", type: "boolean", facultatif: false },
                { nom: "peut_manipuler_tag", type: "boolean", facultatif: false },
                { nom: "peut_modifier_montant_max_depense", type: "boolean", facultatif: false },
                { nom: "montant_max_depense", type: "number", facultatif: true }
            ]
        });

    if (isNaN(Number(participant_groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_groupe_id doit être un nombre."
        });

    if (nom != null && nom.length > 30)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le nom du participant ne doit pas faire plus de 30 caractères."
        });

    if (montant_max_depense != null && montant_max_depense < 0)
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le montant maximum de dépense doit être un nombre positif."
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
            message: "Vous ne pouvez pas modifier un participant fictif à un groupe partagé car votre compte est en cours de désactivation."
        });

    let participant_existant: Participant_Groupe | null = null;

    try {
        participant_existant = await groupe_service.recuperer_participant(Number(participant_groupe_id));

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun participant trouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du participant.",
            erreur: error
        });
    }

    if (nom == null && participant_existant.fk_utilisateur_id == null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Ce participant est fictif, vous devez renseigner un nom."
        });

    const nom_formate: string | null = participant_existant.fk_utilisateur_id ? null : nom;

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(participant_existant.fk_groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe du participant n'a pas été retrouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du groupe du participant.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut modifier les informations des participants de son groupe."
        });

    let participant_modifie: Participant_Groupe | null = null;

    try {
        participant_modifie = await groupe_service.modifier_participant(participant_existant.pk_participant_groupe_id, nom_formate, peut_creer_depense, peut_modifier_depense, peut_supprimer_depense, peut_manipuler_tag, peut_modifier_montant_max_depense, montant_max_depense);

        if (!participant_modifie)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'a pas pu être modifié."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des données du participant.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Le participant a bien été modifié.",
        data: {
            ...participant_modifie,
            rejoint_le: participant_modifie.rejoint_le ? moment(participant_modifie.rejoint_le).format(moment_date_time_format) : null,
            quitte_le: participant_modifie.quitte_le ? moment(participant_modifie.quitte_le).format(moment_date_time_format) : null,
        }
    });
}

export const quitter_participant: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { participant_groupe_id } = req.body;

    if (!["number"].includes(typeof participant_groupe_id))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "participant_groupe_id", type: "number", facultatif: false }
            ]
        });

    if (isNaN(Number(participant_groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_groupe_id doit être un nombre."
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
            message: "Vous ne pouvez pas supprimer un participant fictif à un groupe partagé car votre compte est en cours de désactivation."
        });

    let participant_existant: Participant_Groupe | null = null;

    try {
        participant_existant = await groupe_service.recuperer_participant(Number(participant_groupe_id));

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun participant trouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du participant.",
            erreur: error
        });
    }

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(participant_existant.fk_groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe du participant n'a pas été retrouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du groupe du participant.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut modifier les informations des participants de son groupe."
        });

    if (participant_existant.quitte_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le participant a déjà quitté le groupe de dépense."
        });

    let participant_quitte: Participant_Groupe | null = null;

    try {
        participant_quitte = await groupe_service.quitter_participant(participant_existant.pk_participant_groupe_id);

        if (!participant_quitte)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'a pas pu être modifié."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des données du participant.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Le participant a bien quitté le groupe.",
        data: {
            ...participant_quitte,
            rejoint_le: participant_quitte.rejoint_le ? moment(participant_quitte.rejoint_le).format(moment_date_time_format) : null,
            quitte_le: participant_quitte.quitte_le ? moment(participant_quitte.quitte_le).format(moment_date_time_format) : null,
        }
    });
}

export const associer_compte_participant_fictif: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const type_token: string = "Pol03";

    const { participant_groupe_id, email } = req.body;

    if (!["number"].includes(typeof participant_groupe_id) || !["string"].includes(typeof email))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "participant_groupe_id", type: "number", facultatif: false },
                { nom: "email", type: "string", facultatif: false }
            ]
        });

    const email_formate: string = email.toLowerCase();

    if (isNaN(Number(participant_groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_groupe_id doit être un nombre."
        });

    if (!email_valide(email_formate))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Veuillez saisir une adresse email correcte."
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
            message: "Vous ne pouvez pas associer un utilisateur réel à un participant fictif à un groupe partagé car votre compte est en cours de désactivation."
        });

    let participant_existant: Participant_Groupe | null = null;

    try {
        participant_existant = await groupe_service.recuperer_participant(Number(participant_groupe_id));

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun participant trouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du participant.",
            erreur: error
        });
    }

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(participant_existant.fk_groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe du participant n'a pas été retrouvé."
            }); 
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des données du groupe du participant.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut associer des utilisateurs aux participants de son groupe."
        });

    if (participant_existant.fk_utilisateur_id != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le participant est déjà associé à un utilisateur."
        });

    if (participant_existant.quitte_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le participant a été exclu du groupe de dépense."
        });

    let utilisateur_existant_email: Utilisateur | null = null;

    try {
        utilisateur_existant_email = await utilisateur_service.recuperer_utilisateur_par_email(email_formate);

        if (!utilisateur_existant_email)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun utilisateur n'a été trouvé avec cet email."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations d'un utilisateur.",
            erreur: error
        });
    }

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_existant.pk_groupe_id);

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

    let participant_modifie: Participant_Groupe | null = null;

    try {
        participant_modifie = await groupe_service.modifier_participant(participant_existant.pk_participant_groupe_id, null, participant_existant.peut_creer_depense, participant_existant.peut_modifier_depense, participant_existant.peut_supprimer_depense, participant_existant.peut_manipuler_tag, participant_existant.peut_modifier_montant_max_depense, participant_existant.montant_max_depense);
    
        if (!participant_modifie)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'a pas pas pu être modifié."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la modification du participant.",
                erreur: error
            });
    }

    try {
        participant_modifie = await groupe_service.associer_utilisateur_a_participant(participant_modifie.pk_participant_groupe_id, utilisateur_existant_email.pk_utilisateur_id);

        if (!participant_modifie)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'a pas pas pu être modifié."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la modification du participant.",
                erreur: error
            });
    }

    const token: string = crypto.randomBytes(100).toString('hex');

    try {
        await utilisateur_service.ajouter_token(utilisateur_existant.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du token.",
            erreur: error
        });
    }

    const lien: string = process.env.APP_URL! + "/invitation-groupe?type=EMAIL&participant_id=" + participant_existant.pk_participant_groupe_id + "&token=" + token + "&groupe_token=" + groupe_existant.cree_le.getTime();

    const mail = mail_utils.contenu.mail_invitation_groupe;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant_email.genre)).replace(" $_NOM_$", (utilisateur_existant_email.genre ? " " + utilisateur_existant_email.nom : utilisateur_existant_email.prenom)).replace("$_NOM_GROUPE_$", groupe_existant.nom).replace("$_PRENOM_INVITEUR_$", utilisateur_existant.prenom).replace("$_NOM_INVITEUR_$", utilisateur_existant.nom).replace("$_URL_TOKEN_$", lien).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
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
            participant: participant_modifie,
            utilisateur: utilisateur_formate
        }
    });
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas ajouter un utilisateur à un groupe partagé car votre compte est en cours de désactivation."
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
        participant_creation = await groupe_service.ajouter_participant(groupe_id, utilisateur_existant_email.pk_utilisateur_id, null, null);
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
            message: "Une erreur serveur est survenue lors de la création du token.",
            erreur: error
        });
    }

    const lien: string = process.env.APP_URL! + "/invitation-groupe?type=EMAIL&participant_id=" + participant_creation.pk_participant_groupe_id + "&token=" + token + "&groupe_token=" + groupe_existant.cree_le.getTime();

    const mail = mail_utils.contenu.mail_invitation_groupe;
    const contenu_mail: string = mail.contenu.replace("$_GENRE_$", genre_utilisateur(utilisateur_existant_email.genre)).replace(" $_NOM_$", (utilisateur_existant_email.genre ? " " + utilisateur_existant_email.nom : utilisateur_existant_email.prenom)).replace("$_NOM_GROUPE_$", groupe_existant.nom).replace("$_PRENOM_INVITEUR_$", utilisateur_existant.prenom).replace("$_NOM_INVITEUR_$", utilisateur_existant.nom).replace("$_URL_TOKEN_$", lien).replace("$_TEMPS_VALIDITE_TOKEN_$", temps_validation[type_token]) + mail.signature;
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

export const ajouter_participant_email_verification: RequestHandler = async (req: Request, res: Response) => {
    const { participant_id, token, groupe_token } = req.body;

    if (!["number"].includes(typeof participant_id) || !["string"].includes(typeof token) || token == "" || !["number"].includes(typeof groupe_token))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "participant_id", type: "number", facultatif: false },
                { nom: "token", type: "string", facultatif: false },
                { nom: "groupe_token", type: "number", facultatif: false }
            ]
        });

    if (isNaN(Number(participant_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_id doit être un nombre."
        });

    if (isNaN(Number(groupe_token)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_token doit être un nombre."
        });

    const participant_id_number: number = Number(participant_id);
    const groupe_token_number: number = Number(groupe_token);

    let participant_existant: Participant_Groupe | null = null;

    try {
        participant_existant = await groupe_service.recuperer_participant(participant_id_number);

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des informations du participant.",
                erreur: error
            });
    }

    if (participant_existant.rejoint_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous avez déjà déjà rejoint le groupe."
        });

    if (participant_existant.quitte_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous avez déjà quitté le groupe."
        });

    if (participant_existant.fk_utilisateur_id == null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le participant n'est pas un utilisateur."
        });

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(participant_existant.fk_groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });

        if (groupe_existant.cree_le.getTime() != groupe_token_number)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });

        if (groupe_existant.cloture_le != null)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé est déjà cloturé."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des informations du groupe.",
                erreur: error
            });
    }

    let utilisateur_createur_existant: Utilisateur | null = null;

    try {
        utilisateur_createur_existant = await utilisateur_service.recuperer_utilisateur_par_id(groupe_existant.fk_utilisateur_createur_id);

        if (!utilisateur_createur_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "L'utilisateur créateur du groupe n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des informations de l'utilisateur créateur du groupe.",
                erreur: error
            });
    }
    
    try {
        const token_existant: Token | null = await utilisateur_service.recuperer_token(utilisateur_createur_existant.pk_utilisateur_id, token + "", "Pol03");

        if (!token_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token n'existe pas."
            });

        if (token_existant.date_desactivation < new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token a expiré."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des informations du token.",
                erreur: error
            });
    }

    try {
        await groupe_service.rejoindre_groupe(participant_id_number);
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la mise à jour du participant.",
                erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Vous avez bien rejoint le groupe."
    });
}

export const recuperer_groupe_email_verification: RequestHandler = async (req: Request, res: Response) => {
    const { participant_id, token } = req.body;

    const type_token: string = "Pol03";

    if (!["number"].includes(typeof participant_id) || !["string"].includes(typeof token))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "participant_id", type: "number", facultatif: false },
                { nom: "token", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(participant_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le participant_id doit être un nombre."
        });

    let participant_existant: Participant_Groupe | null = null;

    try {
        participant_existant = await groupe_service.recuperer_participant(Number(participant_id));

        if (!participant_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le participant n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération du participant du groupe partagé.",
                erreur: error
            });
    }

    if (participant_existant.rejoint_le != null && participant_existant.quitte_le == null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Ce participant a déjà rejoint ce groupe de dépense."
        });

    let groupe_existant: Groupe | null = null;

    try {
        groupe_existant = await groupe_service.recuperer_groupe(participant_existant.fk_groupe_id);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue récupération des informations du groupe.",
            erreur: error
        });
    }

    try {
        const token_existant: Token | null = await utilisateur_service.recuperer_token(groupe_existant.fk_utilisateur_createur_id, token+"", type_token);

        if (!token_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token n'existe pas."
            });

        if (token_existant.date_desactivation < new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token a expiré."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue récupération des informations du groupe.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici le groupe qui vous invite.",
        data: {
            ...groupe_existant,
            cree_le: moment(groupe_existant.cree_le).format(moment_date_time_format),
            cloture_le: groupe_existant.cloture_le ? moment(groupe_existant.cloture_le).format(moment_date_time_format) : null
        }
    });
}

export const ajouter_participant_lien: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let { groupe_id } = req.body;

    const type_token: string = "Pol04";

    if (!["number"].includes(typeof groupe_id))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
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

    if (utilisateur_existant.desactive_le != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Vous ne pouvez pas créer de lien d'invitation à un groupe partagé car votre compte est en cours de désactivation."
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
            message: "Une erreur serveur est survenue lors récupération des informations du groupe.",
            erreur: error
        });
    }

    if (groupe_existant.fk_utilisateur_createur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Seul l'administrateur du groupe partagé peut créer des liens d'invitations."
        });

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

    const token: string = crypto.randomBytes(100).toString('hex');

    try {
        await utilisateur_service.ajouter_token(utilisateur_existant.pk_utilisateur_id, token, type_token, temps_validation[type_token]);
    } catch (error) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du token.",
            erreur: error
        });
    }

    const lien: string = process.env.APP_URL! + "/invitation-groupe?type=LIEN&groupe_id=" + groupe_existant.pk_groupe_id + "&token=" + token + "&groupe_token=" + groupe_existant.cree_le.getTime();

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Un lien d'invitation a bien été créé.",
        data: {
            url: lien,
            temps_valide: temps_validation[type_token]
        }
    });
}

export const ajouter_participant_lien_verification: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id, token, groupe_token } = req.body;

    if (!["number"].includes(typeof groupe_id) || !["string"].includes(typeof token) || !["number"].includes(typeof groupe_token))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false },
                { nom: "token", type: "string", facultatif: false },
                { nom: "groupe_token", type: "number", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    if (isNaN(Number(groupe_token)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_token doit être un nombre."
        });

    const groupe_id_number: number = Number(groupe_id);
    const groupe_token_number: number = Number(groupe_token);

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
        groupe_existant = await groupe_service.recuperer_groupe(groupe_id_number);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });

        if (groupe_existant.cree_le.getTime() != groupe_token_number)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue récupération des informations du groupe.",
            erreur: error
        });
    }

    try {
        const participants: Participant_Groupe[] = await groupe_service.recuperer_participants(groupe_id_number);

        if (participants.find((participant: Participant_Groupe) => participant.fk_utilisateur_id == utilisateur_id))
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Vous êtes déjà affilié à ce groupe."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({ 
            message: "Une erreur serveur est survenue lors de la récupération des participants du groupe partagé.",
            erreur: error
        });
    }

    let token_existant: Token | null = null;

    try {
        token_existant = await utilisateur_service.recuperer_token(groupe_existant.fk_utilisateur_createur_id, token + "", "Pol04");

        if (!token_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token n'existe pas."
            });

        if (token_existant.date_desactivation < new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token a expiré."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue récupération des informations du token.",
                erreur: error
            });
    }

    if (token_existant.fk_utilisateur_id != groupe_existant.fk_utilisateur_createur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le token n'est pas correct."
        });

    try {
        await groupe_service.ajouter_participant(groupe_id_number, utilisateur_id, null, new Date());
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'ajout du participant au groupe.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Vous avez bien rejoint le groupe."
    });
}

export const recuperer_groupe_lien_verification: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const { groupe_id, token } = req.body;

    if (!["number"].includes(typeof groupe_id) || !["string"].includes(typeof token))
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans l'URL.",
            parametres: [
                { nom: "groupe_id", type: "number", facultatif: false },
                { nom: "token", type: "string", facultatif: false }
            ]
        });

    if (isNaN(Number(groupe_id)))
        return res.status(http_response_util.statuts.erreur_client.contenu_pas_autorise).json({
            message: "Le groupe_id doit être un nombre."
        });

    const groupe_id_number: number = Number(groupe_id);

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
        groupe_existant = await groupe_service.recuperer_groupe(groupe_id_number);

        if (!groupe_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le groupe partagé n'existe pas."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue récupération des informations du groupe.",
            erreur: error
        });
    }

    let token_existant: Token | null = null;

    try {
        token_existant = await utilisateur_service.recuperer_token(groupe_existant.fk_utilisateur_createur_id, token + "", "Pol04");

        if (!token_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token n'existe pas."
            });

        if (token_existant.date_desactivation < new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Le token a expiré."
            });
    } catch (error: PrismaClientKnownRequestError | any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue récupération des informations du token.",
                erreur: error
            });
    }

    if (token_existant.fk_utilisateur_id != groupe_existant.fk_utilisateur_createur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Le token n'est pas correct."
        });

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici le groupe qui vous invite.",
        data: {
            ...groupe_existant,
            cree_le: moment(groupe_existant.cree_le).format(moment_date_time_format),
            cloture_le: groupe_existant.cloture_le ? moment(groupe_existant.cloture_le).format(moment_date_time_format) : null
        }
    });
}