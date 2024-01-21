import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AffiliationDepense } from "../../models/affiliation_depense.model";
import { Depense } from "../../models/depense.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { faFloppyDisk, faPencil } from "@fortawesome/free-solid-svg-icons";
import { SyntheticEvent, useEffect, useState } from "react";
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
import Selecteur from "../input/selecteur.component";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { toast } from "sonner";

function DetailDepense({ depense, nom_participants, affiliations, tags, attribution_tags, suppression, participant_actuel, modifier_depense }: { depense: Depense, nom_participants: NomParticipant[], affiliations: AffiliationDepense[], tags: Tag[], attribution_tags: { fk_depense_id: number; fk_tag_id: number }[], suppression: Function, participant_actuel: ParticipantGroupe | null, modifier_depense: Function }) {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [est_modification, set_est_modification] = useState<boolean>(false);
    const [chargement_modification, set_chargement_modification] = useState<boolean>(false);
    const [chargement_suppression, set_chargement_suppression] = useState<boolean>(false);

    const [titre, set_titre] = useState<string | null>("");
    const [montant, set_montant] = useState<number>(0);
    const [participant_id_payeur, set_participant_id_payeur] = useState<string>("");
    const [url_image, set_url_image] = useState<string | null>("");

    const [messageur_erreur, set_messageur_erreur] = useState<string>("");

    const participant_createur: NomParticipant | undefined = nom_participants.find(
        (participant: NomParticipant) => participant.pk_participant_id === depense.fk_participant_createur_id
    );

    useEffect(() => {
        set_titre(depense.titre);
        set_montant(depense.montant);
        set_participant_id_payeur(depense.fk_participant_createur_id+"");
        set_url_image(depense.lien_image ?? "");
        set_est_modification(false);
    }, [depense]);

    useEffect(() => {
        set_messageur_erreur("");
    }, [titre, montant]);

    const switch_modification = () => {
        set_est_modification(!est_modification);
    }

    const modifier_depense_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (titre === "") {
            set_messageur_erreur("Un titre doit être renseigné");
            return;
        }

        if (montant === 0) {
            set_messageur_erreur("Un montant doit être renseigné");
            return;
        }

        const api_body = {
            depense_id: depense.pk_depense_id,
            titre: titre,
            montant: Number(montant),
            participant_payeur_id: Number(participant_id_payeur),
            url_image: url_image
        }

        set_chargement_modification(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api("PUT", "/depense", api_body, authentification, navigate, true);

        set_chargement_modification(false);
      
        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("La dépense a bien été modifiée.");

            modifier_depense(Depense.from_JSON(reponse.data.data));
            set_est_modification(false);
        }
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
        <div style={{ display: 'grid', gridTemplateRows: '70px auto 50px', height: '70vh', margin: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ height: '20px' }}></div>
                    {
                        est_modification ? (
                            <div style={{ color: 'black' }}>
                                <TextInput label="Titre" type='text' value={ titre } valeur_defaut={ titre ?? "Dépense n°" + depense.pk_depense_id } onChange={ (e: any) => set_titre(e.target.value) } />
                            </div>
                        ) : (
                            <p>{ depense.titre ?? "Dépense n°" + depense.pk_depense_id }</p>
                        )
                    }
                    <p style={{ color: 'grey' }}>Ajouté le : <span style={{ color: 'black' }}>{ moment(depense.ajoute_le).format(moment_date_time_format) }</span></p>
                </div>
                {
                    est_modification ?
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="lien" onClick={switch_modification}>Annuler</button>
                        {
                            chargement_modification ?
                            <button className="full-button centre-centre" onClick={() => {}}>
                                <LoaderSpinner />
                                <p className="inline-block">&nbsp;Enregistrement en cours</p>
                            </button> :
                            <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={ modifier_depense_api }>
                                <FontAwesomeIcon icon={faFloppyDisk} />
                                Enregistrer
                            </button>
                        }
                        
                    </div> :
                    <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={ authentification?.authentification.utilisateur?.desactive_le !== null ? () => toast.warning("Votre compte est en procédure de désactivation, vous ne pouvez plus modifier de dépense.") : (participant_actuel != null && participant_actuel.peut_modifier_depense ? switch_modification : () => toast.warning("Vous n'avez pas les permissions pour modifier une dépense")) }>
                        <FontAwesomeIcon icon={faPencil} />
                        Modifier
                    </button>
                }
            </div>
            <div>
                <div>
                    <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                        <p>Montant :</p>
                        {
                            est_modification ? (
                                <div style={{ color: 'black' }}>
                                    <TextInput label="Montant" value={ montant } valeur_defaut={ montant } onChange={ (e: any) => set_montant(e.target.value) } />
                                </div>
                            ) : (
                                <span style={{ color: 'black' }}>{ depense.montant.toFixed(2) } €</span>
                            )
                        }
                    </div>
                    <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                        <p>Payé par :</p>
                        {
                            est_modification ? (
                                <div style={{ color: 'black' }}>
                                    <Selecteur label="Payeur" options={ nom_participants.map((p: NomParticipant) => ({ value: p.pk_participant_id+"", label: p.nom ?? "Participant n°" + p.pk_participant_id })) } valeur_defaut={ participant_id_payeur+"" } changement={ set_participant_id_payeur } />
                                </div>
                            ) : (
                                <span style={{ color: 'black' }}>{ participant_createur ? participant_createur.nom : "Participant inconnu" }</span>
                            )
                        }
                    </div>
                    {
                        est_modification ? (
                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                                <p>URL de l'image :</p>
                                <div style={{ color: 'black' }}>
                                    <TextInput type="url" label="URL de l'image" value={ url_image } valeur_defaut={ url_image ?? "" } onChange={ (e: any) => set_url_image(e.target.value) } placeholder="https://..." style={{ width: '340px' }} />
                                </div>
                            </div>
                        ) : (<></>)
                    }
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
                <p style={{ color: 'red', textAlign: 'center' }}>{ messageur_erreur }</p>
            </div>
            {
                est_modification ? <></> : (
                    <div className="centre">
                        {
                            chargement_suppression ?
                            <button className="delete-button centre-centre" onClick={() => {}}>
                                <LoaderSpinner />
                                <p className="inline-block">&nbsp;Suppression en cours</p>
                            </button> :
                            <button className="delete-button" onClick={ authentification?.authentification.utilisateur?.desactive_le !== null ? () => toast.warning("Votre compte est en procédure de désactivation, vous ne pouvez plus supprimer de dépense.") : (participant_actuel != null && participant_actuel.peut_supprimer_depense ? supprimer_depense_api : () => toast.warning("Vous n'avez pas les permissions pour supprimer une dépense")) }>Supprimer la dépense</button>
                        }
                    </div>
                )
            }
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