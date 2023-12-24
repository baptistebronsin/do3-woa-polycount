import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../providers/authentification.provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import { SyntheticEvent, useState } from "react";
import deconnexion from "../utils/deconnexion.util";

function Navigation() {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [afficher_compte, set_afficher_compte] = useState<boolean>(false);

    const options_compte: {label: string, redirection: string}[] = [
        {
            label: "Changer mes informations",
            redirection: "/home/compte/informations"
        },
        {
            label: "Changer mon email",
            redirection: "/home/compte/email"
        },
        {
            label: "Changer mon mot de passe",
            redirection: "/home/compte/mot-de-passe"
        }
    ];

    return (
        <>
            <nav>
                <img onClick={() => navigate('/home/groupes')} alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ height: '50px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
                <div>
                    <p onMouseEnter={() => set_afficher_compte(true)} onMouseLeave={() => set_afficher_compte(false)}>{ authentification?.authentification.utilisateur?.prenom } { authentification?.authentification.utilisateur?.nom.toUpperCase() }&nbsp;<FontAwesomeIcon icon={faUser} style={{color: "#4b7bb4"}} /></p>
                </div>
            </nav>
            {
                afficher_compte ?
                <div style={{ position: 'absolute', top: '40px', right: '10px', zIndex: 8 }} onMouseEnter={() => set_afficher_compte(true)} onMouseLeave={() => set_afficher_compte(false)}>
                    <div style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '6px' }}>
                        <p>Mon compte</p>
                        <hr style={{ margin: '10px 0' }} />
                        <ul>
                            {
                                options_compte.map((option) => (
                                    <li><Link to={option.redirection}>{option.label}</Link></li>
                                ))
                            }
                        </ul>
                        <hr style={{ margin: '10px 0' }} />
                        <p onClick={(e: SyntheticEvent) => deconnexion(e, authentification, navigate)} className="centre-centre lien">Me déconnecter&nbsp;<FontAwesomeIcon icon={faArrowRightFromBracket}/></p>
                    </div>
                </div> : <></>
            }
        </>
    );
}

export default Navigation;