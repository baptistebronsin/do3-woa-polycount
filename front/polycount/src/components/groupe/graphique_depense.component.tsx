import React from "react";
import { Chart } from "react-google-charts";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";

function GraphiqueDepense({ nom_participants, depenses, affiliations }: { nom_participants: NomParticipant[], depenses: Depense[], affiliations: AffiliationDepense[] }) {
    const data = [
        ["Noms", "", { role: "style" }],
        ...nom_participants.map((nom_participant: NomParticipant) => {
            const total_depense = affiliations.filter(
                (affiliation: AffiliationDepense) => affiliation.fk_participant_groupe_id === nom_participant.pk_participant_id
            ).reduce(
                (somme: number, affiliation: AffiliationDepense) => somme + (affiliation.montant ?? (depenses.find(
                    (dep: Depense) => dep.pk_depense_id === affiliation.fk_depense_id
                )!.montant / affiliations.filter(
                    (aff: AffiliationDepense) => aff.fk_depense_id === affiliation.fk_depense_id
                ).reduce(
                    (sum: number, aff: AffiliationDepense) => sum += 1, 0)
                )
                ), 0
            );
            return [nom_participant.nom, total_depense, total_depense > 0 ? "#43BB02" : (total_depense < 0 ? "#DE4125" : "#F2B705")];
        })
    ];
      
    return (
        <Chart chartType="ColumnChart" width="100%" height="600px" data={data}/>
    );
}

export default GraphiqueDepense;