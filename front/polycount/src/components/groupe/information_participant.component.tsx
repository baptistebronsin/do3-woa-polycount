import moment from "moment";
import { Groupe } from "../../models/groupe.model";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { Utilisateur } from "../../models/utilisateur.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { moment_date_format } from "../../utils/moment.util";
import { SyntheticEvent, useEffect, useState } from "react";
import SelecteurDynamique from "../input/selecteur_dynamique.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFloppyDisk, faPencil } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../input/text_input.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoaderSpinner from "../loader/loader_spinner.component";
import Selecteur from "../input/selecteur.component";

function InformationParticipant ({ groupe, participants, utilisateurs, nom_participants, participant_actuel, ajouter_participant, ajouter_utilisateur, set_participants }: { groupe: Groupe, participants: ParticipantGroupe[], utilisateurs: Utilisateur[], nom_participants: NomParticipant[], participant_actuel: ParticipantGroupe, ajouter_participant: Function, ajouter_utilisateur: Function, set_participants: Function }) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [ajouter_participant_action, set_ajouter_participant_action] = useState<boolean>(false);
    const [participant_selectionne, set_participant_selectionne] = useState<ParticipantGroupe | undefined>(undefined);

    const selectionner_participant = (p: ParticipantGroupe) => {
        set_participant_selectionne(p);
    }

    const modification_participant = async (p: ParticipantGroupe) => {
        const participants_fun: ParticipantGroupe[] = [...participants.filter((p1: ParticipantGroupe) => p1.pk_participant_groupe_id !== p.pk_participant_groupe_id), p];
        set_participants(participants_fun);
        set_participant_selectionne(p);
    }

    return (
        <div style={{ margin: '10px 20px' }}>
            {
                ajouter_participant_action ?
                <AjouterParticipant groupe={ groupe } participant_actuel={ participant_actuel } annulation={() => set_ajouter_participant_action(false)} authentification={ authentification } navigate={ navigate } ajouter_participant={ ajouter_participant } ajouter_utilisateur={ ajouter_utilisateur } />: <></>
            }
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>Informations sur les participants</p>
                <button className="full-button" onClick={ () => set_ajouter_participant_action(true) }>Ajouter un participant</button>
            </div>
            {
                participant_selectionne !== undefined ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '600px auto' }}>
                        <div>
                            {
                                participants.map((participant: ParticipantGroupe) => <PetiteCarteParticipant groupe={ groupe } participant={ participant } nom_participants={ nom_participants } utilisateurs={ utilisateurs } participant_actuel={ participant_actuel } est_selectionnee={ participant_selectionne === participant } participant_clique={ selectionner_participant } />)
                            }
                            <div style={{ height: '50px' }}></div>
                        </div>
                        <div>
                            <GrandeCarteParticipant groupe={ groupe } participant={ participant_selectionne } nom_participants={ nom_participants } utilisateurs={ utilisateurs } participant_actuel={ participant_actuel } modification_participant={ modification_participant } ajouter_utilisateur={ ajouter_utilisateur } />
                        </div>
                    </div>
                ): (
                    <div>
                        {
                            participants.map((participant: ParticipantGroupe) => <PetiteCarteParticipant groupe={ groupe } participant={ participant } nom_participants={ nom_participants } utilisateurs={ utilisateurs } participant_actuel={ participant_actuel } est_selectionnee={ false } participant_clique={ selectionner_participant } />)
                        }
                        <div style={{ height: '50px' }}></div>
                    </div>
                )
            }
        </div>
    );
}

function PetiteCarteParticipant ({ groupe, participant, nom_participants, utilisateurs, participant_actuel, est_selectionnee, participant_clique }: { groupe: Groupe, participant: ParticipantGroupe, nom_participants: NomParticipant[], utilisateurs: Utilisateur[], participant_actuel: ParticipantGroupe, est_selectionnee: boolean, participant_clique: Function }) {
    const nom_participant: NomParticipant | undefined = nom_participants.find((nom_participant: NomParticipant) => nom_participant.pk_participant_id === participant.pk_participant_groupe_id);
    const utilisateur: Utilisateur | undefined = utilisateurs.find((utilisateur: Utilisateur) => utilisateur.pk_utilisateur_id === participant.fk_utilisateur_id);

    const statut: string = groupe.fk_utilisateur_createur_id === utilisateur?.pk_utilisateur_id ? "Administrateur" : utilisateurs.find((u: Utilisateur) => u.pk_utilisateur_id === participant.fk_utilisateur_id) ? "Participant" : "Participant fictif";

    const selectionner = () => {
        participant_clique(est_selectionnee ? undefined : participant);
    }

    return (
        <div key={ participant.pk_participant_groupe_id } className="centre" style={{ margin: '20px 0' }}>
            <div style={{ backgroundColor: est_selectionnee ? 'rgba(75, 123, 180, 0.06)' : 'white', padding: '10px', borderRadius: '10px', border: est_selectionnee ? '2px solid #4B7BB4' : '2px solid grey', width: '500px' }} className="hover" onClick={ selectionner }>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>{ nom_participant ? nom_participant.nom : "Casper" } <span style={{ color: 'grey' }}>{ nom_participant?.pk_participant_id === participant_actuel.pk_participant_groupe_id ? "(Vous)" : "" }</span></p>
                    <p style={{ color: statut === 'Administrateur' ? '#BA15C7' : statut === "Participant" ? '#35C715' : '#4B7BB4' }}>{ statut }</p>
                </div>
                {
                    participant.fk_utilisateur_id === null ?
                    <>
                        {
                            participant.quitte_le !== null ?
                            <>
                                <div style={{ height: '10px' }}></div>
                                <hr />
                                <p><span style={{ color: 'grey' }}>Exclusion du groupe : </span><span style={{ color: 'red' }}>{ moment(participant.quitte_le).format(moment_date_format) }</span></p>
                            </> : <></>
                        }
                    </> :
                    <>
                        <div style={{ height: '10px' }}></div>
                        <hr />
                        <div style={{ height: '10px' }}></div>
                        {
                            participant.rejoint_le ?
                            <p><span style={{ color: 'grey' }}>Rejoint le groupe : </span>{ moment(participant.rejoint_le).format(moment_date_format) }</p>:
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B7BB4' }}>
                                <p>Invitation envoyée</p>
                                &nbsp;<FontAwesomeIcon icon={faEnvelope} />
                            </div>
                        }
                        {
                            participant.montant_max_depense ?
                            <p><span style={{ color: 'grey' }}>Montant maximum des dépenses : </span><span style={{ color: 'red' }}>{ participant.montant_max_depense.toFixed(2) } €</span></p> :
                            <></>
                        }
                        {
                            participant.quitte_le ?
                            <p><span style={{ color: 'grey' }}>Quitté le groupe : </span><span style={{ color: 'red' }}>{ moment(participant.quitte_le).format(moment_date_format) }</span></p> :
                            <></>
                        }
                    </>
                }
            </div>
        </div>
    )
}

function GrandeCarteParticipant ({ groupe, participant, nom_participants, utilisateurs, participant_actuel, modification_participant, ajouter_utilisateur }: { groupe: Groupe, participant: ParticipantGroupe, nom_participants: NomParticipant[], utilisateurs: Utilisateur[], participant_actuel: ParticipantGroupe, modification_participant: Function, ajouter_utilisateur: Function }) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [nom_participant, set_nom_participant] = useState<NomParticipant | undefined>(undefined);
    const [utilisateur, set_utilisateur] = useState<Utilisateur | undefined>(undefined);

    const statut: string = groupe.fk_utilisateur_createur_id === utilisateur?.pk_utilisateur_id ? "Administrateur" : utilisateurs.find((u: Utilisateur) => u.pk_utilisateur_id === participant.fk_utilisateur_id) ? "Participant" : "Participant fictif";

    const [est_modification, set_est_modification] = useState<boolean>(false);
    const [est_association_participant, set_est_association_participant] = useState<boolean>(false);

    const [nom_participant_modif, set_nom_participant_modif] = useState<string>("");

    const [creation_depense, set_creation_depense] = useState<'true' | 'false'>("true");
    const [modification_depense, set_modification_depense] = useState<'true' | 'false'>("true");
    const [suppression_depense, set_suppression_depense] = useState<'true' | 'false'>("true");
    const [modification_tags, set_modification_tags] = useState<'true' | 'false'>("true");
    const [modification_montant_max, set_modification_montant_max] = useState<'true' | 'false'>('true');
    const [montant_max, set_montant_max] = useState<string>("");

    const [email_participant_fictif, set_email_participant_fictif] = useState<string>("");

    const [chargement_modification, set_chargement_modification] = useState<boolean>(false);
    const [chargement_suppression, set_chargement_suppression] = useState<boolean>(false);
    const [chargement_envoi_mail_participant_fictif, set_chargement_envoi_mail_participant_fictif] = useState<boolean>(false);

    const [message_erreur, set_message_erreur] = useState<string>("");
    const [message_erreur_email, set_message_erreur_email] = useState<string>("");

    useEffect(() => {
        set_message_erreur_email("");
    }, [email_participant_fictif]);

    useEffect(() => {
        set_message_erreur("");
    }, [nom_participant_modif, montant_max]);

    useEffect(() => {
        set_est_modification(false);

        set_nom_participant(nom_participants.find((nom_participant: NomParticipant) => nom_participant.pk_participant_id === participant.pk_participant_groupe_id));
        set_utilisateur(utilisateurs.find((u: Utilisateur) => u.pk_utilisateur_id === participant.fk_utilisateur_id));

        set_creation_depense(participant.peut_creer_depense ? "true" : "false");
        set_modification_depense(participant.peut_modifier_depense ? "true" : "false");
        set_suppression_depense(participant.peut_supprimer_depense ? "true" : "false");
        set_modification_tags(participant.peut_manipuler_tag ? "true" : "false");
        set_modification_montant_max(participant.peut_modifier_montant_max_depense ? "true" : "false");
        set_montant_max(participant.montant_max_depense ? participant.montant_max_depense + "" : "");
    }, [participant]);

    useEffect(() => {
        set_nom_participant_modif(nom_participant && nom_participant.nom != null ? nom_participant.nom : 'Casper')
    }, [nom_participant]);

    const switch_modification = () => {
        set_est_modification(!est_modification);
    }

    const modifier_participant_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (participant.fk_utilisateur_id === null && nom_participant_modif === "") {
            set_message_erreur("Veuillez spécifier un nom.");
            return ;
        }

        if (montant_max !== "" && isNaN(Number(montant_max))) {
            set_message_erreur("Si vous souhaitez préciser un montant maximum de dépense, veillez à ce que ce soit un nombre.");
            return ;
        }

        if (montant_max !== "" && Number(montant_max) < 0) {
            set_message_erreur("Veuillez préciser un montant maximum de dépense positif.");
            return ;
        }

        const api_body = {
            participant_groupe_id: participant.pk_participant_groupe_id,
            nom: nom_participant_modif,
            peut_creer_depense: creation_depense === "true",
            peut_modifier_depense: modification_depense === "true",
            peut_supprimer_depense: suppression_depense === "true",
            peut_manipuler_tag: modification_tags === "true",
            peut_modifier_montant_max_depense: modification_montant_max === "true",
            montant_max_depense: montant_max === "" ? null : Number(montant_max)
        }

        console.table(api_body);

        set_chargement_modification(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('PATCH', "/groupe/participant/modifier", api_body, authentification, navigate, true);

        set_chargement_modification(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Le participant a bien été modifié.");

            modification_participant(ParticipantGroupe.from_JSON(reponse.data.data));
            set_est_modification(false);
        }
    }

    const supprimer_participant_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (groupe.fk_utilisateur_createur_id === participant.fk_utilisateur_id) {
            toast.warning("L'administrateur du groupe ne peut pas être exclu du groupe.");
            return ;
        }

        const api_body = {
            participant_groupe_id: participant.pk_participant_groupe_id
        }

        set_chargement_suppression(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('PATCH', "/groupe/participant/quitter", api_body, authentification, navigate, true);

        set_chargement_suppression(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Le participant a bien été exclu.");

            modification_participant(ParticipantGroupe.from_JSON(reponse.data.data));
        }
    }

    const envoyer_invitation_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email_participant_fictif === "") {
            set_message_erreur_email("Veuillez spécifier une adresse email valide.");
            return ;
        }

        const api_body: any = {
            participant_groupe_id: participant.pk_participant_groupe_id,
            email: email_participant_fictif
        };

        set_chargement_envoi_mail_participant_fictif(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/association_utilisateur_fictif", api_body, authentification, navigate, true);
        
        set_chargement_envoi_mail_participant_fictif(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("L'invitation a bien été envoyée.");

            modification_participant(ParticipantGroupe.from_JSON(reponse.data.data.participant));
            ajouter_utilisateur(Utilisateur.from_JSON(reponse.data.data.utilisateur));
        }
    }

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', width: '100%', margin: '20px 0', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p>Informations sur le participant</p>
            {
                groupe.fk_utilisateur_createur_id === participant_actuel.fk_utilisateur_id ? (
                    <>
                    {
                        est_modification ?
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="lien" onClick={ switch_modification }>Annuler</button>
                            {
                                chargement_modification ?
                                <button className="full-button centre-centre" onClick={() => {}}>
                                    <LoaderSpinner />
                                    <p className="inline-block">&nbsp;Modification en cours</p>
                                </button> :
                                <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={ modifier_participant_api }>
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                    Enregistrer
                                </button>
                            }
                        </div> :
                        <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={switch_modification}>
                            <FontAwesomeIcon icon={faPencil} />
                            Modifier
                        </button>
                    }
                    </>
                ) : (<></>)
            }
            </div>
            <div>
                <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p>Nom d'usage :</p>
                    {
                        est_modification && statut === "Participant fictif" ? (
                            <div style={{ width: '40%', marginBottom: '10px' }}>
                                <TextInput label="Nom participant" value={ nom_participant_modif } longueur_max={30} valeur_defaut={ nom_participant_modif } onChange={ (e: any) => set_nom_participant_modif(e.target.value) } style={{ color: 'black', fontSize: '18px' }} />
                            </div>
                        ) : (
                            <span style={{ color: 'black' }}>{ nom_participant && nom_participant.nom ? nom_participant.nom : 'Casper' }</span>
                        )
                    }
                </div>

                <p style={{ color: 'grey' }}>Statut : <span style={{ color: 'black' }}>{ statut }</span></p>
                <div style={{ height: '20px' }}></div>
                {
                    utilisateur ? (
                    <>
                        <p>Informations utilisateur :</p>
                        <div style={{ margin: '0 30px' }}>
                            <p style={{ color: 'grey' }}>Nom : <span style={{ color: 'black' }}>{ utilisateur.nom }</span></p>
                            <p style={{ color: 'grey' }}>Prénom : <span style={{ color: 'black' }}>{ utilisateur.prenom }</span></p>
                            <p style={{ color: 'grey' }}>Email : <span style={{ color: 'black' }}>{ utilisateur.email }</span></p>
                            <p style={{ color: 'grey' }}>Rejoint le groupe le : <span style={{ color: 'black' }}>{ participant.rejoint_le ? moment(participant.rejoint_le).format(moment_date_format) : "Invitation envoyée" }</span></p>
                            {
                                participant.quitte_le ?
                                <p style={{ color: 'grey' }}>Quitté le groupe le : <span style={{ color: 'black' }}>{ moment(participant.quitte_le).format(moment_date_format) }</span></p> : <></>
                            }
                        </div>
                        <p>Autorisations :</p>
                        <div style={{ margin: '0 30px' }}>
                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Peut créer une dépense :</p>
                                {
                                    est_modification ? (
                                        <div style={{ color: 'black' }}>
                                            <Selecteur label="" options={[{ value: "true", label: "Activé" }, { value: "false", label: "Désactivé" }]} valeur_defaut={ creation_depense } changement={ set_creation_depense }/>
                                        </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.peut_creer_depense ? "Activé" : "Désactivé" }</span>)
                                }
                            </div>

                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Peut modifier une dépense :</p>
                                {
                                    est_modification ? (
                                        <div style={{ color: 'black', marginBottom: '10px' }}>
                                            <Selecteur label="" options={[{ value: "true", label: "Activé" }, { value: "false", label: "Désactivé" }]} valeur_defaut={ modification_depense } changement={ set_modification_depense }/>
                                        </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.peut_modifier_depense ? "Activé" : "Désactivé" }</span>)
                                }
                            </div>
                            
                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Peut supprimer une dépense :</p>
                                {
                                    est_modification ? (
                                        <div style={{ color: 'black', marginBottom: '10px' }}>
                                            <Selecteur label="" options={[{ value: "true", label: "Activé" }, { value: "false", label: "Désactivé" }]} valeur_defaut={ suppression_depense } changement={ set_suppression_depense }/>
                                        </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.peut_supprimer_depense ? "Activé" : "Désactivé" }</span>)
                                }
                            </div>
                            
                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Peut manipuler les tags :</p>
                                {
                                    est_modification ? (
                                        <div style={{ color: 'black', marginBottom: '10px' }}>
                                            <Selecteur label="" options={[{ value: "true", label: "Activé" }, { value: "false", label: "Désactivé" }]} valeur_defaut={ modification_tags } changement={ set_modification_tags }/>
                                        </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.peut_manipuler_tag ? "Activé" : "Désactivé" }</span>)
                                }
                            </div>

                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Peut modifier son montant maximum de dépense :</p>
                                {
                                    est_modification ? (
                                        <div style={{ color: 'black', marginBottom: '18px' }}>
                                            <Selecteur label="" options={[{ value: "true", label: "Activé" }, { value: "false", label: "Désactivé" }]} valeur_defaut={ modification_montant_max } changement={ set_modification_montant_max }/>
                                        </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.peut_modifier_montant_max_depense ? "Activé" : "Désactivé" }</span>)
                                }
                            </div>
                            
                            <div style={{ color: 'grey', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Montant maximum de dépense :</p>
                                {
                                    est_modification ? (
                                        <div style={{ width: '40%', marginBottom: '10px' }}>
                                        <TextInput label="Montant max dépense" value={ montant_max } valeur_defaut={ montant_max } onChange={ (e: any) => set_montant_max(e.target.value) } style={{ color: 'black', fontSize: '18px' }} />
                                    </div>
                                    ) : (<span style={{ color: 'black' }}>{ participant.montant_max_depense ? participant.montant_max_depense.toFixed(2) + " €" : "Aucun" }</span>)
                                }
                            </div>
                        </div>
                    </>
                    ) : (
                    <>
                        <p style={{ color: 'grey' }}>Informations utilisateur : <span style={{ color: 'black' }}>Inexistant</span></p>
                        {
                            groupe.fk_utilisateur_createur_id === participant_actuel.fk_utilisateur_id && participant.quitte_le === null ?
                            <button className="lien" onClick={ () => set_est_association_participant(true) }>Associer un utilisateur</button> : <></>
                        }
                    </>
                    )
                }
            </div>
            {
                !est_modification && participant.pk_participant_groupe_id !== participant_actuel.pk_participant_groupe_id && participant.fk_utilisateur_id !== groupe.fk_utilisateur_createur_id && participant_actuel.fk_utilisateur_id === groupe.fk_utilisateur_createur_id && participant.quitte_le === null ? (
                    <>
                        <div style={{ height: '30px' }}></div>
                        <div className="centre">
                            {
                                chargement_suppression ?
                                <button className="delete-button centre-centre" onClick={() => {}}>
                                    <LoaderSpinner />
                                    <p className="inline-block">&nbsp;Exclusion en cours</p>
                                </button> :
                                <button className="delete-button" onClick={ supprimer_participant_api }>Exclure le participant</button>
                            }
                        </div>
                    </>
                ) : <></>
            }
            <p style={{ color: 'red', textAlign: 'center' }}>{ message_erreur }</p>
            {
                    est_association_participant ? (
                        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(128, 128, 128, 0.8)', zIndex: 9 }}>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: message_erreur_email ? '400px' : '370px', zIndex: 10, padding: "10px 20px", borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h1>Association d'un participant fictif à un utilisateur</h1>
                                    <button className="lien" onClick={ () => set_est_association_participant(false) }>Annuler</button>
                                </div>
                                <div style={{ height: '50px' }}></div>
                                <div className="centre">
                                    <p style={{ width: '70%', textAlign: 'center' }}>Envoyer une invitation par mail à un utilisateur existant dans la base de données Polycount et qu'il prenne la place de ce participant fictif.</p>
                                </div>
                                <div style={{ height: '30px' }}></div>
                                <div className="centre">
                                    <TextInput label="Email" value={ email_participant_fictif } longueur_max={250} onChange={(e: any) => set_email_participant_fictif(e.target.value)} style={{ width: '500px' }} />
                                </div>
                                <div style={{ height: '30px' }}></div>
                                <div className="centre">
                                    {
                                        chargement_envoi_mail_participant_fictif ?
                                        <button className="full-button centre-centre" onClick={() => {}}>
                                            <LoaderSpinner />
                                            <p className="inline-block">&nbsp;Envoie en cours</p>
                                        </button> :
                                        <button className="full-button" onClick={ envoyer_invitation_api }>Envoyer l'invitation</button>
                                    }
                                </div>
                                {
                                    message_erreur_email ?
                                    <>
                                        <div style={{ height: '30px' }}></div>
                                        <p style={{ color: 'red', textAlign: 'center' }}>{ message_erreur_email }</p>
                                    </> : <></>
                                }
                            </div>
                        </div>
                    ) : (<></>)
            }
        </div>
    );
}

function AjouterParticipant ({ groupe, participant_actuel, annulation, authentification, navigate, ajouter_participant, ajouter_utilisateur }: { groupe: Groupe, participant_actuel: ParticipantGroupe, annulation: Function, authentification: AuthContextType | null, navigate: NavigateFunction, ajouter_participant: Function, ajouter_utilisateur: Function }) {
    const [type_ajout, set_type_ajout] = useState<number>(1);

    const types_ajout: { valeur: number, label: string }[] = [{ valeur: 1, label: 'Email' }, { valeur: 2, label: 'Lien' }, { valeur: 3, label: 'Fictif'}];

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(128, 128, 128, 0.8)', zIndex: 9 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: '470px', zIndex: 10, padding: "10px 20px", borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                {
                    groupe.fk_utilisateur_createur_id === participant_actuel.fk_utilisateur_id ?
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1>Ajout d'un participant</h1>
                            <p className="lien" onClick={() => annulation(false)}>Annuler</p>
                        </div>
                        <div className="centre" style={{ marginBottom: '10px' }}>
                            <SelecteurDynamique options={ types_ajout } defaut={ type_ajout } changement={(valeur: number) => set_type_ajout(valeur)} />
                        </div>
                        {
                            type_ajout === 1 ?
                            <AjoutEmail groupe={ groupe } authentification={ authentification } navigate={ navigate } ajouter_participant={ ajouter_participant } ajouter_utilisateur={ ajouter_utilisateur } />:
                            type_ajout === 2 ?
                            <AjoutLien groupe={ groupe } authentification={ authentification } navigate={ navigate } />:
                            <AjoutFictif groupe={ groupe } authentification={ authentification } navigate={ navigate } ajouter_participant={ ajouter_participant } />
                        }
                    </div>:
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1>Ajout d'un participant</h1>
                            <p className="lien" onClick={() => annulation(false)}>Annuler</p>
                        </div>
                        <p className="centre-centre">Vous devez être l'administrateur du groupe pour ajouter des nouveaux participants.</p>
                    </>
                }
            </div>
        </div>
    );
}

function AjoutEmail ({ groupe, authentification, navigate, ajouter_participant, ajouter_utilisateur }: { groupe: Groupe, authentification: AuthContextType | null, navigate: NavigateFunction, ajouter_participant: Function, ajouter_utilisateur: Function }) {
    const [email, set_email] = useState<string>("");
    const [chargement, set_chargement] = useState<boolean>(false);
    const [message_erreur, set_message_erreur] = useState<string>("");

    useEffect(() => {
        set_message_erreur("");
    }, [email]);

    const envoyer_invitation_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "") {
            set_message_erreur("Veuillez renseigner une adresse email.");
            return;
        }

        const api_body: any = {
            groupe_id: groupe.pk_groupe_id,
            email: email
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/email", api_body, authentification, navigate, true);
        
        set_chargement(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("L'invitation a bien été envoyée.");

            ajouter_participant(ParticipantGroupe.from_JSON(reponse.data.data.participant));
            ajouter_utilisateur(Utilisateur.from_JSON(reponse.data.data.utilisateur));
        }
    }

    return (
        <div>
            <p className="centre">Envoyer une invitation par mail à un utilisateur existant dans la base de données Polycount.</p>
            <div style={{ height: '30px' }}></div>
            <div className="centre">
                <TextInput label="Email" value={ email } longueur_max={250} onChange={(e: any) => set_email(e.target.value)} style={{ width: '500px' }} />
            </div>
            <div style={{ height: '30px' }}></div>
            <div className="centre">
                {
                    chargement ?
                    <button className="full-button centre-centre" onClick={() => {}}>
                        <LoaderSpinner />
                        <p className="inline-block">&nbsp;Envoie en cours</p>
                    </button> :
                    <button className="full-button" onClick={ envoyer_invitation_api }>Envoyer l'invitation</button>
                }
            </div>
            {
                message_erreur ?
                <>
                    <div style={{ height: '30px' }}></div>
                    <p style={{ color: 'red', textAlign: 'center' }}>{ message_erreur }</p>
                </> : <></>
            }
        </div>
    );
}

function AjoutLien ({ groupe, authentification, navigate }: { groupe: Groupe, authentification: AuthContextType | null, navigate: NavigateFunction }) {
    const [lien, set_lien] = useState<{ url: string, temps_valide: number } | undefined>(undefined);

    const [chargement, set_chargement] = useState<boolean>(false);

    const generer_lien_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        const api_body: any = {
            groupe_id: groupe.pk_groupe_id
        };

        set_chargement(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/groupe/participant/lien", api_body, authentification, navigate, true);
        set_chargement(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            const data_response: { url: string, temps_valide: number } = reponse.data.data;
            set_lien(data_response);
        }
    }

    return (
        <div>
            <p className="centre">Générer un lien d'invitation à votre groupe de dépense.</p>
            <div style={{ height: '30px' }}></div>
            {
                lien === undefined ?
                <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
                    <div className="centre">
                        <p style={{ width: '50%', border: '1px solid grey', borderRadius: '10px', padding: '6px 14px', color: 'grey', textAlign: 'center' }}>Aucun lien</p>
                    </div>
                    <div style={{ height: '30px' }}></div>
                    <div className="centre">
                    {
                        chargement ?
                        <button className="full-button centre-centre" onClick={() => {}}>
                            <LoaderSpinner />
                            <p className="inline-block">&nbsp;Génération en cours</p>
                        </button> :
                        <button className="full-button" onClick={ generer_lien_api }>Générer un lien</button>
                    }
                    </div> 
                </div>:
                <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
                    <div className="centre">
                        <p style={{ width: '50%', border: '1px solid grey', borderRadius: '10px', padding: '6px 14px', whiteSpace: 'nowrap', overflow: 'auto' }}>{ lien.url }</p>
                    </div>
                    <div style={{ height: '30px' }}></div>
                    <div className="centre">
                        <p>Ce lien possède une durée de validité de <span style={{ fontWeight: 'bold' }}>{ lien.temps_valide } heures</span>.</p>
                    </div>
                </div>
            }
        </div>
    );
}

function AjoutFictif ({ groupe, authentification, navigate, ajouter_participant }: { groupe: Groupe, authentification: AuthContextType | null, navigate: NavigateFunction, ajouter_participant: Function }) {
    const [nom_participant, set_nom_participant] = useState<string>("");
    const [chargement, set_chargement] = useState<boolean>(false);
    const [message_erreur, set_message_erreur] = useState<string>("");

    useEffect(() => {
        set_message_erreur("");
    }, [nom_participant]);

    const creer_participant_fictif = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom_participant === "") {
            set_message_erreur("Veuillez saisir un nom.");
            return;
        }

        const api_body = {
            groupe_id: groupe.pk_groupe_id,
            nom_participant: nom_participant
        }

        set_chargement(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/groupe/participant/creer", api_body, authentification, navigate, true);
        set_chargement(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            toast.success(reponse.data.message);
            ajouter_participant(ParticipantGroupe.from_JSON(reponse.data.data));
        }
    }

    return (
        <div>
            <p className="centre">Créer un participant fictif à votre groupe de dépense.</p>
            <div style={{ height: '30px' }}></div>
            <div className="centre">
                <TextInput label="Nom du participant" value={ nom_participant } longueur_max={30} onChange={(e: any) => set_nom_participant(e.target.value)} style={{ width: '500px' }} />
            </div>
            <div style={{ height: '30px' }}></div>
            <div className="centre">
                {
                    chargement ?
                    <button className="full-button centre-centre" onClick={() => {}}>
                        <LoaderSpinner />
                        <p className="inline-block">&nbsp;Création en cours</p>
                    </button> :
                    <button className="full-button" onClick={ creer_participant_fictif }>Créer le participant</button>
                }
            </div>
            {
                message_erreur ?
                <>
                    <div style={{ height: '30px' }}></div>
                    <p style={{ color: 'red', textAlign: 'center' }}>{ message_erreur }</p>
                </> : <></>
            }
        </div>
    );
}

export default InformationParticipant;