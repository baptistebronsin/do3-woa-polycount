import { PrismaClient, Token, Utilisateur } from '@prisma/client'

const prisma: PrismaClient = new PrismaClient()

export const recuperer_utilisateur_par_email = async (email: string): Promise<Utilisateur | null> => {
    const result = await prisma.utilisateur.findUnique({
        where: {
            email: email
        }
    });

    return result;
}

export const ajouter_utilisateur = async (nom: string, prenom: string, genre: string | null, email: string, mot_de_passe: string): Promise<Utilisateur | null> => {
    try {
        const result: Utilisateur = await prisma.utilisateur.create({
            data: {
                nom: nom,
                prenom: prenom,
                genre: genre,
                email: email,
                mot_de_passe: mot_de_passe
            }
        });

        return result;
    } catch (error) {
        return null;
    }
}

export const ajouter_token = async (utilisateur_id: number, token: string, type_verification: string, nombre_heure_actif: number): Promise<boolean> => {
    const date_creation: Date = new Date();
    const date_desactivation: Date = new Date(date_creation);
    date_desactivation.setHours(date_creation.getHours() + nombre_heure_actif);

    try {
        await prisma.token.create({
            data: {
                fk_utilisateur_id: utilisateur_id,
                token: token,
                type_verification: type_verification,
                date_creation: date_creation,
                date_desactivation: date_desactivation
            }
        });

        return true;
    } catch (error: any) {
        return false;
    }
}