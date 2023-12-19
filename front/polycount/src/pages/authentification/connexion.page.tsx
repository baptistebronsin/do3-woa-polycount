import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import TextInput from "../../components/input/text_input.component";
import { SyntheticEvent, useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import LoaderSpinner from "../../components/loader/loader_spinner.component";
import { toast } from "sonner";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { Utilisateur } from "../../models/utilisateur.model";

function Connexion() {
    const [email, set_email] = useState<string>("");
    const [mot_de_passe, set_mot_de_passe] = useState<string>("");

    const [erreur_page, set_erreur_page] = useState<string | null>(null);

    const [chargement, set_chargement] = useState<boolean>(false);

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    useEffect(() => {
        if (authentification?.authentification.token)
            navigate('/home/groupes');
    }, [authentification?.authentification]);

    useEffect(() => {
        set_erreur_page(null);
    }, [email, mot_de_passe]);

    const connexion_api = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (email === "" || mot_de_passe === "") {
            set_erreur_page("Veuillez remplir tous les champs.");
            return null;
        }

        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email_regex.test(email)) {
            set_erreur_page("Veuillez saisir une adresse email valide.");
            return null;
        }

        const api_body: any = {
            email: email,
            mot_de_passe: mot_de_passe
        };

        set_chargement(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/utilisateur/connexion", api_body, navigate, true);

        set_chargement(false);

        if (reponse && 'data' in reponse) {
            localStorage.removeItem('token');
            localStorage.removeItem('utilisateur');

            localStorage.setItem('utilisateur', JSON.stringify(reponse.data.data));

            if (!authentification) {
                toast.error("Une erreur est survenue lors de l'utilisateur du provider.");
                return null;
            }

            authentification.set_authentification({ token: reponse.data.token, utilisateur: Utilisateur.from_JSON(reponse.data.data) });

            if (reponse.data.token) {
                localStorage.setItem('token', reponse.data.token);

                if (localStorage.getItem('utilisateur') && localStorage.getItem('token'))
                    navigate('/home/groupes');
                else
                    toast.error("Une erreur est survenue lors de l'enregistrement des données de sessions.");
            } else 
                navigate('/verification-compte', { state: { email: email, mot_de_passe: mot_de_passe, depuis: 'CONNEXION' } });
        }
    }

    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        <p>Connexion</p>
                        <div className="grid-2-auto">
                            <div className="centre">
                                <img alt="Logo d'un personnage tenant une carte bancaire" src="/images/connexion.png" style={{ height: '260px' }}/>
                            </div>
                            <div>
                                <form>
                                    <TextInput label="Email" type="email" placeholder="Votre email" value={email} onChange={(e: any) => set_email(e.target.value)} required />
                                    <div style={{ height: '30px' }}></div>
                                    <TextInput label="Mot de passe" type="password" placeholder="Votre mot de passe" value={mot_de_passe} onChange={(e: any) => set_mot_de_passe(e.target.value)} required />
                                    <Link className="inline-block lien" to='/mot-de-passe-oublie' style={{ fontSize: '16px' }}>Mot de passe oublié ?</Link>
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
                                                <p className="inline-block">&nbsp;Connection en cours</p>
                                            </button> :
                                            <button className="full-button" onClick={connexion_api}>Me connecter</button>
                                        }
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div>
                            <p className="inline-block">Vous ne possédez pas encore de compte ?&nbsp;</p>
                            <Link className="inline-block lien" to='/inscription'>inscrivez-vous</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Connexion;