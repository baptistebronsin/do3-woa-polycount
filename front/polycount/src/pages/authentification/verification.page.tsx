import { Link, NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import LoaderSpinner from "../../components/loader/loader_spinner.component";
import { useEffect, useState } from "react";
import TextInput from "../../components/input/text_input.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { toast } from "sonner";
import { UtilisateurComplet } from "../../models/utilisateur_complet.model";

function Verification () {
    const authentification: AuthContextType | null = useAuth();

    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const { email, mot_de_passe, depuis }: { email: string, mot_de_passe: string, depuis: 'CONNEXION' | 'INSCRIPTION' } = location.state || {};

    const [change_email, set_changer_email] = useState<boolean>(false);

    const [email_enregistre, set_email_enregistre] = useState<string>(email);
    const [email_input, set_email] = useState<string>(email);
    const [erreur_page, set_erreur_page] = useState<string | null>(null);

    const [chargement_changement_email, set_chargement_changement_email] = useState<boolean>(false);
    const [chargement_envoi_mail, set_chargement_envoi_mail] = useState<boolean>(false);

    useEffect(() => {
        set_erreur_page(null);
    }, [email_input]);

    useEffect(() => {
        connexion_api();
    }, []);

    const connexion_api = async () => {
        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email_regex.test(email))
            return null;

        const api_body: any = {
            email: email,
            mot_de_passe: mot_de_passe
        };

        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/utilisateur/connexion", api_body, null, navigate, false);

        if (reponse && 'data' in reponse) {
            localStorage.removeItem('token');
            localStorage.removeItem('utilisateur');
            localStorage.removeItem('mot_de_passe');

            localStorage.setItem('utilisateur', JSON.stringify(reponse.data.data));
            localStorage.setItem('mot_de_passe', mot_de_passe);

            if (!authentification) {
                toast.error("Une erreur est survenue lors de l'utilisateur du provider.");
                return null;
            }

            authentification.set_authentification({ token: reponse.data.token, utilisateur: UtilisateurComplet.from_JSON(reponse.data.data), mot_de_passe: mot_de_passe });

            if (reponse.data.token) {
                localStorage.setItem('token', reponse.data.token);

                if (localStorage.getItem('utilisateur') && localStorage.getItem('token'))
                    navigate('/home/groupes');
                else
                    toast.error("Une erreur est survenue lors de l'enregistrement des données de sessions.");
            }
        }
    }

    const envoyer_mail_verification = async (e: any) => {
        e.preventDefault();

        if (email_enregistre === "") {
            set_erreur_page("Veuillez saisir une adresse email.");
            return null;
        }

        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email_regex.test(email_enregistre)) {
            set_erreur_page("Veuillez saisir une adresse email valide.");
            return null;
        }

        const api_body: any = {
            email: email_enregistre
        };

        set_chargement_envoi_mail(true);

        const reponse: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/verification_compte/renouveller", api_body, null, navigate, true);
        
        set_chargement_envoi_mail(false);

        if (reponse && 'data' in reponse)
            toast.success(reponse.data.message);
    }

    const changement_email_api = async (e: any) => {
        e.preventDefault();

        if (email_input === "") {
            set_erreur_page("Veuillez saisir une adresse email.");
            return null;
        }

        const email_regex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email_regex.test(email_input)) {
            set_erreur_page("Veuillez saisir une adresse email valide.");
            return null;
        }

        if (email_input === email) {
            set_erreur_page("Veuillez saisir une adresse email différente de la précédente.");
            return null;
        }

        if (!authentification || !authentification.authentification.utilisateur) {
            toast.error("Vous ne pouvez pas changer votre email maintenant.");
            return null;
        }

        const api_body1: any = {
            utilisateur_id: authentification.authentification.utilisateur.pk_utilisateur_id,
            email: email_input
        };

        set_chargement_changement_email(true);

        const reponse1: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/modifier_email_non_verifie", api_body1, null, navigate, true);

        if (!reponse1 || !('data' in reponse1)) {
            set_chargement_changement_email(false);
            return null;
        }

        set_email_enregistre(email_input);
        toast.success(reponse1.data.message);

        const api_body2: any = {
            email: email_enregistre
        };

        const reponse2: AxiosResponse | AxiosError | null = await requete_api('PUT', "/utilisateur/verification_compte/renouveller", api_body2, null, navigate, true);
        
        set_chargement_changement_email(false);

        if (reponse2 && 'data' in reponse2) {
            toast.success(reponse2.data.message);
            set_changer_email(false);
        }
    }
    
    return (
        <>
            <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
            <div className="centre-centre">
                <div className="rectangle-blanc-ombre largeur800 auto-height">
                    <div className="grid-20-auto-20">
                        <p>Vérification de votre compte</p>
                        {
                            change_email ?
                            <div className="centre">
                                <div style={{ width: '50%' }}>
                                    <form>
                                        <TextInput label="Email" type="email" placeholder="Votre email" value={email_input} onChange={(e: any) => set_email(e.target.value)} required />
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
                                                chargement_changement_email ?
                                                <button className="full-button centre-centre" onClick={() => {}}>
                                                    <LoaderSpinner />
                                                    <p className="inline-block">&nbsp;Changement en cours</p>
                                                </button> :
                                                <button className="full-button" onClick={changement_email_api}>Changer l'adresse email</button>
                                            }
                                        </div>
                                        <div style={{ height: '10px' }}></div>
                                        <div className="centre">
                                            <button className="light-button" onClick={() => { set_changer_email(false) }}>Annuler</button>
                                        </div>
                                    </form>
                                </div>
                            </div> :
                            <div className="grid-2-auto">
                                <div className="centre">
                                    <img alt="Logo d'un personnage regardant ses mails" src="/images/mail.png" style={{ height: '260px' }}/>
                                </div>
                                <div>
                                    <p>
                                        {
                                            depuis === 'CONNEXION' ?
                                            <>
                                            Lors de votre inscription, un mail de bienvenue contenant un lien de vérification de compte vous a été envoyé.
                                            </> :
                                            <>
                                            Bienvenue sur Polycount, un mail de bienvenue contenant un lien de vérification de compte vous a été envoyé.
                                            </>
                                        }
                                    </p>
                                    <p style={{ color: '#8A8A8A' }}>PS : Il se peut que le mail se soit perdu dans vos spam...</p>
                                    <div style={{ height: '20px' }}></div>
                                    <div className="centre">
                                        <button className="light-button" onClick={() => { set_changer_email(true) }}>Modifier l'email</button>
                                    </div>
                                    <div style={{ height: '10px' }}></div>
                                    <div className="centre">
                                        {
                                            chargement_envoi_mail ?
                                            <button className="full-button centre-centre" onClick={() => {}}>
                                                <LoaderSpinner />
                                                <p className="inline-block">&nbsp;Envoi en cours</p>
                                            </button> :
                                            <button className="full-button" onClick={envoyer_mail_verification}>Envoyer un autre mail</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        }
                        <div>
                            <p className="inline-block">Vous êtes perdu ?&nbsp;</p>
                            <Link className="inline-block lien" to='/connexion'>revenez à la page d'authentification</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Verification;