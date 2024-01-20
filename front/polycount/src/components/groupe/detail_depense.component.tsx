import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { faFloppyDisk, faPencil } from "@fortawesome/free-solid-svg-icons";
import { SyntheticEvent, useState } from "react";
import moment from "moment";
import { moment_date_time_format } from "../../utils/moment.util";
import { Tag } from "../../models/tag.model";
import PastilleTag from "../tag/pastille_tag.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { NavigateFunction, useNavigate } from "react-router-dom";
import LoaderSpinner from "../loader/loader_spinner.component";
import TextInput from "../input/text_input.component";

function DetailDepense({ depense, nom_participants, affiliations, tags, attribution_tags, suppression }: { depense: Depense, nom_participants: NomParticipant[], affiliations: AffiliationDepense[], tags: Tag[], attribution_tags: { fk_depense_id: number; fk_tag_id: number }[], suppression: Function }) {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [est_modification, set_est_modification] = useState<boolean>(false);
    const [chargement_suppression, set_chargement_suppression] = useState<boolean>(false);

    const participant_createur: NomParticipant | undefined = nom_participants.find(
        (participant: NomParticipant) => participant.pk_participant_id === depense.fk_participant_createur_id
    );

    const switch_modification = () => {
        set_est_modification(!est_modification);
    }

    const supprimer_depense_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        set_chargement_suppression(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api(
            "DELETE",
            "/depense/" + depense.pk_depense_id,
            null,
            authentification,
            navigate,
            true
          );

          set_chargement_suppression(false);
      
        if (!reponse)
            return;

        suppression(depense);
    }
    
    return (
        <div style={{ display: 'grid', gridTemplateRows: '60px auto 50px', height: '70vh', margin: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p>
                    { depense.titre }
                    <br />
                    <span style={{ color: 'grey' }}>Ajouté le : </span>{ moment(depense.ajoute_le).format(moment_date_time_format) }
                </p>
                {
                    est_modification ?
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="lien" onClick={switch_modification}>Annuler</button>
                        <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FontAwesomeIcon icon={faFloppyDisk} />
                            Enregistrer
                        </button>
                    </div> :
                    <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={switch_modification}>
                        <FontAwesomeIcon icon={faPencil} />
                        Modifier
                    </button>
                }
            </div>
            <div>
            {
                est_modification ?
                <div>
                    
                </div> :
                <div>
                    <p style={{ color: 'grey' }}>Montant : <span style={{ color: 'black' }}>{ depense.montant.toFixed(2) } €</span></p>
                    <p style={{ color: 'grey' }}>Payé par : <span style={{ color: 'black' }}>{ participant_createur ? participant_createur.nom : "Participant inconnu" }</span></p>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <p style={{ color: 'grey' }}>Tags : </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                        {
                            attribution_tags.length === 0 ?
                            <p>Aucun tag</p> :
                            attribution_tags.map((tag: { fk_depense_id: number; fk_tag_id: number }) => {
                                const tag_trouve: Tag | undefined = tags.find((t: Tag) => t.pk_tag_id === tag.fk_tag_id);

                                if (tag_trouve !== undefined) {
                                    return <PastilleTag tag={ tag_trouve } />
                                }

                                return <></>
                            })
                        }
                        </div>
                    </div>
                    <div style={{ height: '20px' }}></div>
                    <hr />
                    <div style={{ height: '20px' }}></div>
                    <div>
                        <p>Participants : </p>
                        <div style={{ float: 'left', height: '100%', overflow: 'auto' }}>
                        {
                            nom_participants.map((nom_participant: NomParticipant) => {
                                const participant_trouve: AffiliationDepense | undefined = affiliations.find(
                                    (affiliation: AffiliationDepense) => affiliation.fk_participant_groupe_id === nom_participant.pk_participant_id && affiliation.fk_depense_id === depense.pk_depense_id
                                );

                                if (participant_trouve !== undefined) {
                                    return <DetailDepenseParticipant participant_id={ participant_trouve.fk_participant_groupe_id } depense={ depense } nom_participant={ nom_participant } affiliations={ affiliations } />
                                }
                                return <></>
                            })
                        }
                        </div>
                    </div>
                </div>
            }
            </div>
            <div className="centre">
                {
                    chargement_suppression ?
                    <button className="delete-button centre-centre" onClick={() => {}}>
                        <LoaderSpinner />
                        <p className="inline-block">&nbsp;Suppression en cours</p>
                    </button> :
                    <button className="delete-button" onClick={ supprimer_depense_api }>Supprimer la dépense</button>
                }
            </div>
        </div>
    );
}

function DetailDepenseParticipant ({ participant_id, depense, nom_participant, affiliations }: { participant_id: number, depense: Depense, nom_participant: NomParticipant, affiliations: AffiliationDepense[] }) {
    const affiliation: AffiliationDepense | undefined = affiliations.find((affiliation: AffiliationDepense) => affiliation.fk_participant_groupe_id === participant_id && affiliation.fk_depense_id === depense.pk_depense_id);

    const montant_calcule: number = (depense.montant - affiliations.filter((a: AffiliationDepense) => a.fk_depense_id === depense.pk_depense_id && a.montant !== null).reduce((somme: number, a: AffiliationDepense) => somme += (a.montant ?? 0), 0)) / (affiliations.filter((a: AffiliationDepense) => a.fk_depense_id === depense.pk_depense_id && a.montant === null).length);
    const montant_affiliation: string = affiliation && affiliation.montant != null ? affiliation.montant.toFixed(2) : montant_calcule.toFixed(2);

    return (
        <div style={{ display: 'inline-block', margin: '5px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #4B7BB4', borderRadius: '8px', padding: '6px 14px', gap: '20px' }}>
                <p>{ nom_participant.nom }</p>
                <p style={{ color: '#4B7BB4', fontWeight: 'bold' }}>{ montant_affiliation } €</p>
            </div>
        </div>
    );
}

export default DetailDepense;