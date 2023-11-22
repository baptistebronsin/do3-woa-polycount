export interface IGroupe {
    pk_groupe_id: number;
    nom: string | null;
    description: string | null;
    fk_utilisateur_createur_id: number;
    cree_le: Date;
    cloture_le: Date | null;
    lien_image: string | null;
}