import { SyntheticEvent, useEffect } from "react";
import { AuthContextType, useAuth } from "../../providers/authentification.provider";
import { NavigateFunction, useNavigate } from "react-router-dom";

function Accueil() {
    const authentification: AuthContextType | null = useAuth();

    const navigate: NavigateFunction = useNavigate();

    useEffect(() => {
        if (!authentification || !authentification.authentification.token)
            navigate('/connexion');
    }, []);

    const deconnexion = async (e: SyntheticEvent) => {
        e.preventDefault();

        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        authentification?.set_authentification({ token: null, utilisateur: null });

        navigate('/connexion');
    }

    return (
    <>
        <h1>
            Bonjour <strong>{ authentification?.authentification.utilisateur?.genre } { authentification?.authentification.utilisateur?.prenom } { authentification?.authentification.utilisateur?.nom }</strong><br />
            Votre identifiant au sein de la base de données est <strong>{ authentification?.authentification.utilisateur?.pk_utilisateur_id }</strong><br />
            Votre email est <strong>{ authentification?.authentification.utilisateur?.email }</strong>
        </h1>
        <h1>
            Pour pouvoir intéragir avec le serveur et être identifié, voici votre token <strong>{ authentification?.authentification.token }</strong>
        </h1>
        <button className="full-button" onClick={deconnexion}>Déconnexion</button>
    </>
    );
}

export default Accueil;