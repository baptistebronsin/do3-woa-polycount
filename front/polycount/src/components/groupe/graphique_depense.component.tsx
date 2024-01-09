import React from "react";
import { Chart } from "react-google-charts";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";

function GraphiqueDepense({ nom_participants, depenses, affiliations }: { nom_participants: NomParticipant[], depenses: Depense[], affiliations: AffiliationDepense[] }) {
    
    // Qui te doit de l'argent - (MOINS) A qui tu dois de l'argent
    const data = [
        ["Noms", "", { role: "style" }],
        ...nom_participants.map((nom_participant: NomParticipant) => {
            // On récupère les affiliations de ce participant
            const affiliations_participant: AffiliationDepense[] = affiliations.filter(
                (affiliation: AffiliationDepense) => affiliation.fk_participant_groupe_id === nom_participant.pk_participant_id
            );

            // On récupère la somme qu'on te doit
            const somme_positive_participant: number = depenses.filter(
                (depense: Depense) => depense.fk_participant_createur_id === nom_participant.pk_participant_id
            ).reduce(
                (somme: number, depense: Depense) => somme += depense.montant, 0
            );

            // On récupère la somme que tu dois
            const somme_negative_participant: number = affiliations_participant.reduce(
                (somme: number, affiliation: AffiliationDepense) => {
                    if (affiliation.montant != null)
                        return somme += affiliation.montant;
                    else {
                        const depense: Depense | undefined = depenses.find(
                            (depense: Depense) => depense.pk_depense_id === affiliation.fk_depense_id
                        );

                        if (!depense) {
                            console.log("Erreur : Impossible de trouver la dépense correspondante à l'affiliation : " + affiliation.fk_depense_id);
                            return somme;
                        }

                        const montants_deja_definis: number = affiliations.filter(
                                (aff: AffiliationDepense) => depense.pk_depense_id === aff.fk_depense_id && aff.montant != null
                            ).reduce(
                                (somme: number, aff: AffiliationDepense) => somme += aff.montant!, 0
                            );

                        const nombre_affiliation_pour_depense: number = affiliations.filter(
                            (affiliation: AffiliationDepense) => affiliation.fk_depense_id === depense.pk_depense_id && affiliation.montant == null
                        ).reduce(
                            (somme: number, _: AffiliationDepense) => somme += 1, 0
                        );

                        return somme += (depense.montant - montants_deja_definis) / nombre_affiliation_pour_depense;
                    }
                }, 0
            );

            const montant_total: number = somme_positive_participant - somme_negative_participant;

            return [nom_participant.nom, montant_total, montant_total > 0 ? "#43BB02" : (montant_total < 0 ? "#DE4125" : "#F2B705")];
        })
    ];
      
    return (
        <Chart chartType="ColumnChart" width="95%" height="70vh" data={data}/>
    );
}

export default GraphiqueDepense;