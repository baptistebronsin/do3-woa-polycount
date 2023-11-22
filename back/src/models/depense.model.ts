export interface IDepense {
    pk_depense_id: number;
    fk_groupe_id: number;
    fk_utilisateur_createur_id: number;
    titre: string | null;
    montant: number;
    ajoute_le: Date;
    lien_image: string | null;
}