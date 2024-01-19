import moment from "moment";
import { Groupe } from "../../models/groupe.model";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { Utilisateur } from "../../models/utilisateur.model";
import { NomParticipant } from "../../pages/home/groupes/informations_groupe.page";
import { moment_date_format } from "../../utils/moment.util";
import { SyntheticEvent, useEffect, useState } from "react";
import SelecteurDynamique from "../input/selecteur_dynamique.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../input/text_input.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoaderSpinner from "../loader/loader_spinner.component";

function InformationParticipant ({ groupe, participants, utilisateurs, nom_participants, participant_actuel, ajouter_participant, ajouter_utilisateur }: { groupe: Groupe, participants: ParticipantGroupe[], utilisateurs: Utilisateur[], nom_participants: NomParticipant[], participant_actuel: ParticipantGroupe, ajouter_participant: Function, ajouter_utilisateur: Function }) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [ajouter_participant_action, set_ajouter_participant_action] = useState<boolean>(false);

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
            <div>
                {
                    participants.map((participant: ParticipantGroupe, index: number) => {
                        const nom_participant: NomParticipant | undefined = nom_participants.find((nom_participant: NomParticipant) => nom_participant.pk_participant_id === participant.pk_participant_groupe_id);
                        const utilisateur: Utilisateur | undefined = utilisateurs.find((utilisateur: Utilisateur) => utilisateur.pk_utilisateur_id === participant.fk_utilisateur_id);

                        const statut: string = groupe.fk_utilisateur_createur_id === utilisateur?.pk_utilisateur_id ? "Administrateur" : utilisateurs.find((u: Utilisateur) => u.pk_utilisateur_id === participant.fk_utilisateur_id) ? "Participant" : "Participant fictif";

                        return (
                        <div key={ index } className="centre" style={{ margin: '20px 0' }}>
                            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', border: '2px solid grey', width: '500px' }} className="hover">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p>{ nom_participant ? nom_participant.nom : "Casper" } <span style={{ color: 'grey' }}>{ nom_participant?.pk_participant_id === participant_actuel.pk_participant_groupe_id ? "(Vous)" : "" }</span></p>
                                    <p style={{ color: statut === 'Administrateur' ? '#BA15C7' : statut === "Participant" ? '#35C715' : '#4B7BB4' }}>{ statut }</p>
                                </div>
                                {
                                    participant.fk_utilisateur_id === null ?
                                    <></> :
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
                    })
                }
                <div style={{ height: '50px' }}></div>
            </div>
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
                            <Ajout_Email groupe={ groupe } authentification={ authentification } navigate={ navigate } ajouter_participant={ ajouter_participant } ajouter_utilisateur={ ajouter_utilisateur } />:
                            type_ajout === 2 ?
                            <Ajout_Lien groupe={ groupe } authentification={ authentification } navigate={ navigate } />:
                            <Ajout_Fictif />
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

function Ajout_Email ({ groupe, authentification, navigate, ajouter_participant, ajouter_utilisateur }: { groupe: Groupe, authentification: AuthContextType | null, navigate: NavigateFunction, ajouter_participant: Function, ajouter_utilisateur: Function }) {
    const [email, set_email] = useState<string>("");
    const [chargement, set_chargement] = useState<boolean>(false);
    const [message_erreur, set_message_erreur] = useState<string>("");

    useEffect(() => {
        set_message_erreur("");
    }, [email]);

    const envoyer_invitation_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "") {
            set_chargement(false);
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
            <p className="centre">Envoyer une invitation par mail à un participant existant dans la base de données Polycount.</p>
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

function Ajout_Lien ({ groupe, authentification, navigate }: { groupe: Groupe, authentification: AuthContextType | null, navigate: NavigateFunction }) {
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

function Ajout_Fictif () {

    return (
        <div>
            <p className="centre">Créer un participant fictif à votre groupe de dépense.</p>
        </div>
    );
}

export default InformationParticipant;