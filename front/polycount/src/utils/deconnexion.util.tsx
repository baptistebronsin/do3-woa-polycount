import { SyntheticEvent } from "react";
import { AuthContextType } from "../providers/authentification.provider";
import { NavigateFunction } from "react-router-dom";

const deconnexion = async (e: SyntheticEvent, authentification: AuthContextType | null, navigate: NavigateFunction) => {
    e.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    authentification?.set_authentification({ token: null, utilisateur: null });

    navigate('/connexion');
}

export default deconnexion;