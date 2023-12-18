import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContextType, useAuth } from "../providers/authentification.provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { SyntheticEvent, useState } from "react";

function Navigation() {
    const authentification: AuthContextType | null = useAuth();
    const navigate: NavigateFunction = useNavigate();

    const [afficher_compte, set_afficher_compte] = useState<boolean>(false);

    const deconnexion = async (e: SyntheticEvent) => {
        e.preventDefault();

        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        authentification?.set_authentification({ token: null, utilisateur: null });

        navigate('/connexion');
    }

    return (
        <>
            <nav>
                <img alt="Logo Polycount" src="https://polytech.baptistebronsin.be/polycount/logo_polycount.png" style={{ height: '50px', borderRadius: '6px', margin: '10px', marginBottom: '0' }}/>
                <div>
                    <p onMouseEnter={() => set_afficher_compte(true)} onMouseLeave={() => set_afficher_compte(false)}>{ authentification?.authentification.utilisateur?.prenom } { authentification?.authentification.utilisateur?.nom.toUpperCase() }&nbsp;<FontAwesomeIcon icon={faUser} style={{color: "#4b7bb4"}} /></p>
                </div>
            </nav>
            {
                afficher_compte ?
                <div style={{ position: 'absolute', top: '40px', right: '10px' }} onMouseEnter={() => set_afficher_compte(true)} onMouseLeave={() => set_afficher_compte(false)}>
                    <div style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '6px' }}>
                        <p>Mon compte</p>
                        <hr />
                        <ul>
                            <li><Link to="/home/compte">Changer mes informations</Link></li>
                            <li><Link to="/home/compte">Changer mon mail</Link></li>
                            <li><Link to="/home/compte">Changer mon mot de passe</Link></li>
                        </ul>
                        <hr />
                        <p onClick={deconnexion}>Me déconnecter</p>
                    </div>
                </div> : <></>
            }
        </>
    );
}

export default Navigation;