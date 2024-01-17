import moment from "moment";
import { Depense } from "../../models/depense.model";
import { moment_date_time_format } from "../../utils/moment.util";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { Utilisateur } from "../../models/utilisateur.model";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";

function CarteDepense({ depense, nom_participants, affiliations, est_selectionne, cliquer }: { depense: Depense, nom_participants: NomParticipant[], affiliations: AffiliationDepense[], est_selectionne: boolean, cliquer: Function }) {

    const participant_createur: NomParticipant | undefined = nom_participants.find(
        (participant: NomParticipant) => participant.pk_participant_id === depense.fk_participant_createur_id
    )!;

    const selectionner = () => {
        cliquer(est_selectionne ? undefined : depense.pk_depense_id);
    }

    return (
        <div style={{ margin: '10px', padding: '10px', backgroundColor: est_selectionne ? 'rgba(75, 123, 180, 0.06)' : 'white', borderRadius: '10px', border: est_selectionne ? '2px solid #4B7BB4': '2px solid lightgrey' }} onClick={selectionner} className="hover">
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ color: 'grey', fontSize: '16px' }}>{ moment(depense.ajoute_le).format(moment_date_time_format) }</p>
                    <p>{ depense.montant.toFixed(2) } €</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                    {
                        depense.lien_image ?
                        <img src={depense.lien_image} alt={`dépense numéro ${depense.pk_depense_id}`} className="img-80" /> :
                        <div style={{ background: 'linear-gradient(135deg, #4B7BB4, #225292)', height: '80px', borderRadius: '6px' }}></div>
                    }
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                        <p>{ depense.titre }</p>
                        {
                            participant_createur != undefined ?
                            <p style={{ color: 'grey' }}>Payé par { participant_createur.nom ?? "Participant n°" + participant_createur.pk_participant_id }</p> :
                            <p>Payé par Casper</p>
                        }
                        
                    </div>
                </div>
            </div>
            <hr style={{ margin: '10px 0' }} />
            <div>
                <p style={{ color: 'grey' }}>Participants liés</p>
                <div style={{ display: 'block'}}>
                    {
                        affiliations.filter(
                            (affiliation: AffiliationDepense) => affiliation.fk_depense_id === depense.pk_depense_id
                        ).map(
                            (affiliation: AffiliationDepense, index: number) => {
                                if (index == 0)
                                    return (
                                    <p key={index} className="inline-block">{nom_participants.find(
                                        (participant: NomParticipant) => participant.pk_participant_id === affiliation.fk_participant_groupe_id)?.nom}</p>
                                        )
                                else if (affiliations.filter((affiliation: AffiliationDepense) => affiliation.fk_depense_id === depense.pk_depense_id).length - 1 == index)
                                    return (
                                        <p key={index} className="inline-block">&nbsp;et {nom_participants.find(
                                            (participant: NomParticipant) => participant.pk_participant_id === affiliation.fk_participant_groupe_id)?.nom}</p>
                                            )
                                else
                                    return (
                                        <p key={index} className="inline-block">, {nom_participants.find(
                                            (participant: NomParticipant) => participant.pk_participant_id === affiliation.fk_participant_groupe_id)?.nom}</p>
                                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default CarteDepense;