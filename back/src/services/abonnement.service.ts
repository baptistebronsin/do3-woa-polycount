import { Abonnement, Caracteristique_Abonnement, Code_Reduction, Offre_Speciale, Souscription_Abonnement } from "@prisma/client";
import prisma from "./prisma.service";

export const ajouter_caracteristique_abonnement = async (nom: string, description: string | null, nombre_max_groupe: number | null, nombre_max_participant_par_groupe: number | null, nombre_max_depense_par_groupe: number | null, couleur_clair: string | null, couleur_sombre: string | null, stripe_product_id: string): Promise<Caracteristique_Abonnement> => {
    const result: Caracteristique_Abonnement = await prisma.caracteristique_Abonnement.create({
        data: {
            nom: nom,
            description: description,
            nombre_max_groupe: nombre_max_groupe,
            nombre_max_participant_par_groupe: nombre_max_participant_par_groupe,
            nombre_max_depense_par_groupe: nombre_max_depense_par_groupe,
            couleur_clair: couleur_clair,
            couleur_sombre: couleur_sombre,
            stripe_product_id: stripe_product_id
        }
    });

    return result;
}

export const modifier_caracteristique_abonnement = async (pk_caracteristique_abonnement_id: number, nom: string, description: string | null, nombre_max_groupe: number | null, nombre_max_participant_par_groupe: number | null, nombre_max_depense_par_groupe: number | null, couleur_clair: string | null, couleur_sombre: string | null): Promise<Caracteristique_Abonnement> => {
    const result: Caracteristique_Abonnement = await prisma.caracteristique_Abonnement.update({
        data: {
            nom: nom,
            description: description,
            nombre_max_groupe: nombre_max_groupe,
            nombre_max_participant_par_groupe: nombre_max_participant_par_groupe,
            nombre_max_depense_par_groupe: nombre_max_depense_par_groupe,
            couleur_clair: couleur_clair,
            couleur_sombre: couleur_sombre
        },
        where: {
            pk_caracteristique_abonnement_id: pk_caracteristique_abonnement_id
        }
    });

    return result;
}

export const recuperer_caracteristique_abonnement_par_id = async (pk_caracteristique_abonnement_id: number): Promise<Caracteristique_Abonnement | null> => {
    const result: Caracteristique_Abonnement | null = await prisma.caracteristique_Abonnement.findUnique({
        where: {
            pk_caracteristique_abonnement_id: pk_caracteristique_abonnement_id
        }
    });

    return result;
}

export const recuperer_toutes_caracteristiques_abonnement = async (): Promise<Caracteristique_Abonnement[]> => {
    const result: Caracteristique_Abonnement[] = await prisma.caracteristique_Abonnement.findMany({});

    return result;
}

export const ajouter_abonnement = async (fk_caracteristique_abonnement_id: number, prix: number, periodicite: string, date_debut: Date, date_fin: Date | null, stripe_price_id: string): Promise<Abonnement> => {
    const result: Abonnement = await prisma.abonnement.create({
        data: {
            fk_caracteristique_abonnement_id: fk_caracteristique_abonnement_id,
            prix: prix,
            periodicite: periodicite,
            date_debut: date_debut,
            date_fin: date_fin,
            stripe_price_id: stripe_price_id
        }
    });

    return result;
}

export const modifier_abonnement = async (pk_abonnement_id: number, fk_caracteristique_abonnement_id: number, prix: number, periodicite: string, date_debut: Date, date_fin: Date | null): Promise<Abonnement> => {
    const result: Abonnement = await prisma.abonnement.update({
        data: {
            fk_caracteristique_abonnement_id: fk_caracteristique_abonnement_id,
            prix: prix,
            periodicite: periodicite,
            date_debut: date_debut,
            date_fin: date_fin
        },
        where: {
            pk_abonnement_id: pk_abonnement_id
        }
    });

    return result;
}

export const recuperer_abonnement_par_id = async (pk_abonnement_id: number): Promise<Abonnement | null> => {
    const result: Abonnement | null = await prisma.abonnement.findUnique({
        where: {
            pk_abonnement_id: pk_abonnement_id
        }
    });

    return result;
}

export const recuperer_tous_abonnements = async (): Promise<Abonnement[]> => {
    const result: Abonnement[] = await prisma.abonnement.findMany({});

    return result;
}

export const recuperer_tous_abonnements_disponibles = async (): Promise<Abonnement[]> => {
    const result: Abonnement[] = await prisma.abonnement.findMany({
        where: {
          date_debut: {
            lt: new Date(), // Vérifie que la date de début est inférieure à la date actuelle
          },
          OR: [
            {
              date_fin: null, // Inclut les abonnements dont la date de fin est nulle
            },
            {
              date_fin: {
                gt: new Date(), // Vérifie que la date de fin est supérieure à la date actuelle
              },
            },
          ],
        },
      });

    return result;
}

export const ajouter_code_reduction = async (code: string, fk_abonnement_id: number, description: string, reduction: number, duree_reduction: number, est_utilisable: boolean, nombre_maximum_utilisation: number, date_debut: Date, date_fin: Date, stripe_coupon_id: string, stripe_promotion_id: string): Promise<Code_Reduction> => {
    const result: Code_Reduction = await prisma.code_Reduction.create({
        data: {
            code: code,
            fk_abonnement_id: fk_abonnement_id,
            description: description,
            reduction: reduction,
            duree_reduction: duree_reduction,
            est_utilisable: est_utilisable,
            nombre_maximum_utilisation: nombre_maximum_utilisation,
            date_debut: date_debut,
            date_fin: date_fin,
            stripe_coupon_id: stripe_coupon_id,
            stripe_promotion_id: stripe_promotion_id
        }
    });

    return result;
}

export const modifier_code_reduction = async (code_reduction: Code_Reduction): Promise<Code_Reduction> => {
    const result: Code_Reduction = await prisma.code_Reduction.update({
        data: code_reduction,
        where: {
            pk_code_reduction_id: code_reduction.pk_code_reduction_id
        }
    });

    return result;
}

export const recuperer_code_reduction_par_id = async (pk_code_reduction_id: number): Promise<Code_Reduction | null> => {
    const result: Code_Reduction | null = await prisma.code_Reduction.findUnique({
        where: {
            pk_code_reduction_id: pk_code_reduction_id
        }
    });

    return result;
}

export const recuperer_code_reduction_par_code = async (code: string): Promise<Code_Reduction | null> => {
    const result: Code_Reduction | null = await prisma.code_Reduction.findUnique({
        where: {
            code: code
        }
    });

    return result;
}

export const recuperer_tous_codes_reductions = async (): Promise<Code_Reduction[]> => {
    const result: Code_Reduction[] = await prisma.code_Reduction.findMany({});

    return result;
}

export const recuperer_nombre_utilisation_code_reduction = async (code_reduction_id: number): Promise<number> => {
    const result: number = await prisma.souscription_Abonnement.count({
        where: {
            fk_code_reduction_id: code_reduction_id
        }
    });

    return result;
}

export const ajouter_offre_speciale = async (fk_caracteristique_abonnement_id: number, description_offre_speciale: string, pourcentage_annonce: number, prix_reduit: number, duree_reduction: number, nombre_maximum_utilisation: number | null, date_debut: Date, date_fin: Date, stripe_coupon_id: string): Promise<Offre_Speciale> => {
    const result: Offre_Speciale = await prisma.offre_Speciale.create({
        data: {
            fk_caracteristique_abonnement_id: fk_caracteristique_abonnement_id,
            description_offre_speciale: description_offre_speciale,
            pourcentage_annonce: pourcentage_annonce,
            prix_reduit: prix_reduit,
            duree_reduction: duree_reduction,
            nombre_maximum_utilisation: nombre_maximum_utilisation,
            date_debut: date_debut,
            date_fin: date_fin,
            stripe_coupon_id: stripe_coupon_id
        }
    });

    return result;
}

export const modifier_offre_speciale = async (offre_speciale: Offre_Speciale): Promise<Offre_Speciale> => {
    const result: Offre_Speciale = await prisma.offre_Speciale.update({
        data: offre_speciale,
        where: {
            pk_offre_speciale_id: offre_speciale.pk_offre_speciale_id
        }
    });

    return result;
}

export const recuperer_offre_speciale_par_id = async (pk_offre_speciale_id: number): Promise<Offre_Speciale | null> => {
    const result: Offre_Speciale | null = await prisma.offre_Speciale.findUnique({
        where: {
            pk_offre_speciale_id: pk_offre_speciale_id
        }
    });

    return result;
}

export const recuperer_toutes_offres_speciales = async (): Promise<Offre_Speciale[]> => {
    const result: Offre_Speciale[] = await prisma.offre_Speciale.findMany({});

    return result;
}

export const recuperer_nombre_utilisation_offre_speciale = async (offre_speciale_id: number): Promise<number> => {
    const result: number = await prisma.souscription_Abonnement.count({
        where: {
            fk_offre_speciale_id: offre_speciale_id
        }
    });

    return result;
}

export const ajouter_souscription_abonnement = async (utilisateur_id: number, abonnement_id: number, code_reduction_id: number | null, offre_speciale_id: number | null, date_debut: Date, stripe_subscription_id: string): Promise<Souscription_Abonnement> => {
    const result: Souscription_Abonnement = await prisma.souscription_Abonnement.create({
        data: {
            fk_utilisateur_id: utilisateur_id,
            fk_abonnement_id: abonnement_id,
            fk_code_reduction_id: code_reduction_id,
            fk_offre_speciale_id: offre_speciale_id,
            date_souscription_abonnement: new Date(),
            date_debut: date_debut,
            stripe_subscription_id: stripe_subscription_id
        }
    });

    return result;
}

export const modifier_souscription_abonnement = async (souscription: Souscription_Abonnement): Promise<Souscription_Abonnement> => {
    const result: Souscription_Abonnement = await prisma.souscription_Abonnement.update({
        data: souscription,
        where: {
            pk_souscription_abonnement_id: souscription.pk_souscription_abonnement_id
        }
    });

    return result;
}

export const recuperer_souscription_abonnement_par_id = async (souscription_id: number): Promise<Souscription_Abonnement | null> => {
    const result: Souscription_Abonnement | null = await prisma.souscription_Abonnement.findUnique({
        where: {
            pk_souscription_abonnement_id: souscription_id
        }
    });

    return result;
} 

export const recuperer_souscriptions_abonnements_par_utilisateur_id = async (utilisateur_id: number): Promise<Souscription_Abonnement[]> => {
    const result: Souscription_Abonnement[] = await prisma.souscription_Abonnement.findMany({
        where: {
            fk_utilisateur_id: utilisateur_id
        }
    });

    return result;
}