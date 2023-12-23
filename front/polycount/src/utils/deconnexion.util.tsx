import { SyntheticEvent } from "react";
import { AuthContextType } from "../providers/authentification.provider";
import { NavigateFunction } from "react-router-dom";

const deconnexion = async (e: SyntheticEvent | null, authentification: AuthContextType | null, navigate: NavigateFunction, retourner_a_connexion: boolean = true) => {
    e?.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    authentification?.set_authentification({ token: null, utilisateur: null, mot_de_passe: null });

    if (retourner_a_connexion)
        navigate('/connexion');
}

export default deconnexion;