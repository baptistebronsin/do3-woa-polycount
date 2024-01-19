import { Suspension, Token, Utilisateur } from '@prisma/client'
import prisma from "./prisma.service";

export const ajouter_utilisateur = async (nom: string, prenom: string, genre: string | null, email: string, mot_de_passe: string, stripe_id: string): Promise<Utilisateur> => {
    const result: Utilisateur = await prisma.utilisateur.create({
        data: {
            nom: nom,
            prenom: prenom,
            genre: genre,
            email: email,
            mot_de_passe: mot_de_passe,
            stripe_customer_id: stripe_id
        }
    });

    return result;
}

export const recuperer_utilisateur_par_id = async (utilisateur_id: number): Promise<Utilisateur | null> => {
    const result: Utilisateur | null = await prisma.utilisateur.findUnique({
        where: {
            pk_utilisateur_id: utilisateur_id
        }
    });

    return result;
}

export const recuperer_utilisateur_par_email = async (email: string): Promise<Utilisateur | null> => {
    const result: Utilisateur | null = await prisma.utilisateur.findUnique({
        where: {
            email: email
        }
    });

    return result;
}

export const modifier_utilisateur = async (utilisateur: Utilisateur): Promise<Utilisateur> => {
    const result: Utilisateur = await prisma.utilisateur.update({
        data: utilisateur,
        where: {
            pk_utilisateur_id: utilisateur.pk_utilisateur_id
        }
    });

    return result;
}

export const ajouter_token = async (utilisateur_id: number, token: string, type_verification: string, nombre_heure_actif: number): Promise<Token> => {
    const date_creation: Date = new Date();
    const date_desactivation: Date = new Date(date_creation);
    date_desactivation.setHours(date_creation.getHours() + nombre_heure_actif);

    const result: Token = await prisma.token.create({
        data: {
            fk_utilisateur_id: utilisateur_id,
            token: token,
            type_verification: type_verification,
            date_creation: date_creation,
            date_desactivation: date_desactivation
        }
    });

    return result;
}

export const recuperer_token = async (utilisateur_id: number, token: string, type_verification: string): Promise<Token | null> => {
    const result: Token | null = await prisma.token.findFirst({
        where: {
            fk_utilisateur_id: utilisateur_id,
            token: token,
            type_verification: type_verification
        },
        orderBy: {
            date_creation: 'desc'
        }
    });

    return result;
}

export const recuperer_tous_tokens = async (utilisateur_id: number): Promise<Token[]> => {
    const result: Token[] = await prisma.token.findMany({
        where: {
            fk_utilisateur_id: utilisateur_id
        }
    });

    return result;
}

export const modifier_token = async (token: Token): Promise<Token> => {
    const result: Token = await prisma.token.update({
        data: token,
        where: {
            pk_token_id: token.pk_token_id
        }
    });

    return result;
}

export const ajouter_suspension = async (utilisateur_id: number, message_utilisateur: string | null, message_administrateur: string | null, date_debut: Date, date_fin: Date | null): Promise<Suspension> => {
    const result: Suspension = await prisma.suspension.create({
        data: {
            fk_utilisateur_id: utilisateur_id,
            message_utilisateur: message_utilisateur,
            message_admin: message_administrateur,
            date_debut: date_debut,
            date_fin: date_fin
        }
    });

    return result;
}

export const recuperer_suspension = async (utilisateur_id: number, date: Date): Promise<Suspension | null> => {
    const result: Suspension | null = await prisma.suspension.findFirst({
        where: {
            date_debut: {
                lte: date
            },
            AND: [
                {
                    OR: [
                        {
                            date_fin: null
                        },
                        {
                            date_fin: {
                                gte: date
                            }
                        }
                    ]
                }
            ],
            fk_utilisateur_id: utilisateur_id
        },
        orderBy: {
            date_ajout: 'desc'
        }
    });

    return result;
}

export const modifier_suspension = async (suspension: Suspension): Promise<Suspension> => {
    const result: Suspension = await prisma.suspension.update({
        data: suspension,
        where: {
            pk_suspension_id: suspension.pk_suspension_id
        }
    });

    return result;
}