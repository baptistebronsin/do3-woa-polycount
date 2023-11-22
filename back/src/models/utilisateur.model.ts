export interface IUtilisateur {
    pk_utilisateur_id: number;
    nom: string;
    prenom: string;
    genre: string;
    email: string;
    mot_de_passe: string;
    cree_le: Date;
    valide_le: Date | null;
    token: string;
}