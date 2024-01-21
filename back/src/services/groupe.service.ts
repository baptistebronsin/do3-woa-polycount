import { Groupe, Participant_Groupe } from "@prisma/client";
import prisma from "./prisma.service";

export const recuperer_tous_groupes = async (utilisateur_id: number): Promise<Groupe[]> => {
    const groupes_rejoint: Groupe[] = await prisma.groupe.findMany({
        where: {
            participants: {
              some: {
                fk_utilisateur_id: utilisateur_id,
                rejoint_le: {
                  not: null
                }
              }
            }
          },
          include: {
            participants: true
          }
    });

    return groupes_rejoint;
}

export const recuperer_groupe = async (groupe_id: number): Promise<Groupe | null> => {
    const result: Groupe | null = await prisma.groupe.findUnique({
        where: {
            pk_groupe_id: groupe_id
        }
    });

    return result;
}

export const creer_groupe = async (nom: string, description: string | null, utilisateur_id: number, lien_image: string | null): Promise<Groupe> => {
    const result: Groupe = await prisma.groupe.create({
        data: {
            nom: nom,
            description: description,
            fk_utilisateur_createur_id: utilisateur_id,
            cree_le: new Date(),
            lien_image: lien_image
        }
    });

    return result;
}

export const modifier_groupe = async (groupe_id: number, nom: string, description: string | null, lien_image: string | null): Promise<Groupe> => {
    const result: Groupe = await prisma.groupe.update({
        data: {
            nom: nom,
            description: description,
            lien_image: lien_image
        },
        where: {
            pk_groupe_id: groupe_id
        }
    });

    return result;
}

export const cloturer_groupe = async (groupe_id: number): Promise<Groupe> => {
    const result: Groupe = await prisma.groupe.update({
        data: {
            cloture_le: new Date()
        },
        where: {
            pk_groupe_id: groupe_id
        }
    });

    return result;
}

export const ajouter_participant = async (groupe_id: number, utilisateur_id: number | null, nom: string | null, date_rejoint: Date | null): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.create({
        data: {
            fk_utilisateur_id: utilisateur_id,
            fk_groupe_id: groupe_id,
            nom: nom,
            peut_creer_depense: true,
            peut_manipuler_tag: true,
            peut_modifier_depense: true,
            peut_modifier_montant_max_depense: true,
            peut_supprimer_depense: true,
            montant_max_depense: null,
            rejoint_le: date_rejoint
        }
    });

    return result;
}

export const modifier_participant = async (participant_id: number, nom: string | null, peut_creer_depense: boolean, peut_modifier_depense: boolean, peut_supprimer_depense: boolean, peut_manipuler_tag: boolean, peut_modifier_montant_max_depense: boolean, montant_max_depense: number | null): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.update({
        data: {
            nom: nom,
            peut_creer_depense: peut_creer_depense, 
            peut_modifier_depense: peut_modifier_depense,
            peut_supprimer_depense: peut_supprimer_depense,
            peut_manipuler_tag: peut_manipuler_tag,
            peut_modifier_montant_max_depense: peut_modifier_montant_max_depense,
            montant_max_depense: montant_max_depense
        },
        where: {
            pk_participant_groupe_id: participant_id
        }
    });

    return result;
}

export const quitter_participant = async (participant_id: number): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.update({
        data: {
            quitte_le: new Date()
        },
        where: {
            pk_participant_groupe_id: participant_id
        }
    });

    return result;
}

export const associer_utilisateur_a_participant = async (participant_id: number, utilisateur_id: number): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.update({
        data: {
            fk_utilisateur_id: utilisateur_id
        },
        where: {
            pk_participant_groupe_id: participant_id
        }
    });

    return result;
}

export const recuperer_participants = async (groupe_id: number): Promise<Participant_Groupe[]> => {
    const result: Participant_Groupe[] = await prisma.participant_Groupe.findMany({
        where: {
            fk_groupe_id: groupe_id
        }
    });

    return result;
}

export const recuperer_participant = async (participant_id: number): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.findUnique({
        where: {
            pk_participant_groupe_id: participant_id
        }
    });

    return result;
}

export const rejoindre_groupe = async (participant_id: number): Promise<Participant_Groupe> => {
    const result: Participant_Groupe = await prisma.participant_Groupe.update({
        where: {
            pk_participant_groupe_id: participant_id
        },
        data: {
            rejoint_le: new Date()
        }
    });

    return result;
}