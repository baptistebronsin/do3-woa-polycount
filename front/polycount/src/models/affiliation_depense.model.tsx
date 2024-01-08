export class AffiliationDepense {
    fk_participant_groupe_id: number;
    fk_depense_id: number;
    montant: number | null;

    constructor(fk_participant_groupe_id: number, fk_depense_id: number, montant: number) {
        this.fk_participant_groupe_id = fk_participant_groupe_id;
        this.fk_depense_id = fk_depense_id;
        this.montant = montant;
    }

    public static from_JSON(json: any): AffiliationDepense {
        return new AffiliationDepense(
            json['fk_participant_groupe_id'],
            json['fk_depense_id'],
            json['montant']
        );
    }
}