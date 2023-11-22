export interface ISuspension {
    pk_suspension_id: number;
    fk_utilisateur_id: number;
    date_ajout: Date;
    date_debut: string;
    date_fin: string | null;
}