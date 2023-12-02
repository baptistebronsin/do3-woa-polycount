import { RequestHandler, Request, Response } from "express";
import * as http_response_util from '../utils/http_response.utils';
import * as abonnement_service from "../services/abonnement.service";
import * as utilisateur_service from '../services/utilisateur.service';
import stripe from '../utils/stripe.utils';
import Stripe from "stripe";
import { Abonnement, Caracteristique_Abonnement, Code_Reduction, Offre_Speciale, Souscription_Abonnement, Utilisateur } from "@prisma/client";
import { date_valide } from "../functions/verification.function";
import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

export const creation_caracteristique: RequestHandler = async (req: Request, res: Response) => {
    const {nom, description, nombre_max_groupe, nombre_max_participant_par_groupe, nombre_max_depense_par_groupe, couleur_clair, couleur_sombre} = req.body;

    if (!nom)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "nom",
                "description (facultatif)",
                "nombre_max_groupe (facultatif)",
                "nombre_max_participant_par_groupe (facultatif)",
                "nombre_max_depense_par_groupe (facultatif)",
                "couleur_clair (facultatif)",
                "couleur_sombre (facultatif)"
            ]
        });

    if (isNaN(nombre_max_groupe) && nombre_max_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_groupe'."
        });

    if (isNaN(nombre_max_participant_par_groupe) && nombre_max_participant_par_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_participant_par_groupe'."
        });

    if (isNaN(nombre_max_depense_par_groupe) && nombre_max_depense_par_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_depense_par_groupe'."
        });

    if (couleur_clair != null && (couleur_clair[0] != "#" || couleur_clair.length != 7))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un code couleur hexadécimal # pour 'couleur_clair'."
        });

    if (couleur_sombre != null && (couleur_sombre[0] != "#" || couleur_sombre.length != 7))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un code couleur hexadécimal # pour 'couleur_sombre'."
        });

    const nombre_max_groupe_formate: number | null = nombre_max_groupe == null ? null : Number(nombre_max_groupe);
    const nombre_max_participant_par_groupe_formate: number | null = nombre_max_participant_par_groupe == null ? null : Number(nombre_max_participant_par_groupe);
    const nombre_max_depense_par_groupe_formate: number | null = nombre_max_depense_par_groupe == null ? null : Number(nombre_max_depense_par_groupe); 

    let caracteristique_abonnement_stripe: Stripe.Product | null = null;

    try {
        caracteristique_abonnement_stripe = await stripe.products.create({
            name: nom,
            description: description,
            features: {
                "0" : {
                    "name": "Nombre maximum de groupe créé : " + (nombre_max_groupe_formate == null ? "illimité" : nombre_max_groupe_formate)
                },
                "1" : {
                    "name": "Nombre maximum de participant par groupe : " + (nombre_max_participant_par_groupe_formate == null ? "illimité" : nombre_max_participant_par_groupe_formate)
                },
                "2" : {
                    "name": "Nombre maximum de dépense par groupe : " + (nombre_max_depense_par_groupe_formate == null ? "illimité" : nombre_max_depense_par_groupe_formate)
                }
            }
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du produit Stripe.",
            erreur: error
        });
    }
    
    let caracteristique_abonnement: Caracteristique_Abonnement | null = null;

    try {
        caracteristique_abonnement = await abonnement_service.ajouter_caracteristique_abonnement(nom, description, nombre_max_groupe_formate, nombre_max_participant_par_groupe_formate, nombre_max_depense_par_groupe_formate, couleur_clair, couleur_sombre, caracteristique_abonnement_stripe.id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'ajout des caractérisque d'un abonnement.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Les caractéristiques ont bien été ajoutées.",
        data: caracteristique_abonnement
    });
}

export const modification_caracteristique: RequestHandler = async (req: Request, res: Response) => {
    const {pk_caracteristique_abonnement_id, nom, description, nombre_max_groupe, nombre_max_participant_par_groupe, nombre_max_depense_par_groupe, couleur_clair, couleur_sombre} = req.body;

    if (!pk_caracteristique_abonnement_id || !nom)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "pk_caracteristique_abonnement_id",
                "nom",
                "description (facultatif)",
                "nombre_max_groupe (facultatif)",
                "nombre_max_participant_par_groupe (facultatif)",
                "nombre_max_depense_par_groupe (facultatif)",
                "couleur_clair (facultatif)",
                "couleur_sombre (facultatif)"
            ]
        });

    if (isNaN(pk_caracteristique_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pk_caracteristique_abonnement_id'."
        });

    if (isNaN(nombre_max_groupe) && nombre_max_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_groupe'."
        });

    if (isNaN(nombre_max_participant_par_groupe) && nombre_max_participant_par_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_participant_par_groupe'."
        });

    if (isNaN(nombre_max_depense_par_groupe) && nombre_max_depense_par_groupe != null)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_max_depense_par_groupe'."
        });

    if (couleur_clair != null && (couleur_clair[0] != "#" || couleur_clair.length != 7))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un code couleur hexadécimal # pour 'couleur_clair'."
        });

    if (couleur_sombre != null && (couleur_sombre[0] != "#" || couleur_sombre.length != 7))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un code couleur hexadécimal # pour 'couleur_sombre'."
        });

    const pk_caracteristique_abonnement_id_formate: number = Number(pk_caracteristique_abonnement_id);
    const nombre_max_groupe_formate: number | null = nombre_max_groupe == null ? null : Number(nombre_max_groupe);
    const nombre_max_participant_par_groupe_formate: number | null = nombre_max_participant_par_groupe == null ? null : Number(nombre_max_participant_par_groupe);
    const nombre_max_depense_par_groupe_formate: number | null = nombre_max_depense_par_groupe == null ? null : Number(nombre_max_depense_par_groupe); 

    let caracterisque_abonnement: Caracteristique_Abonnement | null = null;

    try {
        caracterisque_abonnement = await abonnement_service.recuperer_caracteristique_abonnement_par_id(pk_caracteristique_abonnement_id_formate);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification des caractérisque de l'abonnement.",
            erreur: error
        });
    }

    let caracteristique_abonnement_stripe: Stripe.Product | null = null;

    try {
        caracteristique_abonnement_stripe = await stripe.products.update(
            caracterisque_abonnement.stripe_product_id,
            {
                name: nom,
                description: description,
                features: {
                    "0" : {
                        "name": "Nombre maximum de groupe créé : " + (nombre_max_groupe_formate == null ? "illimité" : nombre_max_groupe_formate)
                    },
                    "1" : {
                        "name": "Nombre maximum de participant par groupe : " + (nombre_max_participant_par_groupe_formate == null ? "illimité" : nombre_max_participant_par_groupe_formate)
                    },
                    "2" : {
                        "name": "Nombre maximum de dépense par groupe : " + (nombre_max_depense_par_groupe_formate == null ? "illimité" : nombre_max_depense_par_groupe_formate)
                    }
                }
            }
        );
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la mise à jour du produit Stripe.",
            erreur: error
        });
    }
    
    let caracteristique_abonnement: Caracteristique_Abonnement | null = null;

    try {
        caracteristique_abonnement = await abonnement_service.modifier_caracteristique_abonnement(pk_caracteristique_abonnement_id_formate, nom, description, nombre_max_groupe_formate, nombre_max_participant_par_groupe_formate, nombre_max_depense_par_groupe_formate, couleur_clair, couleur_sombre);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la mise à jour des caractérisque de l'abonnement.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Les caractéristiques ont bien été mises à jour.",
        data: caracteristique_abonnement
    });
}

export const recuperer_toutes_caracteristiques: RequestHandler = async (req: Request, res: Response) => {
    let caracteristiques_abonnement: Caracteristique_Abonnement[];

    try {
        caracteristiques_abonnement = await abonnement_service.recuperer_toutes_caracteristiques_abonnement();
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de toutes les caractérisque des abonnements.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici toutes les caractéristiques des abonnements.",
        data: caracteristiques_abonnement
    });
}

export const creation_abonnement: RequestHandler = async (req: Request, res: Response) => {
    const {fk_caracteristique_abonnement_id, prix, periodicite, date_debut, date_fin} = req.body;

    if (!fk_caracteristique_abonnement_id || prix == null || !periodicite || !date_debut)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "fk_caracteristique_abonnement_id",
                "prix",
                "periodicite",
                "date_debut",
                "date_fin (facultatif)"
            ]
        });

    if (isNaN(fk_caracteristique_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'fk_caracteristique_abonnement_id'."
        });

    const fk_caracteristique_abonnement_id_formate: number = Number(fk_caracteristique_abonnement_id);

    if (isNaN(prix))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'prix'."
        });

    const prix_formate: number = Number(prix);

    if (prix_formate < 0)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre positif pour l'attribut 'prix'."
        });

    if (!["quotidien", "hebdomadaire", "mensuel", "trimestriel", "annuel"].includes(periodicite))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une valeur correcte pour l'attribut 'periodicite': ['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel']."
        });

    if (!date_valide(date_debut))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une valeur correcte pour l'attribut 'date_debut'."
        });

    if (date_fin != null && !date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une valeur correcte pour l'attribut 'date_fin'."
        });

    let caracteristique_abonnement_existant: Caracteristique_Abonnement | null;

    try {
        caracteristique_abonnement_existant = await abonnement_service.recuperer_caracteristique_abonnement_par_id(fk_caracteristique_abonnement_id_formate);

        if (!caracteristique_abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucune caractéristique d'abonnement n'a été trouvée."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des caractérisques d'un abonnement.",
            erreur: error
        });
    }

    let abonnement_stripe: Stripe.Price;

    const recurrence_abonnement: any = (
        periodicite == "quotidien" ? {"interval": "day", "interval_count": 1} :
        (periodicite == "hebdomadaire" ? {"interval": "week", "interval_count": 1} :
        (periodicite == "mensuel" ? {"interval": "month", "interval_count": 1} :
        (periodicite == "trimestriel" ? {"interval": "month", "interval_count": 3} :
        {"interval": "year", "interval_count": 1}))));

    try {
        abonnement_stripe = await stripe.prices.create({
            currency: "eur",
            product: caracteristique_abonnement_existant.stripe_product_id,
            unit_amount: prix * 100,
            recurring: recurrence_abonnement,
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du price Stripe.",
            erreur: error
        });
    }

    let abonnement: Abonnement;

    try {
        abonnement = await abonnement_service.ajouter_abonnement(fk_caracteristique_abonnement_id_formate, prix_formate, periodicite, new Date(date_debut), (date_fin ? new Date(date_fin) : null), abonnement_stripe.id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'ajout de l'abonnement.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "L'abonnement a bien été créé.",
        data: abonnement
    });
}

export const desactivation_abonnement: RequestHandler = async (req: Request, res: Response) => {
    const {pk_abonnement_id} = req.body;

    if (!pk_abonnement_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["pk_abonnement_id",]
        });

    if (isNaN(pk_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pk_abonnement_id'."
        });

    const pk_abonnement_id_formate: number = Number(pk_abonnement_id);

    let abonnement_existant: Abonnement | null;

    try {
        abonnement_existant = await abonnement_service.recuperer_abonnement_par_id(pk_abonnement_id_formate);

        if (!abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun abonnement n'a été trouvé."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de l'abonnement.",
            erreur: error
        });
    }

    if (abonnement_existant.date_fin != null && abonnement_existant.date_fin < new Date())
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "L'abonnement est déjà désactivé."
        });

    try {
        await stripe.prices.update(
            abonnement_existant.stripe_price_id,
            {
                active: false
            }
        );
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la désactivation du price Stripe.",
            erreur: error
        });
    }

    let abonnement: Abonnement;

    try {
        abonnement = await abonnement_service.modifier_abonnement(abonnement_existant.pk_abonnement_id, abonnement_existant.fk_caracteristique_abonnement_id, abonnement_existant.prix, abonnement_existant.periodicite, abonnement_existant.date_debut, new Date());
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la désactivate de l'abonnement.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "L'abonnement a bien été désactivé.",
        data: abonnement
    });
}

export const activer_abonnement: RequestHandler = async (req: Request, res: Response) => {
    const {pk_abonnement_id, date_fin} = req.body;

    if (!pk_abonnement_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["pk_abonnement_id",]
        });

    if (isNaN(pk_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pk_abonnement_id'."
        });

    const pk_abonnement_id_formate: number = Number(pk_abonnement_id);

    if (date_fin != null && !date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une valeur correcte pour l'attribut 'date_fin'."
        });

    let abonnement_existant: Abonnement | null;

    try {
        abonnement_existant = await abonnement_service.recuperer_abonnement_par_id(pk_abonnement_id_formate);

        if (!abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun abonnement n'a été trouvé."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de l'abonnement.",
            erreur: error
        });
    }

    if (abonnement_existant.date_fin == null || abonnement_existant.date_fin > new Date())
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "L'abonnement est déjà activé."
        });

    try {
        await stripe.prices.update(
            abonnement_existant.stripe_price_id,
            {
                active: true
            }
        );
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'activation du price Stripe.",
            erreur: error
        });
    }

    let abonnement: Abonnement;

    try {
        abonnement = await abonnement_service.modifier_abonnement(abonnement_existant.pk_abonnement_id, abonnement_existant.fk_caracteristique_abonnement_id, abonnement_existant.prix, abonnement_existant.periodicite, abonnement_existant.date_debut, (date_fin ? new Date(date_fin) : null));
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de l'activation de l'abonnement.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "L'abonnement a bien été activé.",
        data: abonnement
    });
}

export const recuperer_tous_abonnements: RequestHandler = async (req: Request, res: Response) => {
    let abonnements: Abonnement[];

    try {
        abonnements = await abonnement_service.recuperer_tous_abonnements();
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de tous les abonnements.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici tous les abonnements.",
        data: abonnements
    });
}

export const recuperer_tous_abonnements_disponibles: RequestHandler = async (req: Request, res: Response) => {
    let abonnements: Abonnement[];

    try {
        abonnements = await abonnement_service.recuperer_tous_abonnements_disponibles();
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de tous les abonnements.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici tous les abonnements disponibles.",
        data: abonnements
    });
}

export const souscription_abonnement: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const {abonnement_id, code_reduction} = req.body;

    if (!abonnement_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["abonnement_id", "code_reduction (facultatif)"]
        });

    if (isNaN(abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'abonnement_id'."
        });

    const abonnement_id_formate: number = Number(abonnement_id);

    let code_reduction_existant: Code_Reduction | null;

    if (code_reduction != null) {
        try {
            code_reduction_existant = await abonnement_service.recuperer_code_reduction_par_code(code_reduction);

            if (!code_reduction_existant)
                return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                    message: "Le code de réduction n'existe pas."
                });
        } catch (error: any) {
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération du code de réduction.",
                erreur: error
            });
        }

        if (!code_reduction_existant.est_utilisable)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Ce code de réduction n'est plus utilisable."
            });

        if (code_reduction_existant.fk_abonnement_id != abonnement_id_formate)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Ce code de réduction ne peut pas être utilisé avec cet abonnement."
            });

        if (code_reduction_existant.date_debut > new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Ce code de réduction ne peut pas encore être utilisé."
            });

        if (code_reduction_existant.date_fin != null && code_reduction_existant.date_fin < new Date())
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Ce code de réduction est périmé."
            });

        let nombre_utilisation_code: number;

        try {
            nombre_utilisation_code = await abonnement_service.recuperer_nombre_utilisation_code_reduction(code_reduction_existant.pk_code_reduction_id);
        } catch (error: any) {
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération du nombre d'utilisation du code de réduction.",
                erreur: error
            });
        }

        if (code_reduction_existant.nombre_maximum_utilisation <= nombre_utilisation_code)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Ce code de réduction a atteint son nombre maximum d'utilisation."
            });
    }

    let abonnement_existant: Abonnement | null;

    try {
        abonnement_existant = await abonnement_service.recuperer_abonnement_par_id(abonnement_id_formate);

        if (!abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Aucun abonnement n'a été trouvé."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de l'abonnement.",
            erreur: error
        });
    }

    let utilisateur_existant: Utilisateur | null;

    try {
        utilisateur_existant = await utilisateur_service.recuperer_utilisateur_par_id(utilisateur_id);

        if (!utilisateur_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Nous n'avons pas pu trouver votre compte utilisateur malgrés votre token JWT."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations de l'utilisateur.",
            erreur: error
        });
    }

    let offre_speciale_existante: Offre_Speciale | undefined;

    try {
        const offres_speciales: Offre_Speciale[] = await abonnement_service.recuperer_toutes_offres_speciales();

        offre_speciale_existante = offres_speciales.find(
            (offre_speciale: Offre_Speciale) => 
                offre_speciale.fk_caracteristique_abonnement_id == abonnement_existant.fk_caracteristique_abonnement_id && 
                offre_speciale.date_debut < new Date() && 
                (offre_speciale.date_fin == null || offre_speciale.date_fin > new Date())
            );
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations des offres spéciales.",
            erreur: error
        });
    }

    if (offre_speciale_existante) {
        try {
            const nombre_utilisation_offre_speciale: number = await abonnement_service.recuperer_nombre_utilisation_offre_speciale(offre_speciale_existante.pk_offre_speciale_id);

            if (nombre_utilisation_offre_speciale >= offre_speciale_existante.nombre_maximum_utilisation)
                offre_speciale_existante = null;
        } catch (error: any) {
            return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
                message: "Une erreur serveur est survenue lors de la récupération des informations des offres spéciales.",
                erreur: error
            });
        }
    }

    const session_stripe = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: abonnement_existant.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: process.env.API_URL! + `/abonnement/OK`,
        cancel_url: process.env.API_URL! + `/abonnement/CANCEL`,
        automatic_tax: { enabled: false },
        customer: utilisateur_existant.stripe_customer_id,
        // discounts: [
        //     { coupon: offre_speciale_existante?.stripe_coupon_id },
        //     { promotion_code: code_reduction_existant?.stripe_promotion_id }
        // ]
      });
    
      return res.redirect(303, session_stripe.url);
}

export const recuperer_toutes_souscriptions_abonnements_utilisateur: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    let souscriptions: Souscription_Abonnement[];

    try {
        souscriptions = await abonnement_service.recuperer_souscriptions_abonnements_par_utilisateur_id(utilisateur_id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de toutes les souscriptions abonnements.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici toutes vos souscriptions.",
        data: souscriptions
    });
}

export const resilier_souscription_abonnement: RequestHandler = async (req: Request, res: Response) => {
    // On récupère cette information depuis le middleware JWT
    const utilisateur_id: number = (<any>req).user;

    const {souscription_abonnement_id} = req.body;

    if (!souscription_abonnement_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: ["souscription_abonnement_id"]
        });

    if (isNaN(souscription_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'souscription_abonnement_id'."
        });

    const souscription_abonnement_id_formate: number = Number(souscription_abonnement_id);

    let souscription_abonnement_existant: Souscription_Abonnement | null; 

    try {
        souscription_abonnement_existant = await abonnement_service.recuperer_souscription_abonnement_par_id(souscription_abonnement_id_formate);

        if (!souscription_abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Aucune souscription n'a été trouvée."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de la souscription abonnement.",
            erreur: error
        });
    }

    if (souscription_abonnement_existant.fk_utilisateur_id != utilisateur_id)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Cette souscription n'est pas la vôtre."
        });

    if (souscription_abonnement_existant.date_fin && souscription_abonnement_existant.date_fin < new Date())
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Votre souscription a déjà été résiliée."
        });

    try {
        await stripe.subscriptions.cancel(souscription_abonnement_existant.stripe_subscription_id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la désactivation du subscription Stripe.",
            erreur: error
        });
    }

    let souscription_abonnement: Souscription_Abonnement;

    try {
        souscription_abonnement = await abonnement_service.modifier_souscription_abonnement({
            ...souscription_abonnement_existant,
            date_fin: new Date()
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la mise à jour de la souscription dans la base de données.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.accepte).json({
        message: "Votre souscription a bien été résiliée.",
        data: souscription_abonnement
    });
}

export const creation_code_reduction: RequestHandler = async (req: Request, res: Response) => {
    const {code, fk_abonnement_id, description, reduction, duree_reduction, nombre_maximum_utilisation, date_debut, date_fin} = req.body;

    if (!fk_abonnement_id || !description || !reduction)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "code (facultatif)",
                "fk_abonnement_id",
                "description",
                "reduction",
                "duree_reduction (facultatif)",
                "nombre_maximum_utilisation (facultatif)",
                "date_debut (facultatif)"
            ]
        });

    const code_formate: string = code == null ? crypto.randomBytes(20).toString('hex').toUpperCase() : code;

    if (isNaN(fk_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'fk_abonnement_id'."
        });

    const fk_abonnement_id_formate: number = Number(fk_abonnement_id);

    try {
        const abonnement: Abonnement | null = await abonnement_service.recuperer_abonnement_par_id(fk_abonnement_id_formate);

        if (!abonnement)
            return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
                message: "Aucun abonnement n'a été trouvé."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la recherche de l'abonnement.",
            erreur: error
        });
    }

    if (isNaN(reduction))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'reduction'."
        });

    const reduction_formate: number = Number(reduction);

    if (reduction_formate <= 0 || 100 < reduction_formate)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre compris entre 1 et 100 pour l'attribut 'reduction'."
        });

    if (duree_reduction != null && isNaN(duree_reduction))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'duree_reduction'."
        });

    const duree_reduction_formate: number = duree_reduction == null ? 1 : Number(duree_reduction);

    if (nombre_maximum_utilisation != null && isNaN(nombre_maximum_utilisation))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_maximum_utilisation'."
        });

    const nombre_maximum_utilisation_formate: number = nombre_maximum_utilisation == null ? 1 : Number(nombre_maximum_utilisation);

    if (date_debut != null && date_valide(date_debut))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour 'date_debut'."
        });

    const date_debut_formate: Date = date_debut == null ? new Date() : new Date(date_debut);
    
    if (date_fin != null && date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour 'date_fin'."
        });

    const date_fin_formate: Date = date_fin == null ? null : new Date(date_fin);

    let coupon_stripe: Stripe.Coupon;

    try {
        coupon_stripe = await stripe.coupons.create({
            percent_off: reduction_formate,
            duration: 'repeating',
            duration_in_months: duree_reduction_formate,
            currency: "eur"
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du coupon Stripe.",
            erreur: error
        });
    }

    let promotion_stripe: Stripe.PromotionCode;

    try {
        promotion_stripe = await stripe.promotionCodes.create({
            coupon: coupon_stripe.id,
            code: code,
            max_redemptions: nombre_maximum_utilisation_formate
          });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du coupon 2 Stripe.",
            erreur: error
        });
    }

    let code_reduction: Code_Reduction;

    try {
        code_reduction = await abonnement_service.ajouter_code_reduction(code_formate, fk_abonnement_id_formate, description, reduction_formate, duree_reduction_formate, true, nombre_maximum_utilisation_formate, date_debut_formate, date_fin_formate, coupon_stripe.id, promotion_stripe.id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du code de réduction.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "Le code de réduction a bien été créé.",
        data: code_reduction
    });
}

export const modifier_code_reduction: RequestHandler = async (req: Request, res: Response) => {
    const {pk_code_reduction_id, date_fin} = req.body;

    if (!pk_code_reduction_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "pk_code_reduction_id",
                "date_fin (facultatif)"
            ]
        });

    if (isNaN(pk_code_reduction_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pk_code_reduction_id'."
        });

    const pk_code_reduction_id_formate: number = Number(pk_code_reduction_id);

    if (date_fin != null && !date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour 'date_fin'."
        });

    let code_reduction_existant: Code_Reduction | null;

    try {
        code_reduction_existant = await abonnement_service.recuperer_code_reduction_par_id(pk_code_reduction_id_formate);

        if (!code_reduction_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Aucun code de réduction n'a été trouvé.."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la recherche du code de réduction.",
            erreur: error
        });
    }

    let code_reduction: Code_Reduction;

    try {
        code_reduction = await abonnement_service.modifier_code_reduction({
            ...code_reduction_existant,
            date_fin: (date_fin == null ? null : new Date(date_fin))
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification du code de réduction.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Le code de réduction a bien été modifié.",
        data: code_reduction
    });
}

export const recuperer_tous_codes_reductions: RequestHandler = async (req: Request, res: Response) => {
    let codes_reductions: Code_Reduction[];

    try {
        codes_reductions = await abonnement_service.recuperer_tous_codes_reductions();
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de tous les codes de réductions.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici tous les codes de réductions.",
        data: codes_reductions
    });
}

export const creation_offre_speciale: RequestHandler = async (req: Request, res: Response) => {
    const {fk_caracteristique_abonnement_id, description_offre_speciale, pourcentage_annonce, prix_reduit, duree_reduction, nombre_maximum_utilisation, date_debut, date_fin} = req.body;

    if (!fk_caracteristique_abonnement_id || !description_offre_speciale || !pourcentage_annonce || !prix_reduit || !duree_reduction)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "fk_caracteristique_abonnement_id",
                "description_offre_speciale",
                "pourcentage_annonce",
                "prix_reduit",
                "duree_reduction",
                "nombre_maximum_utilisation (facultatif)",
                "date_debut (facultatif)",
                "date_fin (facultatif)"
            ]
        });

    if (isNaN(fk_caracteristique_abonnement_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'fk_caracteristique_abonnement_id'."
        });

    const fk_caracteristique_abonnement_id_formate: number = Number(fk_caracteristique_abonnement_id);

    if (isNaN(pourcentage_annonce))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pourcentage_annonce'."
        });

    const pourcentage_annonce_formate: number = Number(pourcentage_annonce);

    if (pourcentage_annonce < 0 || 100 < pourcentage_annonce)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre compris entre 0 et 100 pour l'attribut 'pourcentage_annonce'."
        });

    if (isNaN(prix_reduit))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'prix_reduit'."
        });

    const prix_reduit_formate: number = Number(prix_reduit);

    if (prix_reduit_formate < 0)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre positif pour l'attribut 'prix_reduit_formate'."
        });
    
    if (isNaN(duree_reduction))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'duree_reduction'."
        });

    const duree_reduction_formate: number = Number(duree_reduction);

    if (duree_reduction_formate <= 0)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre positif pour l'attribut 'duree_reduction_formate'."
        });

    if (nombre_maximum_utilisation != null && isNaN(nombre_maximum_utilisation))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'nombre_maximum_utilisation'."
        });

    const nombre_maximum_utilisation_formate: number | null = nombre_maximum_utilisation == null ? null : Number(duree_reduction);

    if (nombre_maximum_utilisation_formate != null && nombre_maximum_utilisation_formate <= 0)
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre positif pour l'attribut 'nombre_maximum_utilisation_formate'."
        });

    if (date_debut != null && !date_valide(date_debut))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour l'attribut 'date_debut'."
        });

    const date_debut_formate: Date = date_debut == null ? new Date() : new Date(date_debut);

    if (date_fin != null && !date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour l'attribut 'date_fin'."
        });

    const date_fin_formate: Date = date_fin == null ? new Date() : new Date(date_fin);

    let caracteristique_abonnement_existant: Caracteristique_Abonnement | null;

    try {
        caracteristique_abonnement_existant = await abonnement_service.recuperer_caracteristique_abonnement_par_id(fk_caracteristique_abonnement_id_formate);

        if (!caracteristique_abonnement_existant)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Aucune caractéristique d'abonnement n'a été trouvée."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération des informations de les caractéristiques de l'abonnement.",
            erreur: error
        });
    }

    let stripe_coupon: Stripe.Coupon;

    try {
        stripe_coupon = await stripe.coupons.create({
            amount_off: prix_reduit_formate,
            duration: 'repeating',
            duration_in_months: duree_reduction_formate,
            currency: "eur",
            applies_to: [caracteristique_abonnement_existant.stripe_product_id]
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création du coupon Stripe.",
            erreur: error
        });
    }

    let offre_speciale: Offre_Speciale;

    try {
        offre_speciale = await abonnement_service.ajouter_offre_speciale(fk_caracteristique_abonnement_id_formate, description_offre_speciale, pourcentage_annonce_formate, prix_reduit_formate, duree_reduction_formate, nombre_maximum_utilisation_formate, date_debut_formate, date_fin_formate, stripe_coupon.id);
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la création de l'offre spéciale.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.cree).json({
        message: "L'offre spéciale a bien été créée.",
        data: offre_speciale
    });
}

export const modifier_offre_speciale: RequestHandler = async (req: Request, res: Response) => {
    const {pk_offre_speciale_id, date_fin} = req.body;

    if (!pk_offre_speciale_id)
        return res.status(http_response_util.statuts.erreur_client.parametres_manquant).json({
            message: "Un ou plusieurs paramètres ne sont pas présent dans la requête.",
            parametres: [
                "pk_offre_speciale_id",
                "date_fin (facultatif)"
            ]
        });

    if (isNaN(pk_offre_speciale_id))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier un nombre pour l'attribut 'pk_offre_speciale_id'."
        });

    const pk_offre_speciale_id_formate: number = Number(pk_offre_speciale_id);

    if (date_fin != null && !date_valide(date_fin))
        return res.status(http_response_util.statuts.erreur_client.mauvaise_requete).json({
            message: "Veuillez spécifier une date valide pour 'date_fin'."
        });

    let offre_speciale_existante: Offre_Speciale | null;

    try {
        offre_speciale_existante = await abonnement_service.recuperer_offre_speciale_par_id(pk_offre_speciale_id_formate);

        if (!offre_speciale_existante)
            return res.status(http_response_util.statuts.erreur_client.pas_trouve).json({
                message: "Aucune offre spéciale n'a été trouvée."
            });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la recherche de l'offre spéciale.",
            erreur: error
        });
    }

    let offre_speciale: Offre_Speciale;

    try {
        offre_speciale = await abonnement_service.modifier_offre_speciale({
            ...offre_speciale_existante,
            date_fin: (date_fin == null ? null : new Date(date_fin))
        });
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la modification de l'offre spéciale.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "L'offre spéciale a bien été modifiée.",
        data: offre_speciale
    });
}

export const recuperer_toutes_offres_speciales: RequestHandler = async (req: Request, res: Response) => {
    let offres_speciales: Offre_Speciale[];

    try {
        offres_speciales = await abonnement_service.recuperer_toutes_offres_speciales();
    } catch (error: any) {
        return res.status(http_response_util.statuts.erreur_serveur.erreur_interne).json({
            message: "Une erreur serveur est survenue lors de la récupération de toutes les offres spéciales.",
            erreur: error
        });
    }

    return res.status(http_response_util.statuts.succes.ok).json({
        message: "Voici toutes les offres spéciales.",
        data: offres_speciales
    });
}

