import { Depense, Participant_Groupe, PrismaClient, Tag, Utilisateur, Participant_Groupe_Liee_Depense } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const recuperer_toutes_depenses = async (groupe_id: number): Promise<Depense[]> => {
    const result: Depense[] = await prisma.depense.findMany({
        where: {
            fk_groupe_id: groupe_id
        }
    });

    return result;
}

export const creer_depense = async (groupe_id: number, participant_createur: number, titre: string, montant: number): Promise<Depense> => {
    const result: Depense = await prisma.depense.create({
        data: {
            fk_groupe_id: groupe_id,
            fk_participant_createur_id: participant_createur,
            titre: titre,
            montant: montant
        }
    });

    return result;
}

export const recuperer_tous_tags = async (): Promise<Tag[]> => {
    const result: Tag[] = await prisma.tag.findMany();

    return result;
}

export const recuperer_tous_utilisateur = async (groupe_id: number): Promise<Utilisateur[]> => {
    const result: Utilisateur[] = await prisma.utilisateur.findMany({
        where: {
            pk_utilisateur_id: {
                in: (await prisma.participant_Groupe.findMany({
                    where: {
                        fk_groupe_id: groupe_id,
                        fk_utilisateur_id: {
                            not: null
                        }
                    }
                })).map((participant: Participant_Groupe) => participant.fk_utilisateur_id)
            }
        }
    });

    return result;
}

export const recuperer_toutes_affiliations_depenses = async (groupe_id: number): Promise<Participant_Groupe_Liee_Depense[]> => {
    const result: Participant_Groupe_Liee_Depense[] = await prisma.participant_Groupe_Liee_Depense.findMany({
        where: {
            depense: {
                fk_groupe_id: groupe_id
            }
        },
        include: {
            depense: true
        }
    });

    return result;
}

export const lier_depense_participants = async (depense_id: number, participant_id: number, montant: number | null): Promise<Participant_Groupe_Liee_Depense> => {
    const result: Participant_Groupe_Liee_Depense = await prisma.participant_Groupe_Liee_Depense.create({
        data: {
            fk_depense_id: depense_id,
            fk_participant_groupe_id: participant_id,
            montant: montant
        }
    });

    return result;
}