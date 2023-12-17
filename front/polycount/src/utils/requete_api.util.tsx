import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const requete_api = async (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, body: any, afficher_erreur: boolean = true): Promise<AxiosResponse | AxiosError | null> => {
    const api_url: string = "http://localhost:8080";

    try {
        let reponse: AxiosResponse | null = null;
        switch (method) {
            case "GET": {
                reponse = await axios.get(api_url + url);
                break;
            }
            case "POST": {
                reponse = await axios.post(api_url + url, body);
                break;
            }
            case "PUT": {
                reponse = await axios.put(api_url + url, body);
                break;
            }
            case "PATCH": {
                reponse = await axios.patch(api_url + url, body);
                break;
            }
            case "DELETE": {
                reponse = await axios.delete(api_url + url);
                break;
            }
        }

        return reponse;
    } catch (erreur) {
        if (erreur instanceof AxiosError) {
            if (!afficher_erreur)
                return erreur;

            if (erreur.code == "ERR_NETWORK") {
                toast.error("Impossible de se connecter au serveur.");
            } else if (erreur.response && erreur.response.data) {
                if ('status' in erreur.response) {
                    if (erreur.response.status == 500) {
                        if ('message' in erreur.response.data) {
                            toast.error(erreur.response.data.message);
                        } else {
                            toast.error("Une erreur serveur est survenue.");
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