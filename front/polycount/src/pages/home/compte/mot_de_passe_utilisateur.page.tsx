import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { SyntheticEvent, useEffect, useState } from "react";
import TextInput from "../../../components/input/text_input.component";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { toast } from "sonner";

function MotDePasseUtilisateur () {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [mot_de_passe_1, set_mot_de_passe_1] = useState<string>("");
    const [mot_de_passe_2, set_mot_de_passe_2] = useState<string>("");
    const [message_erreur, set_message_erreur] = useState<string>("");

    const [chargement_changement_mot_de_passe, set_chargement_changement_mot_de_passe] = useState<boolean>(false);

    useEffect(() => {
        set_message_erreur("");
    }, [mot_de_passe_1, mot_de_passe_2]);

    const erreur_mot_de_passe = (): string | null => {
        if(mot_de_passe_1.length < 10)
            return "Veuillez utiliser un mot de passe d'au moins 10 caractères.";
        if (!/[&#@$*+\-!]/.test(mot_de_passe_1))
            return "Veuillez utiliser un mot de passe contenant au moins un caractère spécial.";
        if (!/[A-Z]/.test(mot_de_passe_1))
            return "Veuillez utiliser un mot de passe contenant au moins une majuscule.";
        if (!/[0-9]/.test(mot_de_passe_1))
            return "Veuillez utiliser un mot de passe contenant au moins un chiffre.";

        return null;
    }

    const changer_mot_de_passe_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (mot_de_passe_1 === "" || mot_de_passe_2 === "") {
            set_message_erreur("Veuillez saisir tous les champs.");
            return;
        }

        const erreur_mdp: string | null = erreur_mot_de_passe();
        if (erreur_mdp !== null) {
            set_message_erreur(erreur_mdp);
            return null;
        }

        if (mot_de_passe_1 !== mot_de_passe_2) {
            set_message_erreur("Veuillez saisir les mêmes mots de passe.");
            return null;
        }

        const api_body = {
            mot_de_passe: mot_de_passe_1
        }

        set_chargement_changement_mot_de_passe(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PATCH', "/utilisateur/modifier_mot_de_passe", api_body, authentification, navigate, true);
        set_chargement_changement_mot_de_passe(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Votre mot de passe a bien été changé.");

            if (authentification && authentification.authentification.utilisateur)
                authentification.set_authentification({ utilisateur: authentification.authentification.utilisateur, token: authentification.authentification.token, mot_de_passe: mot_de_passe_1 });
        }
    }

    return (
        <div style={{ margin: '10px 20px' }}>
            <h1>Changer mon mot de passe</h1>
            {
                authentification && authentification.authentification.utilisateur ? (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '500px', display: 'inline-block', marginTop: '20px' }}>
                            <TextInput type='password' label="Mot de passe" value={ mot_de_passe_1 } valeur_defaut={ "" } placeholder="Votre nouveau mot de passe" onChange={ (e: any) => set_mot_de_passe_1(e.target.value) } style={{ fontSize: '18px' }} />
                            <div style={{ marginTop: '20px' }}></div>
                            <TextInput type='password' label="Mot de passe*" value={ mot_de_passe_2 } valeur_defaut={ "" } placeholder="Vérifiez votre nouveau mot de passe" onChange={ (e: any) => set_mot_de_passe_2(e.target.value) } style={{ fontSize: '18px' }} />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            {
                                chargement_changement_mot_de_passe ?
                                <button className="full-button" onClick={() => {}}>
                                    <LoaderSpinner />
                                    <p className="inline-block">&nbsp;Changement en cours</p>
                                </button> :
                                <button className="full-button" onClick={ changer_mot_de_passe_api }>Changer votre mot de passe</button>
                            }
                        </div>
                        <div style={{ height: '20px' }}></div>
                        <p style={{ color: 'red' }}>{ message_erreur }</p>
                    </div>
                ) : (
                    <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>Vous n'êtes pas connecté.</p>
                )
            }
        </div>
    )
}

export default MotDePasseUtilisateur;