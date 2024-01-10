import { SyntheticEvent, useEffect, useState } from "react";
import LoaderSpinner from "../loader/loader_spinner.component";
import TextInput from "../input/text_input.component";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import Selecteur from "../input/selecteur.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Depense } from "../../models/depense.model";

function CreationDepense({ groupe_id, annulation, ajouter_depense, nom_participants, participant_actuel }: { groupe_id: number, annulation: Function, ajouter_depense: Function, nom_participants: NomParticipant[], participant_actuel: ParticipantGroupe }) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [nom_depense, set_nom_depense] = useState<string>("");
    const [montant, set_montant] = useState<number>(0);
    const [participants, set_participants] = useState<NomParticipant[]>([]);

    const [participants_selecteur, set_participants_selecteur] = useState<NomParticipant[]>([{ pk_participant_id: -1, nom: "Veuillez sectionner un participant" }, ...[...nom_participants].filter((p: NomParticipant) => p.pk_participant_id != participant_actuel.pk_participant_groupe_id)]);
    const [montant_partage_null, set_montant_partage_null] = useState<number>(0);
    const [montants_partages, set_montants_partages] = useState<{ [key: string]: number }>({});

    const [chargement, set_chargement] = useState<boolean>(false);
    const [message_erreur, set_message_erreur] = useState<string | null>(null);

    useEffect(() => {
        set_participants_selecteur([{ pk_participant_id: -1, nom: "Veuillez sectionner un participant" }, ...[...nom_participants].filter((p: NomParticipant) => p.pk_participant_id != participant_actuel.pk_participant_groupe_id)]);
    }, [nom_participants]);

    useEffect(() => {
        if (montant > 0) {
            const montant_partage: number = (montant - Object.keys(montants_partages).reduce((sum: number, key: string) => sum + montants_partages[key], 0)) / (participants.length + 1 - Object.keys(montants_partages).filter((key: string) => montants_partages[key] > 0).length);
            const montant_partage_arrondi: number = Math.round(montant_partage * 100) / 100;
            set_montant_partage_null(montant_partage_arrondi);
        } else if (montant == 0) {
            set_montant_partage_null(0);
        }
    }, [montant, montants_partages]);

    useEffect(() => {
        let struct: any = {};
        Object.keys(montants_partages).map((key: string) => {
            if (!participants.find((p: NomParticipant) => p.pk_participant_id == parseInt(key))) {
                struct = {...montants_partages};
                delete struct[key];
                set_montants_partages({ ...struct });
            }
        });

        if (montant > 0) {
            const montant_partage: number = (montant - Object.keys(struct).reduce((sum: number, key: string) => sum + struct[key], 0)) / (participants.length + 1 - Object.keys(struct).filter((key: string) => struct[key] > 0).length);
            const montant_partage_arrondi: number = Math.round(montant_partage * 100) / 100;
            set_montant_partage_null(montant_partage_arrondi);
        } else if (montant == 0) {
            set_montant_partage_null(0);
        }
    }, [participants]);

    const ajouter_participant_depuis_selecteur = (id: string) => {
        const participant: NomParticipant | undefined = nom_participants.filter((p: NomParticipant) => p.pk_participant_id == parseInt(id))[0];
        if (participant) {
            set_participants([...participants, participant]);
            const nouvelle_liste: NomParticipant[] = [...participants_selecteur].filter((p: NomParticipant) => p.pk_participant_id != participant.pk_participant_id);
            set_participants_selecteur(nouvelle_liste);
        }
    };

    const supprimer_participant_depuis_selecteur = (id: number) => {
        const participant: NomParticipant | undefined = nom_participants.find((p: NomParticipant) => p.pk_participant_id == id);

        if (participant) {
            const nouvelles_liste_participants: NomParticipant[] = [...participants].filter((p: NomParticipant) => p.pk_participant_id != participant.pk_participant_id);
            set_participants(nouvelles_liste_participants);
            const nouvelle_liste_selecteur: NomParticipant[] = [...participants_selecteur, participant];
            set_participants_selecteur(nouvelle_liste_selecteur);
        }
    }

     const creer_depense_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom_depense === "") {
            set_message_erreur("Veuillez saisir un nom de dépense.");
            return null;
        }

        if (nom_depense.length > 50) {
            set_message_erreur("Veuillez saisir un nom de dépense de moins de 50 caractères.");
            return null;
        }

        if (montant == 0) {
            set_message_erreur("Veuillez saisir un montant de dépense.");
            return null;
        }

        if (montant < 0) {
            set_message_erreur("Veuillez saisir un montant positif.");
            return null;
        }

        Object.keys(montants_partages).map((key: string) => {
            if (montants_partages[key] < 0) {
                set_message_erreur("Veuillez saisir un montant positif pour chaque participant.");
                return null;
            }
        });

        if (Object.keys(montants_partages).reduce((sum: number, key: string) => sum + montants_partages[key], 0) > montant) {
            set_message_erreur("La somme des montants des participants est supérieur au montant de la dépense.");
            return null;
        }

        const participants_affiliations = [...participants.map(
            (p: NomParticipant) => ({ fk_participant_groupe_id: p.pk_participant_id, montant: montants_partages[p.pk_participant_id+""] ?? null })
        ), { fk_participant_groupe_id: participant_actuel.pk_participant_groupe_id, montant: montants_partages[participant_actuel.pk_participant_groupe_id+""] ?? null }];

        const api_body: any = {
            groupe_id_param: groupe_id,
            titre: nom_depense,
            montant: Number(montant),
            participants: participants_affiliations
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/depense/", api_body, authentification, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("La dépense a bien été créée.");

            ajouter_depense(Depense.from_JSON(reponse.data.data), participants_affiliations.filter((p: any) => p.montant != null).map((p: any) => ({ fk_participant_groupe_id: p.fk_participant_groupe_id, fk_depense_id: reponse.data.data.pk_depense_id, montant: p.montant })));
            annulation(false);
        }
     }

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(10, 10, 10, 0.3)', zIndex: 9 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: message_erreur ? '500px' : '470px', zIndex: 10, padding: "10px 20px", borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Création d'une dépense</h1>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <p className="lien" onClick={() => annulation(false)}>Annuler</p>
                        {
                            chargement ?
                            <button className="full-button centre-centre" onClick={() => {}}>
                                <LoaderSpinner />
                                <p className="inline-block">&nbsp;Création en cours</p>
                            </button> :
                            <button className="full-button" onClick={creer_depense_api}>Créer la dépense</button>
                        }
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '30px', margin: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="nom-depense" className="inline-block">Nom de la dépense :&nbsp;</label>
                            <TextInput id="nom-depense" label="Nom de la dépense" value={nom_depense} longueur_max={50} onChange={(e: any) => set_nom_depense(e.target.value)} style={{ width: '340px' }} />
                        </div>
                        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="montant-depense" className="inline-block">Montant :&nbsp;</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TextInput id="montant-depense" type="number" label="Montant de la dépense" value={montant} onChange={(e: any) => set_montant(e.target.value)} style={{ display: 'inline-block' }} />
                                <p>&nbsp;€</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #8E8E8E', maxHeight: '340px' }}></div>
                    <div>
                        <Selecteur label="Participants" options={ participants_selecteur.length > 1 ? participants_selecteur.filter((p: NomParticipant) => p.pk_participant_id != participant_actuel.pk_participant_groupe_id).map((p: NomParticipant) => ({ value: p.pk_participant_id + "", label: p.nom ?? "participant n°" + p.pk_participant_id })) : ( participants.length > 1 ? [{ value: "0", label: "Plus de participant disponible" }] : [{ value: "0", label: "Aucun participant" }]) } valeur_defaut={ participants_selecteur.length > 1 ? participants_selecteur.filter((p: NomParticipant) => p.pk_participant_id != participant_actuel.pk_participant_groupe_id).map((p: NomParticipant) => p.pk_participant_id + "")[0] : "0" } changement={ ajouter_participant_depuis_selecteur } />
                        <div>
                            <h3 style={{ margin: '10px 0' }}>Participants ajoutés</h3>
                            <hr style={{ marginTop: '10px 0' }} />
                            <div style={{ overflow: 'auto', height: '270px', paddingRight: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', margin: '30px 0' }}>
                                    <p>{ authentification ? authentification.authentification.utilisateur?.prenom + " " + authentification.authentification.utilisateur?.nom[0] + "." : "Participant n°" + participant_actuel.pk_participant_groupe_id }</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
                                            <TextInput type="number" label="montant personnalisé" value={null} placeholder={montant_partage_null} onChange={(e: any) => { const struct = {...montants_partages}; struct[participant_actuel.pk_participant_groupe_id+""] = Number(e.target.value); set_montants_partages({ ...struct })}} />€
                                        </div>
                                        <FontAwesomeIcon icon={faTrashCan} style={{ color: 'white' }}/>
                                    </div>
                                </div>
                                {
                                    participants.map((p: NomParticipant) => (
                                        <div key={p.pk_participant_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', margin: '30px 0' }}>
                                            <p>{ p.nom ?? "participant n°" + p.pk_participant_id }</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                    <TextInput type="number" label="montant personnalisé" value={null} placeholder={montant_partage_null} onChange={(e: any) => { const struct = {...montants_partages}; struct[p.pk_participant_id+""] = Number(e.target.value); set_montants_partages({ ...struct })}} />€
                                                </div>
                                                <FontAwesomeIcon icon={faTrashCan} style={{ color: 'red' }} onClick={() => supprimer_participant_depuis_selecteur(p.pk_participant_id)} className="hover" />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    message_erreur ?
                    <p className="centre" style={{ color: 'red', marginTop: '10px' }}>
                        { message_erreur }
                    </p> : <></>
                }
            </div>
        </div>
    );
}

export default CreationDepense;