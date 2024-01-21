import { useEffect, useState } from "react";
import { Link, NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import LoaderCenter from "../../components/loader/loader_center.component";
import { AxiosError, AxiosResponse } from "axios";
import requete_api from "../../utils/requete_api.util";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";

function RealisationVerification () {
    const location = useLocation();

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();
  
    const search_params: URLSearchParams = new URLSearchParams(location.search);
    const email_param: string | null = search_params.get('email');
    const token_param: string | null = search_params.get('token');

    const [chargement_verification_compte, set_chargement_verification_compte] = useState<boolean>(true);
    const [etat_verification_compte, set_etat_verification_compte] = useState<boolean>(false);

    useEffect(() => {
        if (email_param !== null && token_param !== null)
            verification_compte();
    }, []);

    const verification_compte = async () => {
        set_chargement_verification_compte(true);
        const reponse: AxiosResponse | AxiosError | null = await requete_api('GET', "/utilisateur/verification_compte?email=" + email_param + "&token=" + token_param, null, authentification, navigate, true);
        set_chargement_verification_compte(false);

        if (reponse && 'data' in reponse) {
            set_etat_verification_compte(true);
        }
    }

    return (
        <>
        <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
        <div className="centre-centre">
            <div className="rectangle-blanc-ombre largeur800 auto-height">
                <div className="grid-20-auto-20">
                    <p>Vérification de compte</p>
                    {
                        email_param === null || token_param === null ? (
                            <div className="grid-2-auto">
                                <div className="centre">
                                    <img alt="Logo d'un personnage tenant une erreur" src="/images/error.png" style={{ height: '260px' }}/>
                                </div>
                                <div className="centre-centre">
                                    <p>Il semble que l'URL a été altérée. Veuillez vérifier le lien de vérification que vous avez reçu.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                            {
                                chargement_verification_compte ? (
                                    <>
                                        <LoaderCenter message="Vérification de votre compte en cours" />
                                        <div style={{ height: '260px' }}></div>
                                    </>
                                ) : (
                                    <>
                                    {
                                        etat_verification_compte ? (
                                            <div className="grid-2-auto">
                                                <div className="centre">
                                                    <img alt="Logo d'un groupe de personnages content" src="/images/happy.png" style={{ height: '260px' }}/>
                                                </div>
                                                <div className="centre-centre">
                                                    <p>Votre compte a bien été vérifié !</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="centre-centre">
                                                <div className="grid-2-auto">
                                                    <div className="centre">
                                                        <img alt="Logo d'un groupe perdu" src="/images/void.png" style={{ height: '260px' }}/>
                                                    </div>
                                                    <div className="centre-centre">
                                                        <p>Votre compte n'a pas pu être vérifié en raison d'un incident.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    </>
                                )
                            }
                            </>
                        )
                    }
                    <div>
                        <p className="inline-block">Vous souhaitez retourner à la page d'accueil ?&nbsp;</p>
                        <Link className="inline-block lien" to='/connexion'>page d'accueil</Link>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default RealisationVerification;