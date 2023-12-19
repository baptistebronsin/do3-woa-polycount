export interface ISuspension {
    pk_suspension_id: number,
    message_utilisateur: string | null,
    date_debut: Date,
    date_fin: Date | null
};