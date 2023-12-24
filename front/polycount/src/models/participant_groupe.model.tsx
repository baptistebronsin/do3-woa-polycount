export class ParticipantGroupe {
    pk_participant_groupe_id: number;
    fk_utilisateur_id: number | null;
    fk_groupe_id: number;
    nom: string | null;
    peut_creer_depense: boolean;
    peut_modifier_depense: boolean;
    peut_supprimer_depense: boolean;
    peut_manipuler_tag: boolean;
    peut_modifier_montant_max_depense: boolean;
    montant_max_depense: number | null;
    rejoint_le: Date | null;
    quitte_le: Date | null;

    public constructor (pk_participant_groupe_id: number, fk_utilisateur_id: number | null, fk_groupe_id: number, nom: string | null, peut_creer_depense: boolean, peut_modifier_depense: boolean, peut_supprimer_depense: boolean, peut_manipuler_tag: boolean, peut_modifier_montant_max_depense: boolean, montant_max_depense: number | null, rejoint_le: Date | null, quitte_le: Date | null) {
        this.pk_participant_groupe_id = pk_participant_groupe_id;
        this.fk_utilisateur_id = fk_utilisateur_id;
        this.fk_groupe_id = fk_groupe_id;
        this.nom = nom;
        this.peut_creer_depense = peut_creer_depense;
        this.peut_modifier_depense = peut_modifier_depense;
        this.peut_supprimer_depense = peut_supprimer_depense;
        this.peut_manipuler_tag = peut_manipuler_tag;
        this.peut_modifier_montant_max_depense = peut_modifier_montant_max_depense;
        this.montant_max_depense = montant_max_depense;
        this.rejoint_le = rejoint_le;
        this.quitte_le = quitte_le;
    }

    public static from_JSON (json: any): ParticipantGroupe {
        return new ParticipantGroupe(
            json['pk_participant_groupe_id'],
            json['fk_utilisateur_id'],
            json['fk_groupe_id'],
            json['nom'],
            json['peut_creer_depense'],
            json['peut_modifier_depense'],
            json['peut_supprimer_depense'],
            json['peut_manipuler_tag'],
            json['peut_modifier_montant_max_depense'],
            json['montant_max_depense'],
            json['rejoint_le'] ? new Date(json['rejoint_le']) : null,
            json['quitte_le'] ? new Date(json['quitte_le']) : null
        );
    }
}