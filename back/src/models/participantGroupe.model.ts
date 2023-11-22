export interface IParticipantGroupe {
    pk_participant_groupe_id: number;
    fk_utilisateur_id: number;
    fk_groupe_id: number;
    peut_creer_depense: boolean;
    peut_modifier_depense: boolean;
    peut_supprimer_depense: boolean;
    peut_manipuler_tag: boolean;
    peut_modifier_montant_max_depense: boolean;
    montant_max_depense: number | null;
    rejoint_le: Date | null;
    quitte_le: Date | null;
}