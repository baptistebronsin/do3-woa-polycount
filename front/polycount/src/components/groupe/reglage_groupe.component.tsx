import { NavigateFunction, useNavigate } from "react-router-dom";
import { Groupe } from "../../models/groupe.model";
import { ParticipantGroupe } from "../../models/participant_groupe.model";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { Utilisateur } from "../../models/utilisateur.model";
import TextInput from "../input/text_input.component";
import TextAreaInput from "../input/text_area_input.component";
import { moment_date_time_format } from "../../utils/moment.util";
import moment from "moment";
import { SyntheticEvent, useState } from "react";
import LoaderSpinner from "../loader/loader_spinner.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { toast } from "sonner";

function ReglageGroupe ({ groupe, participant_actuel, utilisateurs, modifier_groupe }: { groupe: Groupe, participant_actuel: ParticipantGroupe, utilisateurs: Utilisateur[], modifier_groupe: Function}) {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const utilisateur_createur: Utilisateur | undefined = utilisateurs.find((utilisateur: Utilisateur) => utilisateur.pk_utilisateur_id === groupe.fk_utilisateur_createur_id);
    const utilisateur_actuel: Utilisateur | undefined = utilisateurs.find((utilisateur: Utilisateur) => utilisateur.pk_utilisateur_id === participant_actuel.fk_utilisateur_id);
    const est_administrateur: boolean = utilisateur_actuel?.pk_utilisateur_id === groupe.fk_utilisateur_createur_id;

    const [nom, set_nom] = useState<string | null>(groupe.nom);
    const [description, set_description] = useState<string | null>(groupe.description);
    const [lien_image, set_lien_image] = useState<string | null>(groupe.lien_image);

    const [chargement_modification, set_chargement_modification] = useState<boolean>(false);
    const [chargement_cloture, set_chargement_cloture] = useState<boolean>(false);
    const [chargement_quitter, set_chargement_quitter] = useState<boolean>(false);

    const [afficher_message_cloture, set_afficher_message_cloture] = useState<boolean>(false);
    const [afficher_message_quitter, set_afficher_message_quitter] = useState<boolean>(false);

    const [message_erreur, set_message_erreur] = useState<string>("");

    const modifier_groupe_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom === "" || nom === null) {
            set_message_erreur("Veuillez saisir un nom pour le groupe");
            return ;
        }

        if (nom.length > 50) {
            set_message_erreur("Le nom du groupe ne peut pas dépasser 50 caractères");
            return ;
        }

        if (description !== null && description.length > 200) {
            set_message_erreur("La description du groupe ne peut pas dépasser 200 caractères");
            return ;
        }

        const api_body = {
            groupe_id: groupe.pk_groupe_id,
            nom: nom,
            description: description === "" ? null : description,
            lien_image: lien_image === "" ? null : lien_image
        }

        set_chargement_modification(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PATCH', "/groupe/", api_body, authentification, navigate, true);
        set_chargement_modification(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("La groupe a bien été modifié.");

            modifier_groupe(Groupe.from_JSON(reponse.data.data));
        }
    }

    const cloturer_groupe_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        set_chargement_cloture(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('DELETE', "/groupe/" + groupe.pk_groupe_id, null, authentification, navigate, true);
        set_chargement_cloture(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("La groupe a bien été cloturé.");

            modifier_groupe(Groupe.from_JSON(reponse.data.data));
            set_afficher_message_cloture(false);
        }
    }

    const quitter_groupe_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        set_chargement_quitter(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('DELETE', "/groupe/" + groupe.pk_groupe_id + "/participant", null, authentification, navigate, true);
        set_chargement_quitter(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Vous avez bien quitté le groupe partagé.");

            set_afficher_message_quitter(false);

            navigate("/groupes");
        }
    }

    return (
        <>
            {
                utilisateur_actuel === undefined ?
                <div className="centre-centre">
                    <p>Vous n'êtes pas membre de ce groupe</p>
                    <button onClick={() => navigate("/groupes")}>Retourner à la page principale</button>
                </div> : (
                    <div style={{ margin: '10px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h1>Réglages du groupe</h1>
                            {
                                est_administrateur && groupe.cloture_le === null ? (
                                    <>
                                        {
                                            chargement_modification ?
                                            <button className="full-button centre-centre" onClick={() => {}}>
                                                <LoaderSpinner />
                                                <p className="inline-block">&nbsp;Modification en cours</p>
                                            </button> :
                                            <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={ modifier_groupe_api }>
                                                <FontAwesomeIcon icon={faFloppyDisk} />
                                                Enregistrer
                                            </button>
                                        }
                                    </>
                                ) : <></>
                            }
                        </div>
                        <div style={{ margin: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Nom du groupe :</p>
                                {
                                    est_administrateur ?
                                    <TextInput value={ nom ?? "" } placeholder="Nom du groupe" longueur_max={50} onChange={(e: any) => set_nom(e.target.value)} style={{ width: '300px' }} /> :
                                    <p>{ groupe.nom }</p>
                                }
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Description du groupe :</p>
                                {
                                    est_administrateur ?
                                    <TextAreaInput value={ description ?? "" } longueur_max={200} placeholder="Description du groupe" onChange={(e: any) => set_description(e.target.value)} style={{ width: '500px' }} /> :
                                    <p>{ groupe.description !== null && groupe.description !== "" ? groupe.description : "Aucune description" }</p>
                                }
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Groupe créé par :</p>
                                <p>{ utilisateur_createur ? (utilisateur_createur.genre ? (utilisateur_createur.genre + ". " + utilisateur_createur.prenom + " " + utilisateur_createur.nom.toUpperCase()) : (utilisateur_createur.prenom + " " + utilisateur_createur.nom.toUpperCase())) : "utilisateur inconnu" }</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <p>Date de création :</p>
                                <p>{ moment(groupe.cree_le).format(moment_date_time_format) }</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                {
                                    groupe.lien_image ?
                                    <img src={ groupe.lien_image } alt={`groupe partagé numéro ${groupe.pk_groupe_id}`} className="img-80" /> :
                                    <div style={{ background: 'linear-gradient(135deg, #4B7BB4, #225292)', height: '80px', width: '80px', borderRadius: '6px' }}></div>
                                }
                                {
                                    est_administrateur ?
                                    <TextInput value={ lien_image ?? "" } onChange={(e: any) => set_lien_image(e.target.value)} placeholder="https://..." style={{ width: '300px' }} /> : <></>
                                }
                            </div>
                            {
                                groupe.cloture_le ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                        <p>Date de clôture :</p>
                                        <p>{ moment(groupe.cloture_le).format(moment_date_time_format) }</p>
                                    </div>
                                ) : (<></>)
                            }
                        </div>
                        <div style={{ border: '2px solid red', borderRadius: '10px', padding: '10px', width: '60%', marginTop: '30px' }}>
                            <h1 style={{ color: 'red' }}>Zone rouge</h1>
                            <p>Toute action dans cette zone est irréversible.</p>
                            {
                                groupe.cloture_le ? (
                                    <div style={{ marginTop: '20px', color: 'red' }}>
                                        <p>Le groupe a été cloturé, vous ne pouvez plus faire aucun action dessus.</p>
                                    </div>
                                ) : (
                                    <>
                                    {
                                        est_administrateur ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                                <p>Clôturer le groupe :</p>
                                                <button className="delete-button" onClick={ () => set_afficher_message_cloture(true) }>Clôturer</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                                <p>Quitter le groupe :</p>
                                                <button className="delete-button" onClick={ () => set_afficher_message_quitter(true) }>Quitter</button>
                                            </div>
                                        )
                                    }
                                    </>
                                )
                            }
                            
                        </div>
                        {
                            afficher_message_cloture || afficher_message_quitter ? (
                                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(128, 128, 128, 0.8)', zIndex: 9 }}>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: '270px', zIndex: 10, padding: "10px 20px", borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h1 style={{ color: 'red' }}>{ afficher_message_cloture ? "Clôture du groupe" : "Quitter le groupe" }</h1>
                                            <button className="lien" onClick={() => { set_afficher_message_cloture(false); set_afficher_message_quitter(false); }}>Annuler</button>
                                        </div>
                                        {
                                            afficher_message_cloture ? (
                                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                                    <p>Êtes-vous sûr de vouloir clôturer le groupe ?</p>
                                                    <p>Cette action est irréversible et toutes vos données seront supprimées définivement 7 jours plus tard.</p>
                                                    <div style={{ marginTop: '30px' }}>
                                                    {
                                                        chargement_cloture ?
                                                        <button className="delete-button" onClick={() => {}}>
                                                            <LoaderSpinner />
                                                            <p className="inline-block">&nbsp;Clôture en cours</p>
                                                        </button> :
                                                        <button className="delete-button" onClick={ cloturer_groupe_api }>Clôturer</button>
                                                    }
                                                    </div>
                                                </div>
                                            ) : (<></>)
                                        }
                                        {
                                            afficher_message_quitter ? (
                                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                                    <p>Êtes-vous sûr de vouloir quitter le groupe ?</p>
                                                    <p>Vous ne pourrez plus revenir dans le groupe mais vos dépenses persisteront.</p>
                                                    <div style={{ marginTop: '30px' }}>
                                                    {
                                                        chargement_quitter ?
                                                        <button className="delete-button" onClick={() => {}}>
                                                            <LoaderSpinner />
                                                            <p className="inline-block">&nbsp;Requête en cours</p>
                                                        </button> :
                                                        <button className="delete-button" onClick={ quitter_groupe_api }>Quitter</button>
                                                    }
                                                    </div>
                                                </div>
                                            ) : <></>
                                        }
                                    </div>
                                </div>
                            ) : <></>
                        }
                    </div>
                )
            }
        </>
    );
}

export default ReglageGroupe;