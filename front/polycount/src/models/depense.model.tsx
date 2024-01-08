export class Depense {
    pk_depense_id: number;
    fk_groupe_id: number;
    fk_participant_createur_id: number;
    titre: string | null;
    montant: number;
    ajoute_le: Date;
    lien_image: string | null;

    constructor(pk_depense_id: number, fk_groupe_id: number, fk_participant_createur_id: number, titre: string | null, montant: number, ajoute_le: Date, lien_image: string | null) {
        this.pk_depense_id = pk_depense_id;
        this.fk_groupe_id = fk_groupe_id;
        this.fk_participant_createur_id = fk_participant_createur_id;
        this.titre = titre;
        this.montant = montant;
        this.ajoute_le = ajoute_le;
        this.lien_image = lien_image;
    }

    public static from_JSON(json: any): Depense {
        return new Depense(
            json['pk_depense_id'],
            json['fk_groupe_id'],
            json['fk_participant_createur_id'],
            json['titre'],
            json['montant'],
            new Date(json['ajoute_le']),
            json['lien_image']
        );
    }
}