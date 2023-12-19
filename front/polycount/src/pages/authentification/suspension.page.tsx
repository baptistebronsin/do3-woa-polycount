import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { Suspension } from "../../models/suspension.model";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { SyntheticEvent, useEffect } from "react";
import deconnexion from "../../utils/deconnexion.util";

function SuspensionPage () {
    const location = useLocation();
    const suspension : { suspension: Suspension } | null = location.state;

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

    useEffect(() => {
        navigate('/connexion');
    }, [suspension]);

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    return (
        <>
            {
                suspension ?
                <>
                    <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ position: 'absolute', height: '60px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
                    <div className="centre-centre">
                        <div className="rectangle-blanc-ombre largeur800 auto-height">
                            <div className="grid-20-auto-20">
                                <p>Votre compte a été suspendu</p>
                                <div className="grid-2-auto">
                                    <div className="centre">
                                        <img alt="Logo d'un personnage à côté d'un warning" src="/images/warning.png" style={{ height: '260px' }}/>
                                    </div>
                                    <div>
                                        <p style={{ color: '#787878' }}>Motif de votre suspension :</p>
                                        <p>{ suspension.suspension.message_utilisateur ?? "Aucun motif n'a été définit. " }</p>
                                        <div style={{ height: '30px' }}></div>
                                        <hr />
                                        <div style={{ height: '30px' }}></div>
                                        <p style={{ color: '#787878' }} className="inline-block">Date de début :&nbsp;</p><p className="inline-block">{ suspension.suspension.date_debut.toLocaleString('fr-FR', options) }</p>
                                        <p style={{ color: '#787878' }} className="inline-block">Date de fin :&nbsp;</p><p className="inline-block">{ suspension.suspension.date_fin ? suspension.suspension.date_fin.toLocaleString('fr-FR', options) : "Non définie" }</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="inline-block">Vous souhaitez revenir en arrière ?&nbsp;</p>
                                    <p className="inline-block lien" onClick={(e: SyntheticEvent) => deconnexion(e, authentification, navigate)}>authentifiez-vous</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </> :
                <p>Redirection en cours...</p>
            }
        </>
    );
}

export default SuspensionPage;