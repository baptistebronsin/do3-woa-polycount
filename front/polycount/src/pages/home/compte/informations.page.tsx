import { SyntheticEvent, useEffect, useState } from "react";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { UtilisateurComplet } from "../../../models/utilisateur_complet.model";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import LoaderCenter from "../../../components/loader/loader_center.component";
import TextInput from "../../../components/input/text_input.component";
import Selecteur from "../../../components/input/selecteur.component";
import moment from "moment";
import { moment_date_time_format } from "../../../utils/moment.util";
import { toast } from "sonner";

function Informations() {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [utilisateur, set_utilisateur] = useState<UtilisateurComplet | null>(null);

    const [prenom, set_prenom] = useState<string>("");
    const [nom, set_nom] = useState<string>("");
    const [genre, set_genre] = useState<string | null>(null);

    const [afficher_message_desactivation, set_afficher_message_desactivation] = useState<boolean>(false);

    const [chargement_utilisateur, set_chargement_utilisateur] = useState<boolean>(false);
    const [chargement_modification, set_chargement_modification] = useState<boolean>(false);
    const [chargement_desactivation, set_chargement_desactivation] = useState<boolean>(false);
    const [chargement_reactivation, set_chargement_reactivation] = useState<boolean>(false);

    useEffect(() => {
        recuperer_informations_utilisateur_api();
    }, []);

    useEffect(() => {
        if (utilisateur !== null) {
            set_nom(utilisateur.nom);
            set_prenom(utilisateur.prenom);
            set_genre(utilisateur.genre);
        }
    }, [utilisateur]);

    const recuperer_informations_utilisateur_api = async () => {
        set_chargement_utilisateur(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('GET', "/utilisateur/informations", null, authentification, navigate, true);
        set_chargement_utilisateur(false);

        if (reponse && 'data' in reponse) {
            set_utilisateur(UtilisateurComplet.from_JSON(reponse.data.data));
        }
    }

    const modifier_utilisateur_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (nom === "" || prenom === "") {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const api_body = {
            nom: nom,
            prenom: prenom,
            genre: genre === "null" ? null : genre,
        }

        set_chargement_modification(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PATCH', "/utilisateur/modifier_informations", api_body, authentification, navigate, true);
        set_chargement_modification(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Vos informations ont été modifiées avec succès.");

            const utilisateur_reponse: UtilisateurComplet = UtilisateurComplet.from_JSON(reponse.data.data);

            set_utilisateur(utilisateur_reponse);

            if (authentification)
                authentification.set_authentification({ token: authentification.authentification.token, utilisateur: { pk_utilisateur_id: utilisateur_reponse.pk_utilisateur_id, nom: utilisateur_reponse.nom, prenom: utilisateur_reponse.prenom, genre: utilisateur_reponse.genre, email: utilisateur_reponse.email }, mot_de_passe: authentification.authentification.mot_de_passe });
        }
    }

    const desactiver_utilisateur_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        set_chargement_desactivation(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/desactivation", null, authentification, navigate, true);
        set_chargement_desactivation(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Votre compte a bien été désactivé.");

            set_utilisateur(UtilisateurComplet.from_JSON(reponse.data.data));
            set_afficher_message_desactivation(false);
        }
    }

    const reactiver_utilisateur_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        set_chargement_reactivation(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/reactivation", null, authentification, navigate, true);
        set_chargement_reactivation(false);

        if (reponse && 'data' in reponse && 'data' in reponse.data) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Votre compte a bien été réactivé.");

            set_utilisateur(UtilisateurComplet.from_JSON(reponse.data.data));
        }
    }

    return (
        <div style={{ margin: '10px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1>Mes informations</h1>
                {
                    utilisateur !== null ? (
                        <>
                        {
                            chargement_modification ?
                            <button className="full-button centre-centre" onClick={() => {}}>
                                <LoaderSpinner />
                                <p className="inline-block">&nbsp;Modification en cours</p>
                            </button> :
                            <button className="full-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={ modifier_utilisateur_api }>
                                <FontAwesomeIcon icon={faFloppyDisk} />
                                Enregistrer
                            </button>
                        }
                        </>
                    ) : (<></>)
                }
            </div>
            {
                chargement_utilisateur ? (
                    <LoaderCenter message="Récupération de vos informations" />
                ) : (
                    <>
                    {
                        utilisateur === null ? (
                            <p className="centre-centre">Nous n'avons trouvé aucune information sur votre compte.</p>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Nom :</p>
                                    <TextInput value={ nom } longueur_max={50} valeur_defaut={ utilisateur.nom } placeholder="Votre nom" onChange={ (e: any) => set_nom(e.target.value) } style={{ width: '300px', fontSize: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Prénom :</p>
                                    <TextInput value={ prenom } longueur_max={50} valeur_defaut={ utilisateur.prenom } placeholder="Votre prénom" onChange={ (e: any) => set_prenom(e.target.value) } style={{ width: '300px', fontSize: '18px' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Genre :</p>
                                    <Selecteur label="" options={ [{ value: "M", label: "M" }, { value: "Mme", label: "Mme" }, { value: "Mlle", label: "Mlle" }, { value: "null", label: "Aucun" }] } valeur_defaut={ utilisateur.genre ?? "null" } changement={ set_genre } />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Email :</p>
                                    <p>{ utilisateur.email }</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Date de création :</p>
                                    <p>{ moment(utilisateur.cree_le).format(moment_date_time_format) }</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Date de validation :</p>
                                    <p>{ utilisateur.valide_le ? moment(utilisateur.valide_le).format(moment_date_time_format) : <span style={{ color: 'red' }}>Compte non validé</span> }</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <p style={{ color: 'grey' }}>Date de désactivation :</p>
                                    <p>{ utilisateur.desactive_le ? moment(utilisateur.desactive_le).format(moment_date_time_format) : "Aucune désactivation prévue" }</p>
                                </div>
                                
                                <div style={{ border: '2px solid red', borderRadius: '10px', padding: '10px', width: '60%', marginTop: '30px' }}>
                                    <h1 style={{ color: 'red' }}>Zone rouge</h1>
                                    {
                                        utilisateur.desactive_le ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                                <p>Réactiver mon compte :</p>
                                                {
                                                    chargement_reactivation ?
                                                    <button className="delete-button" onClick={() => {}}>
                                                        <LoaderSpinner />
                                                        <p className="inline-block">&nbsp;Réactivation en cours</p>
                                                    </button> :
                                                    <button className="delete-button" onClick={ reactiver_utilisateur_api }>Réactiver</button>
                                                }
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                                <p>Désactiver mon compte :</p>
                                                <button className="delete-button" onClick={ () => set_afficher_message_desactivation(true) }>Désactiver</button>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                    </>
                )
            }
            {
                afficher_message_desactivation ? (
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(128, 128, 128, 0.8)', zIndex: 9 }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '1200px', height: '270px', zIndex: 10, padding: "10px 20px", borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h1 style={{ color: 'red' }}>Désactivation du compte</h1>
                                <button className="lien" onClick={() => set_afficher_message_desactivation(false) }>Annuler</button>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <p>Êtes-vous sûr de vouloir désactiver votre compte ?</p>
                                <p>Vous aurez toujourd accès à votre compte Polycount mais celui-ci sera supprimé définitivement 30 jours après la date de désactivation.</p>
                                <div style={{ marginTop: '30px' }}>
                                {
                                    chargement_desactivation ?
                                    <button className="delete-button" onClick={() => {}}>
                                        <LoaderSpinner />
                                        <p className="inline-block">&nbsp;Désactivation en cours</p>
                                    </button> :
                                    <button className="delete-button" onClick={ desactiver_utilisateur_api }>Désactiver</button>
                                }
                                </div>
                            </div>
                        </div>
                    </div>
                ) : <></>
            }
        </div>
    );
}

export default Informations;