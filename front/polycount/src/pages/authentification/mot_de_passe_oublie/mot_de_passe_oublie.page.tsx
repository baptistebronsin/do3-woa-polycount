import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import TextInput from "../../../components/input/text_input.component";
import { SyntheticEvent, useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../../utils/requete_api.util";
import LoaderSpinner from "../../../components/loader/loader_spinner.component";

function MotDePasseOublie ({ set_operation_reussie }: { set_operation_reussie: Function }) {
    const [email, set_email] = useState<string>("");

    const [erreur_page, set_erreur_page] = useState<string | null>(null);

    const [chargement, set_chargement] = useState<boolean>(false);

    const navigate: NavigateFunction = useNavigate();

    useEffect(() => {
        set_erreur_page(null);
    }, [email]);

    const mot_de_passe_oublie_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "") {
            set_erreur_page("Veuillez remplir le champ.");
            return null;
        }

        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email_regex.test(email)) {
            set_erreur_page("Veuillez saisir une adresse email valide.");
            return null;
        }

        const api_body: any = {
            email: email
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/mot_de_passe_oublie", api_body, null, navigate, true);

        set_chargement(false);

        if (reponse) {
            set_operation_reussie(true);
        }
    }

    return (
        <>
            <div className="grid-2-auto">
                <div className="centre">
                    <img alt="Logo d'un personnage ne se souvenant pas de son mot de passe" src="/images/password.png" style={{ height: '260px' }}/>
                </div>
                <div>
                    <form>
                        <p>
                            Veuillez indiquer l'email que vous avez renseigné lors de votre inscription.
                        </p>
                        <div style={{ height: '30px' }}></div>
                        <TextInput label="Email" type="text" placeholder="Votre email" value={email} onChange={(e: any) => set_email(e.target.value)} required />
                        {
                            erreur_page ?
                            <>
                                <div style={{ height: '10px' }}></div>
                                <div className="centre" style={{ marginBottom: '10px' }}>
                                    <span style={{ color: 'red' }}>{ erreur_page }</span>
                                    <div style={{ height: '10px' }}></div>
                                </div>
                            </> :
                            <div style={{ height: '30px' }}></div>
                        }
                        
                        <div className="centre">
                            {
                                chargement ?
                                <button className="full-button centre-centre" onClick={() => {}}>
                                    <LoaderSpinner />
                                    <p className="inline-block">&nbsp;Réinitialisation en cours</p>
                                </button> :
                                <button className="full-button" onClick={mot_de_passe_oublie_api} >Réinitialiser</button>
                            }
                        </div>
                    </form>
                </div>
            </div>
            <div>
                <p className="inline-block">Vous êtes perdu ?&nbsp;</p>
                <Link className="inline-block lien" to='/connexion'>revenez à la page de connexion</Link>
            </div>
        </>
    );
}

export default MotDePasseOublie;