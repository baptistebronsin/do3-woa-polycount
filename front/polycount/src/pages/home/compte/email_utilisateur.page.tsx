import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../../../providers/authentification.provider";
import { SyntheticEvent, useEffect, useState } from "react";
import TextInput from "../../../components/input/text_input.component";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import { toast } from "sonner";
import deconnexion from "../../../utils/deconnexion.util";

function EmailUtilisateur () {
    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    const [email, set_email] = useState<string>("");
    const [message_erreur, set_message_erreur] = useState<string>("");

    const [chargement_changement_email, set_chargement_changement_email] = useState<boolean>(false);

    useEffect(() => {
        set_message_erreur("");
    }, [email]);

    const changer_email = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "") {
            set_message_erreur("Veuillez saisir une adresse email.");
            return;
        }

        const api_body = {
            email: email
        }

        set_chargement_changement_email(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/modifier_email", api_body, authentification, navigate, true);
        set_chargement_changement_email(false);

        if (reponse && 'data' in reponse) {
            if ('message' in reponse.data)
                toast.success(reponse.data.message);
            else
                toast.success("Votre adresse email a bien été changée.");

            deconnexion(e, authentification, navigate);
        }
    }

    return (
        <div style={{ margin: '10px 20px' }}>
            <h1>Changer mon adresse email</h1>
            {
                authentification && authentification.authentification.utilisateur ? (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <p>Si vous changez votre adresse email, vous serez déconnecté et vous devrez refaire vérifier votre compte Polycount.</p>
                        <div style={{ width: '500px', display: 'inline-block', marginTop: '20px' }}>
                            <TextInput value={ email } longueur_max={250} valeur_defaut={ "" } placeholder="Votre nouvelle adresse email" onChange={ (e: any) => set_email(e.target.value) } style={{ fontSize: '18px' }} />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            {
                                chargement_changement_email ?
                                <button className="full-button" onClick={() => {}}>
                                    <LoaderSpinner />
                                    <p className="inline-block">&nbsp;Changement en cours</p>
                                </button> :
                                <button className="full-button" onClick={ changer_email }>Changer mon adresse email</button>
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
    );
}

export default EmailUtilisateur;