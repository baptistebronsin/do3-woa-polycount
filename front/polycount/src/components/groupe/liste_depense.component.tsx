import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import CarteDepense from "./carte_depense.component";

function ListeDepenses({ depenses, nom_participants, affiliations }: { depenses: Depense[], nom_participants: NomParticipant[], affiliations: AffiliationDepense[] }) {
    return (
        <div style={{ height: '70vh', overflow: 'auto' }}>
            {
                depenses.map((depense: Depense, index: number) => (
                    <CarteDepense key={index} depense={ depense } nom_participants={ nom_participants } affiliations={ affiliations } />
                ))
            }
        </div>
    );
}

export default ListeDepenses;