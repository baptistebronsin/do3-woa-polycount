import { useState } from "react";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import CarteDepense from "./carte_depense.component";

function ListeDepenses({ depenses, nom_participants, affiliations, depense_selectionnee, set_depense_selectionnee }: { depenses: Depense[], nom_participants: NomParticipant[], affiliations: AffiliationDepense[], depense_selectionnee: number | undefined, set_depense_selectionnee: Function }) {
    return (
        <div style={{ height: '70vh', overflow: 'auto' }}>
            {
                depenses.map((depense: Depense, index: number) => (
                    <CarteDepense key={ index } depense={ depense } nom_participants={ nom_participants } affiliations={ affiliations } est_selectionne={ depense_selectionnee === depense.pk_depense_id } cliquer={set_depense_selectionnee} />
                ))
            }
        </div>
    );
}

export default ListeDepenses;