import { Groupe, Participant_Groupe, PrismaClient, Utilisateur } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const recuperer_tous_groupes = async (utilisateur_id: number): Promise<Groupe[]> => {
    const groupes_rejoint: Groupe[] = await prisma.groupe.findMany({
        where: {
            participants: {
              some: {
                fk_utilisateur_id: utilisateur_id
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

export const ajouter_participant = async (groupe_id: number, utilisateur_id: number | null, nom: string | null): Promise<Participant_Groupe> => {
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
            rejoint_le: utilisateur_id ? new Date() : null
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