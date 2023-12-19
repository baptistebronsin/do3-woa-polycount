export class Groupe {
    pk_groupe_id: number;
    nom: string | null;
    description: string | null;
    fk_utilisateur_createur_id: number;
    cree_le: Date;
    cloture_le: Date | null;
    lien_image: string | null;

    public constructor (pk_groupe_id: number, nom: string | null, description: string | null, fk_utilisateur_createur_id: number, cree_le: Date, cloture_le: Date | null, lien_image: string | null) {
        this.pk_groupe_id = pk_groupe_id;
        this.nom = nom;
        this.description = description;
        this.fk_utilisateur_createur_id = fk_utilisateur_createur_id;
        this.cree_le = cree_le;
        this.cloture_le = cloture_le;
        this.lien_image = lien_image;
    }

    public static from_JSON (json: any): Groupe {
        return new Groupe(
            json['pk_groupe_id'],
            json['nom'],
            json['description'],
            json['fk_utilisateur_createur_id'],
            new Date(json['cree_le']),
            json['cloture_le'] ? new Date(json['cloture_le']) : null,
            json['lien_image']
        );
    }
}