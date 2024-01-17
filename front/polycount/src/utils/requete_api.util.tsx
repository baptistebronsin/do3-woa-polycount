import axios, { AxiosError, AxiosResponse } from "axios";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { Suspension } from "../models/suspension.model";
import deconnexion from "./deconnexion.util";
import { AuthContextType } from "../providers/authentification.provider";

const requete_api = async (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, body: any, authentification: AuthContextType | null, navigate: NavigateFunction, afficher_erreur: boolean = true, second_essaie: boolean = false): Promise<AxiosResponse | AxiosError | null> => {
    const api_url: string = "http://10.112.0.142:8080";

    const headers: any = authentification ? { headers: { Authorization: `Bearer ${authentification.authentification.token}` }} : null;

    try {
        let reponse: AxiosResponse | null = null;
        switch (method) {
            case "GET": {
                reponse = await axios.get(api_url + url, headers);
                break;
            }
            case "POST": {
                reponse = await axios.post(api_url + url, body, headers);
                break;
            }
            case "PUT": {
                reponse = await axios.put(api_url + url, body, headers);
                break;
            }
            case "PATCH": {
                reponse = await axios.patch(api_url + url, body, headers);
                break;
            }
            case "DELETE": {
                reponse = await axios.delete(api_url + url, headers);
                break;
            }
        }

        return reponse;
    } catch (erreur) {
        if (erreur instanceof AxiosError) {
            if (!afficher_erreur)
                return erreur;

            if (erreur.code === "ERR_NETWORK") {
                toast.error("Impossible de se connecter au serveur.");
            } else if (second_essaie) {
                toast.warning("Votre session a expiré.");
                deconnexion(null, authentification, navigate, false);
                navigate('/connexion');
                return null;
            } else if (erreur.response && erreur.response.data) {
                if ('status' in erreur.response) {
                    if (erreur.response.status === 500) {
                        if ('message' in erreur.response.data) {
                            toast.error(erreur.response.data.message);
                        } else {
                            toast.error("Une erreur serveur est survenue.");
                        }
                    } else if (erreur.response.status === 403 && erreur.response.data.message === "Votre compte a été suspendu.") {
                        deconnexion(null, authentification, navigate, false);
                        navigate('/suspension', { state: { suspension: Suspension.from_JSON(erreur.response.data.data) } });
                        return null;
                    } else if (erreur.response.status === 401 && erreur.response.data.message === "Token erroné !") {
                        if (!authentification) {
                            navigate('/connexion');
                            return null;
                        }

                        const api_body: any = {
                            email: authentification.authentification.utilisateur?.email,
                            mot_de_passe: authentification.authentification.mot_de_passe
                        };
                
                        const reponse: AxiosResponse | AxiosError | null = await requete_api('POST', "/utilisateur/connexion", api_body, null, navigate, true);
                
                        console.log(reponse);

                        if (reponse && 'data' in reponse && reponse.data.token != null) {
                            const token_api: string = reponse.data.token;

                            try {
                                localStorage.removeItem('token');
                                localStorage.setItem('token', token_api);
                            } catch (erreur: any) {
                                toast.error("Impossible de stocker des informations dans le stockage du navigateur.");
                                deconnexion(null, authentification, navigate, false);
                                navigate('/connexion');
                                return null;
                            }
                            
                            authentification.set_authentification({ token: token_api, utilisateur: authentification.authentification.utilisateur, mot_de_passe: authentification.authentification.mot_de_passe });

                            return requete_api(method, url, body, { authentification: { token: token_api, utilisateur: authentification.authentification.utilisateur, mot_de_passe: authentification.authentification.mot_de_passe }, set_authentification : authentification.set_authentification }, navigate, true, true);
                        } else {
                            toast.warning("Votre session a expiré.");
                            deconnexion(null, authentification, navigate, false);
                            navigate('/connexion');
                            return null;
                        }
                    } else {
                        if ('message' in erreur.response.data) {
                            toast.warning(erreur.response.data.message);
                        } else {
                            toast.warning("Une erreur serveur est survenue.");
                        }
                    }
                } else {
                    toast.error("Le serveur n'a retourné aucun statut.");
                }
            } else {
                toast.error("Le serveur n'a retourné aucune donnée.");
            }
        } else {
            toast.error("Une erreur critique indéfinie est survenue.");
        }

        return null;
    }
}

export default requete_api;