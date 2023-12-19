import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { Suspension } from "../../models/suspension.model";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { SyntheticEvent } from "react";
import deconnexion from "../../utils/deconnexion.util";

function SuspensionPage () {
    const location = useLocation();
    const { suspension }: { suspension: Suspension } = location.state;

    const navigate: NavigateFunction = useNavigate();
    const authentification: AuthContextType | null = useAuth();

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
                                <p>{ suspension.message_utilisateur }</p>
                                <div style={{ height: '30px' }}></div>
                                <hr />
                                <div style={{ height: '30px' }}></div>
                                <p>Date de début : { suspension.date_debut.toLocaleString('fr-FR', options) }</p>
                                <p>Date de fin : { suspension.date_fin ? suspension.date_fin.toLocaleString('fr-FR', options) : "Non définie" }</p>
                            </div>
                        </div>
                        <div>
                            <p className="inline-block">Vous souhaitez revenir en arrière ?&nbsp;</p>
                            <p className="inline-block lien" onClick={(e: SyntheticEvent) => deconnexion(e, authentification, navigate)}>connectez-vous</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SuspensionPage;